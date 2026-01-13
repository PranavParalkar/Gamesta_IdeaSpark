import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { requireAdmin } from '../../../../../lib/admin';

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    await query('SET FOREIGN_KEY_CHECKS = 0');
    try { await query('TRUNCATE TABLE event_registrations'); } catch {}
    try { await query('TRUNCATE TABLE registrations'); } catch {}
    await query('TRUNCATE TABLE ideas');
    await query('TRUNCATE TABLE events');
    await query('TRUNCATE TABLE users');
    await query('SET FOREIGN_KEY_CHECKS = 1');
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to clear database' }, { status: 500 });
  }
}
