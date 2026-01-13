import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/admin';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    const rows = (await query(
      `SELECT r.id,
              r.created_at AS createdAt,
              r.event_name AS eventName,
              r.order_id AS orderId,
              r.payment_id AS paymentId,
              r.price AS price,
              r.user_id AS userId,
              u.email AS userEmail,
              u.name AS userName
         FROM event_registrations r
         LEFT JOIN users u ON u.id = r.user_id
         ORDER BY r.id DESC`
    )) as any[];
    const data = (rows || []).map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      eventName: r.eventName,
      userId: r.userId,
      orderId: r.orderId ?? null,
      paymentId: r.paymentId ?? null,
      price: r.price ?? null,
      user: { email: r.userEmail, name: r.userName }
    }));
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch registrations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    const body = await req.json();
    const eventName = String(body?.eventName || '').trim();
    const orderId = body?.orderId == null ? null : String(body.orderId).trim();
    const paymentId = body?.paymentId == null ? null : String(body.paymentId).trim();
    const price = body?.price == null ? null : Number(body.price);
    const userId = body?.userId == null ? null : Number(body.userId);

    if (!eventName) return NextResponse.json({ error: 'eventName is required' }, { status: 400 });
    if (price != null && !Number.isFinite(price)) return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    if (userId != null && !Number.isFinite(userId)) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });

    if (userId != null) {
      const userRows = (await query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId])) as any[];
      if (!userRows?.length) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const ins = (await query(
      'INSERT INTO event_registrations (created_at, event_name, order_id, payment_id, price, user_id) VALUES (NOW(6), ?, ?, ?, ?, ?)',
      [eventName, orderId, paymentId, price, userId]
    )) as any;
    const id = ins?.insertId;
    const rows = (await query(
      `SELECT r.id,
              r.created_at AS createdAt,
              r.event_name AS eventName,
              r.order_id AS orderId,
              r.payment_id AS paymentId,
              r.price AS price,
              r.user_id AS userId,
              u.email AS userEmail,
              u.name AS userName
         FROM event_registrations r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.id = ?`,
      [id]
    )) as any[];
    const r = rows?.[0];
    return NextResponse.json(
      {
        data: {
          id: r?.id ?? id,
          createdAt: r?.createdAt,
          eventName: r?.eventName,
          orderId: r?.orderId ?? null,
          paymentId: r?.paymentId ?? null,
          price: r?.price ?? null,
          userId: r?.userId ?? null,
          user: { email: r?.userEmail, name: r?.userName },
        },
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create registration' }, { status: 500 });
  }
}
