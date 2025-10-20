import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getSessionFromHeader } from '../../../lib/auth';

// Simple JSON body parser + validation using NextRequest.json()

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  let perPage = Number(url.searchParams.get('perPage') || '10');
  if (!Number.isFinite(perPage) || perPage <= 0) perPage = 10;
  perPage = Math.min(50, Math.floor(perPage));
  let offset = (page - 1) * perPage;
  if (!Number.isFinite(offset) || offset < 0) offset = 0;

  // Some MySQL setups do not accept prepared params for LIMIT/OFFSET. Inline validated integers.
  // If the request includes an Authorization header we try to resolve the session
  // and include whether the current user has voted on each idea (voted_by_you).
  let userId: number | null = null;
  try {
    const session = await getSessionFromHeader(req as any);
    if (session && session.user && session.user.id) userId = Number(session.user.id);
  } catch (e) {
    userId = null;
  }

  let rows: any[] = [];
  if (userId) {
    rows = await query(
      `SELECT i.id, i.title, i.description, i.created_at,
         COALESCE(SUM(v.vote),0) as score, COUNT(v.id) as vote_count,
         MAX(CASE WHEN vu.voter_user_id = ? AND vu.vote = 1 THEN 1 ELSE 0 END) as voted_by_you
       FROM ideas i
       LEFT JOIN votes v ON v.idea_id = i.id
       LEFT JOIN votes vu ON (vu.idea_id = i.id AND vu.voter_user_id = ?)
       GROUP BY i.id
       ORDER BY score DESC, vote_count DESC
       LIMIT ${perPage} OFFSET ${offset}`,
      [userId, userId]
    );
  } else {
    rows = await query(
      `SELECT i.id, i.title, i.description, i.created_at, COALESCE(SUM(v.vote),0) as score, COUNT(v.id) as vote_count, 0 as voted_by_you
       FROM ideas i
       LEFT JOIN votes v ON v.idea_id = i.id
       GROUP BY i.id
       ORDER BY score DESC, vote_count DESC
       LIMIT ${perPage} OFFSET ${offset}`
    );
  }

  return new Response(JSON.stringify({ data: rows }), { status: 200 });
}

// In-memory rate limit map: ip -> [timestamps]
const RATE_LIMIT_MAP = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string) {
  const now = Date.now();
  const arr = RATE_LIMIT_MAP.get(ip) || [];
  const filtered = arr.filter((t) => now - t < RATE_LIMIT_WINDOW);
  filtered.push(now);
  RATE_LIMIT_MAP.set(ip, filtered);
  return filtered.length > RATE_LIMIT_MAX;
}

function getIP(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  return req.headers.get('host') || 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  if (isRateLimited(ip)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  try {
    const session = await getSessionFromHeader(req);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const title = (body.title || '').toString().trim();
    const description = (body.description || '').toString().trim();
  const followedInstagram = !!body.followedInstagram;

    if (!title || title.length < 5) return NextResponse.json({ error: 'Title too short' }, { status: 400 });
  if (!description || description.length < 10) return NextResponse.json({ error: 'Description too short' }, { status: 400 });
  if (description.length > 500) return NextResponse.json({ error: 'Description too long (max 500 characters)' }, { status: 400 });
  if (!followedInstagram) return NextResponse.json({ error: 'You must follow our Instagram account before submitting an idea' }, { status: 400 });

    const res = await query(
      'INSERT INTO ideas (user_id, title, description) VALUES (?, ?, ?)',
      [session.user.id || null, title, description]
    );

    return NextResponse.json({ ok: true, id: (res as any).insertId }, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/ideas:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
