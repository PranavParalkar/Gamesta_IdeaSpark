import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/admin';

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

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    const rows = (await query(
      'SELECT id, active, created_at AS createdAt, name, price, ticket_limit AS ticketLimit FROM events ORDER BY id DESC'
    )) as any[];
    const data = (rows || []).map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price,
      ticketLimit: r.ticketLimit ?? null,
      createdAt: r.createdAt,
      active: bitToBool(r.active),
    }));
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim();
    const price = Number(body?.price || 0);
    const ticketLimit = body?.ticketLimit == null ? null : Number(body?.ticketLimit);
    const active = body?.active == null ? true : Boolean(body.active);
    if (!name || !Number.isFinite(price)) {
      return NextResponse.json({ error: 'Invalid name or price' }, { status: 400 });
    }

    const result = (await query(
      'INSERT INTO events (active, created_at, name, price, ticket_limit) VALUES (?, NOW(6), ?, ?, ?)',
      [active ? 1 : 0, name, price, ticketLimit]
    )) as any;
    const id = result?.insertId;
    const rows = (await query(
      'SELECT id, active, created_at AS createdAt, name, price, ticket_limit AS ticketLimit FROM events WHERE id = ?',
      [id]
    )) as any[];
    const r = rows?.[0];
    return NextResponse.json(
      {
        data: r
          ? {
              id: r.id,
              name: r.name,
              price: r.price,
              ticketLimit: r.ticketLimit ?? null,
              createdAt: r.createdAt,
              active: bitToBool(r.active),
            }
          : { id, name, price, ticketLimit, createdAt: null, active },
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
