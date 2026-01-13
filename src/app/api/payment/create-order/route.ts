import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromHeader } from '@/lib/auth';
import { assertSameOriginOrThrow } from '@/lib/security';

const RAZORPAY_KEY = process.env.RAZORPAY_KEY || '';
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    assertSameOriginOrThrow(req);

    const session = await getSessionFromHeader(req as any);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as { total?: number };
    const total = Number(body?.total ?? 0);
    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: 'Invalid total amount' }, { status: 400 });
    }

    if (!RAZORPAY_KEY || !RAZORPAY_SECRET) {
      return NextResponse.json({ error: 'Razorpay keys not configured on server' }, { status: 500 });
    }

    const amountPaise = Math.round(total * 100);

    const basicAuth = Buffer.from(`${RAZORPAY_KEY}:${RAZORPAY_SECRET}`).toString('base64');
    const resp = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: 'INR',
        payment_capture: 1,
      }),
    });

    const respText = await resp.text();
    let respJson: any = null;
    try {
      respJson = JSON.parse(respText);
    } catch {
      // ignore
    }

    if (!resp.ok) {
      return NextResponse.json(
        { error: 'failed to create order', details: respJson ?? respText },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        orderId: respJson?.id,
        amount: respJson?.amount,
        currency: respJson?.currency,
        key: RAZORPAY_KEY,
      },
      { status: 200 },
    );
  } catch (err: any) {
    const status = Number(err?.status) || 500;
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status });
  }
}
