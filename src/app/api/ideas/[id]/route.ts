import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { getSessionFromHeader } from '../../../../lib/auth';

// Helper to ensure the current user owns the idea
async function ensureOwnership(ideaId: number, userId: number) {
  const rows = (await query('SELECT id, user_id FROM ideas WHERE id = ?', [ideaId])) as any[];
  if (!rows || rows.length === 0) return { ok: false, status: 404, error: 'Idea not found' } as const;
  const ownerId = Number(rows[0].user_id);
  if (ownerId !== Number(userId)) return { ok: false, status: 403, error: 'Not authorized to modify this idea' } as const;
  return { ok: true } as const;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromHeader(req as any);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const ideaId = Number(params.id);
    if (!ideaId) return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const title = (body.title || '').toString().trim();
    const description = (body.description || '').toString().trim();
    if (!title || title.length < 5) return NextResponse.json({ error: 'Title too short' }, { status: 400 });
    if (!description || description.length < 10) return NextResponse.json({ error: 'Description too short' }, { status: 400 });
    if (description.length > 500) return NextResponse.json({ error: 'Description too long (max 500 characters)' }, { status: 400 });

    const own = await ensureOwnership(ideaId, Number(session.user.id));
    if (!own.ok) return NextResponse.json({ error: own.error }, { status: own.status });

    await query('UPDATE ideas SET title = ?, description = ? WHERE id = ?', [title, description, ideaId]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('PATCH /api/ideas/[id] error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromHeader(req as any);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    const ideaId = Number(params.id);
    if (!ideaId) return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 });

    const own = await ensureOwnership(ideaId, Number(session.user.id));
    if (!own.ok) return NextResponse.json({ error: own.error }, { status: own.status });

    // Delete votes first to avoid FK constraints (if any), then delete idea
    await query('DELETE FROM votes WHERE idea_id = ?', [ideaId]);
    await query('DELETE FROM ideas WHERE id = ?', [ideaId]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('DELETE /api/ideas/[id] error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
