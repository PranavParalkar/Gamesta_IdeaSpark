import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getIP, rateLimit, assertSameOriginOrThrow } from '../../../../lib/security';
import { z } from 'zod';
import { generateCsrfToken } from '../../../../lib/csrf';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const SALT_ROUNDS = 10;

// This endpoint supports sign-in with email+password. If the email does not exist,
// we create a new user with the provided password (signup-on-first-use).
export async function POST(req: NextRequest) {
  try { assertSameOriginOrThrow(req); } catch (e: any) { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }
  const ip = getIP(req);
  const body = await req.json();
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(200)
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
  const { email, password } = parsed.data;

  // Throttle brute force attempts: per-IP and per-identity
  if (rateLimit(`signin:ip:${ip}`, 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait and try again.' }, { status: 429 });
  }
  if (rateLimit(`signin:acct:${email}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many login attempts for this account. Try later.' }, { status: 429 });
  }

  try {
    const dbRes = await query('SELECT id, password FROM users WHERE email = ?', [email]);
    if ((dbRes as any[]).length === 0) {
      // Do NOT auto-create accounts during signin. Require explicit signup flow.
      return NextResponse.json({ error: 'No account found for this email. Please sign up first.' }, { status: 404 });
    }
    // User exists: verify password
    const row = (dbRes as any[])[0];
    const hashed = row.password;
    if (!hashed) return NextResponse.json({ error: 'Account exists without password' }, { status: 400 });
    const ok = await bcrypt.compare(password, hashed);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = jwt.sign({ sub: String(row.id), email }, JWT_SECRET, { expiresIn: '7d' });
    const csrfCookie = generateCsrfToken();
    const response = NextResponse.json({ token, userId: row.id, csrf: csrfCookie.split('.')[0] });
    response.cookies.set('session', token, { httpOnly: true, sameSite: 'strict', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    response.cookies.set('csrf_token', csrfCookie, { httpOnly: false, sameSite: 'strict', secure: true, path: '/', maxAge: 60 * 60 * 24 });
    return response;
  } catch (e: any) {
    console.error('Signin error:', e && e.stack ? e.stack : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
