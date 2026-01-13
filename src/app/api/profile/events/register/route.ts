import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromHeader } from '@/lib/auth';
import { assertSameOriginOrThrow, getIP, rateLimit } from '@/lib/security';
import { sendRegistrationConfirmation } from '@/lib/email';

type RegisterBody = {
  events?: string[];
  paymentId?: string;
  orderId?: string;
};

export async function POST(req: NextRequest) {
  try {
    assertSameOriginOrThrow(req);

    const session = await getSessionFromHeader(req as any);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 401 });
    }

    const ip = getIP(req);
    const rlKey = `register:${ip}:${userId}`;
    if (rateLimit(rlKey, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) as RegisterBody;
    const events = Array.isArray(body?.events) ? body.events.map((s) => String(s).trim()).filter(Boolean) : [];
    const paymentId = body?.paymentId ? String(body.paymentId) : null;
    const orderId = body?.orderId ? String(body.orderId) : null;

    const uniqueEvents = Array.from(new Set(events));
    if (uniqueEvents.length === 0) {
      return NextResponse.json({ error: 'Select at least one event' }, { status: 400 });
    }
    if (!paymentId || !orderId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    let totalAmount = 0;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Lock event rows to reduce oversell risk under concurrency.
      const placeholders = uniqueEvents.map(() => '?').join(',');
      const [eventRows] = (await conn.query(
        `SELECT name, price, ticket_limit AS ticketLimit, active FROM events WHERE name IN (${placeholders}) FOR UPDATE`,
        uniqueEvents,
      )) as any;

      const byName = new Map<string, any>();
      for (const r of eventRows as any[]) byName.set(String(r.name), r);

      for (const ev of uniqueEvents) {
        const row = byName.get(ev);
        if (!row) {
          await conn.rollback();
          return NextResponse.json({ error: `Event not found: ${ev}` }, { status: 404 });
        }
        const activeVal = row.active;
        const isActive =
          typeof activeVal === 'boolean'
            ? activeVal
            : typeof activeVal === 'number'
              ? activeVal !== 0
              : Buffer.isBuffer(activeVal)
                ? activeVal[0] !== 0
                : Boolean(activeVal);
        if (!isActive) {
          await conn.rollback();
          return NextResponse.json({ error: `Event inactive: ${ev}` }, { status: 400 });
        }

        const [[countRow]] = (await conn.query(
          'SELECT COUNT(*) AS sold FROM event_registrations WHERE event_name = ? FOR UPDATE',
          [ev],
        )) as any;

        const sold = Number(countRow?.sold ?? 0);
        const limit = row.ticketLimit == null ? null : Number(row.ticketLimit);
        if (limit != null && Number.isFinite(limit) && sold >= limit) {
          await conn.rollback();
          return NextResponse.json({ error: `Tickets sold out for ${ev}` }, { status: 409 });
        }

        const price = row.price == null ? null : Number(row.price);
        if (price != null && Number.isFinite(price)) totalAmount += price;
        await conn.query(
          'INSERT INTO event_registrations (created_at, event_name, order_id, payment_id, price, user_id) VALUES (NOW(6), ?, ?, ?, ?, ?)',
          [ev, orderId, paymentId, price, userId],
        );
      }

      await conn.commit();

      // Best-effort confirmation email (do not fail registration if email fails)
      try {
        const [[userRow]] = (await conn.query('SELECT name, email FROM users WHERE id = ?', [userId])) as any;
        const toEmail = String(userRow?.email || '').trim();
        if (toEmail) {
          await sendRegistrationConfirmation({
            toEmail,
            userName: userRow?.name ?? null,
            events: uniqueEvents,
            orderId,
            paymentId,
            totalAmount: Number.isFinite(totalAmount) ? Math.round(totalAmount) : null,
          });
        }
      } catch (mailErr) {
        console.warn('Registration email failed:', mailErr);
      }

      return NextResponse.json({ status: 'ok', count: uniqueEvents.length }, { status: 200 });
    } catch (e) {
      try {
        await conn.rollback();
      } catch {}
      throw e;
    } finally {
      conn.release();
    }
  } catch (err: any) {
    console.error('POST /api/profile/events/register error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Failed to save registrations' }, { status: 500 });
  }
}
