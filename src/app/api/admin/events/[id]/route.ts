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
    await query('DELETE FROM events WHERE id = ?', [id]);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
