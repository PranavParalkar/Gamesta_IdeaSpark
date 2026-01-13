import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSessionFromHeader } from '@/lib/auth';
import { assertSameOriginOrThrow } from '@/lib/security';

const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET || '';

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    assertSameOriginOrThrow(req);

    // Require a valid session token for verification calls from the client
    const session = await getSessionFromHeader(req as any);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, string>;
    const razorpayPaymentId = body.razorpay_payment_id;
    const razorpayOrderId = body.razorpay_order_id;
    const razorpaySignature = body.razorpay_signature;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: 'missing parameters' }, { status: 400 });
    }

    if (!RAZORPAY_SECRET) {
      return NextResponse.json({ error: 'Razorpay secret not configured on server' }, { status: 500 });
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expected = crypto.createHmac('sha256', RAZORPAY_SECRET).update(payload).digest('hex');

    if (!safeEqualHex(expected, razorpaySignature)) {
      return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
    }

    return NextResponse.json({ status: 'ok', paymentId: razorpayPaymentId, orderId: razorpayOrderId }, { status: 200 });
  } catch (err: any) {
    const status = Number(err?.status) || 500;
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status });
  }
}
