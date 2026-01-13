import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/admin';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    const ideas = await query('SELECT COUNT(*) AS c FROM ideas');
    const events = await query('SELECT COUNT(*) AS c FROM events');
    const regs = await query('SELECT COUNT(*) AS c FROM event_registrations');
    const i = Array.isArray(ideas) ? (ideas as any[])[0]?.c || 0 : 0;
    const e = Array.isArray(events) ? (events as any[])[0]?.c || 0 : 0;
    const r = Array.isArray(regs) ? (regs as any[])[0]?.c || 0 : 0;
    return NextResponse.json({ ideas: i, events: e, registrations: r }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
