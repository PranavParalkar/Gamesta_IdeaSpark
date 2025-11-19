import { NextRequest } from 'next/server';

// In-memory token bucket per key (IP, user, endpoint). Note: per-instance only.
const BUCKETS = new Map<string, number[]>();

export function getIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const real = req.headers.get('x-real-ip');
  if (real) return real;
  return req.headers.get('host') || 'unknown';
}

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = BUCKETS.get(key) || [];
  const filtered = arr.filter((t) => now - t < windowMs);
  filtered.push(now);
  BUCKETS.set(key, filtered);
  return filtered.length > max;
}

export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true; // Non-browser or same-origin fetch without Origin
  try {
    const o = new URL(origin);
    const host = req.nextUrl.host;
    return o.host === host;
  } catch {
    return false;
  }
}

export function assertSameOriginOrThrow(req: NextRequest) {
  if (!isSameOrigin(req)) {
    const e: any = new Error('Cross-origin request not allowed');
    e.status = 403;
    throw e;
  }
}
