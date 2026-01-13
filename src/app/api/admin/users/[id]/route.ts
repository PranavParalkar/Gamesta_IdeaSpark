import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/admin';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  try {
    // Cascade deletions similar to Spring Boot
    try { await query('DELETE FROM auth_tokens WHERE user_id = ?', [id]); } catch {}
    try { await query('DELETE FROM event_registrations WHERE user_id = ?', [id]); } catch {}
    try { await query('DELETE FROM votes WHERE voter_user_id = ?', [id]); } catch {}
    try { await query('DELETE FROM comments WHERE author_id = ?', [id]); } catch {}

    // Delete ideas authored by user and their related votes/comments
    try {
      const ideas = (await query('SELECT id FROM ideas WHERE user_id = ?', [id])) as any[];
      for (const row of ideas) {
        const ideaId = row.id;
        try { await query('DELETE FROM votes WHERE idea_id = ?', [ideaId]); } catch {}
        try { await query('DELETE FROM comments WHERE idea_id = ?', [ideaId]); } catch {}
        await query('DELETE FROM ideas WHERE id = ?', [ideaId]);
      }
    } catch {}

    await query('DELETE FROM users WHERE id = ?', [id]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
