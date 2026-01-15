import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getSessionFromHeader } from '../../../lib/auth';
import { verifyCsrfToken } from '../../../lib/csrf';
import { z } from 'zod';

// Simple JSON body parser + validation using NextRequest.json()

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  let perPage = Number(url.searchParams.get('perPage') || '100');
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

  try {
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
  } catch (err: any) {
    // Common in local dev when MySQL isn't running or DB_* env vars point to an unreachable host.
    console.error('Error in GET /api/ideas:', err && err.stack ? err.stack : err);
    const code = err?.code ? String(err.code) : '';
    const status =
      code === 'ETIMEDOUT' || code === 'ECONNREFUSED' || code === 'ENOTFOUND' ? 503 : 500;
    const message =
      status === 503
        ? 'Database unavailable. Start MySQL and verify DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME.'
        : 'Internal server error';
    return NextResponse.json({ error: message }, { status });
  }
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
    // Enforce browser same-origin for CSRF hardening
    const origin = req.headers.get('origin');
    if (origin) {
      const host = new URL(req.url).host;
      try { const oh = new URL(origin).host; if (oh !== host) return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); } catch {}
    }

    const session = await getSessionFromHeader(req);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const bodyRaw = await req.json().catch(() => ({}));
    const ideaSchema = z.object({
      title: z.string().min(5).max(150),
      description: z.string().min(10).max(500),
      followedInstagram: z.boolean().optional()
    });
    const parsed = ideaSchema.safeParse(bodyRaw);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
    const body = parsed.data;
    const presentedCsrf = (req.headers.get('x-csrf-token') || '').trim();
    const csrfCookie = req.cookies.get('csrf_token')?.value || null;
    if (!verifyCsrfToken(csrfCookie, presentedCsrf)) {
      return NextResponse.json({ error: 'Invalid or missing CSRF token' }, { status: 403 });
    }
    const stripTags = (s: string) => s.replace(/<[^>]*>/g, '');
    const title = stripTags(body.title).trim();
    const description = stripTags(body.description).trim();
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
