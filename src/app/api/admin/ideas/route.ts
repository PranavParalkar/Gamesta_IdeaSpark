import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/admin';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    const rows = (await query(
      `SELECT i.id,
              i.user_id AS userId,
              u.name AS userName,
              u.email AS userEmail,
              i.title,
              i.description,
              i.created_at AS createdAt,
              i.updated_at AS updatedAt,
              i.is_public AS isPublic,
              COALESCE(SUM(v.vote), 0) AS score,
              COALESCE(SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END), 0) AS upvoteCount
         FROM ideas i
         LEFT JOIN users u ON u.id = i.user_id
         LEFT JOIN votes v ON v.idea_id = i.id
         GROUP BY i.id, i.user_id, u.name, u.email, i.title, i.description, i.created_at, i.updated_at, i.is_public
         ORDER BY i.id DESC`
    )) as any[];
    return NextResponse.json({ data: rows || [] }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    const body = await req.json();
    const title = String(body?.title || '').trim();
    const description = String(body?.description || '').trim();
    const userId = Number(body?.userId);
    const isPublic = body?.isPublic == null ? 1 : body?.isPublic ? 1 : 0;
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    if (!Number.isFinite(userId)) return NextResponse.json({ error: 'Valid userId required' }, { status: 400 });

    const userRows = (await query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId])) as any[];
    if (!userRows?.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const ins = (await query('INSERT INTO ideas (user_id, title, description, is_public) VALUES (?, ?, ?, ?)', [userId, title, description || null, isPublic])) as any;
    const id = ins?.insertId;
    const rows = (await query(
      `SELECT i.id,
              i.user_id AS userId,
              u.name AS userName,
              u.email AS userEmail,
              i.title,
              i.description,
              i.created_at AS createdAt,
              i.updated_at AS updatedAt,
              i.is_public AS isPublic,
              COALESCE(SUM(v.vote), 0) AS score,
              COALESCE(SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END), 0) AS upvoteCount
         FROM ideas i
         LEFT JOIN users u ON u.id = i.user_id
         LEFT JOIN votes v ON v.idea_id = i.id
         WHERE i.id = ?
         GROUP BY i.id, i.user_id, u.name, u.email, i.title, i.description, i.created_at, i.updated_at, i.is_public`,
      [id]
    )) as any[];
    return NextResponse.json({ data: rows?.[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create idea' }, { status: 500 });
  }
}
