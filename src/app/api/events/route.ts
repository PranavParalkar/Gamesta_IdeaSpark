import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

function bitToBool(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (value && typeof value === 'object') {
    // mysql2 returns BIT(1) as Buffer
    if (typeof (value as any).length === 'number' && (value as any).length > 0) {
      const first = (value as any)[0];
      if (typeof first === 'number') return first !== 0;
    }
  }
  return false;
}

export async function GET() {
  try {
    const rows = (await query(
      `SELECT 
        e.id,
        e.active,
        e.created_at AS createdAt,
        e.name,
        e.price,
        e.ticket_limit AS ticketLimit,
        (SELECT COUNT(*) FROM event_registrations r WHERE r.event_name = e.name) AS ticketsSold
      FROM events e
      WHERE e.active = 1
      ORDER BY e.name ASC`
    )) as any[];

    const data = (rows || []).map((r) => {
      const ticketsSold = Number(r.ticketsSold ?? 0);
      const ticketLimit = r.ticketLimit ?? null;
      const limitNum = ticketLimit == null ? null : Number(ticketLimit);
      const remaining = limitNum == null || !Number.isFinite(limitNum) ? null : Math.max(0, limitNum - ticketsSold);

      return {
        id: r.id,
        name: r.name,
        price: r.price,
        ticketLimit,
        ticketsSold,
        remaining,
        createdAt: r.createdAt,
        active: bitToBool(r.active),
      };
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
