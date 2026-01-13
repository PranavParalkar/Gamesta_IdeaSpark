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
    // Cascade: delete votes and comments linked to idea, then the idea
    try { await query('DELETE FROM votes WHERE idea_id = ?', [id]); } catch {}
    try { await query('DELETE FROM comments WHERE idea_id = ?', [id]); } catch {}
    await query('DELETE FROM ideas WHERE id = ?', [id]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete idea' }, { status: 500 });
  }
}
