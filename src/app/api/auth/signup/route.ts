import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getIP, rateLimit, assertSameOriginOrThrow } from '../../../../lib/security';
import { z } from 'zod';
import { generateCsrfToken } from '../../../../lib/csrf';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  // Block cross-origin browser posts and throttle abusive signups
  try { assertSameOriginOrThrow(req); } catch (e: any) { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }
  const ip = getIP(req);
  if (rateLimit(`signup:ip:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many sign up attempts. Try later.' }, { status: 429 });
  }

  const body = await req.json();
  const schema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(200)
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Allow only MITAOE college email addresses (mitaoe.ac.in)
  const mitaoeDomainRegex = /@mitaoe\.ac\.in$/i;
  if (!email || !emailRegex.test(email)) return NextResponse.json({ error: 'Please use a valid email address' }, { status: 400 });
  if (!mitaoeDomainRegex.test(email)) return NextResponse.json({ error: 'Please register with your MITAOE email (mitaoe.ac.in)' }, { status: 400 });
  // Ensure local-part is numeric PRN up to 12 digits
  const localPart = email.split('@')[0] || '';
  const prnRegex = /^\d{12}$/; // exactly 12 digits
  if (!prnRegex.test(localPart)) return NextResponse.json({ error: 'Please use your 12-digit numeric PRN as the email local-part' }, { status: 400 });
  // Year constraint: first 4 digits must be between 2022 and 2025 inclusive
  const prnYear = localPart.substring(0,4);
  if (!/^\d{4}$/.test(prnYear) || Number(prnYear) < 2022 || Number(prnYear) > 2025) {
    return NextResponse.json({ error: 'PRN must start with a year between 2022 and 2025' }, { status: 400 });
  }
  if (!name || name.length < 2 || name.length > 100) return NextResponse.json({ error: 'Please provide your full name' }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

  try {
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const ins = await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name || null, email, hash]);
    const userId = (ins as any).insertId;
    const token = jwt.sign({ sub: String(userId), email }, JWT_SECRET, { expiresIn: '7d' });
    const csrfCookie = generateCsrfToken();
    const res = NextResponse.json({ token, userId, csrf: csrfCookie.split('.')[0] });
    res.cookies.set('session', token, { httpOnly: true, sameSite: 'strict', secure: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
    // Non-HttpOnly so client JS can read and send header; value includes signature
    res.cookies.set('csrf_token', csrfCookie, { httpOnly: false, sameSite: 'strict', secure: true, path: '/', maxAge: 60 * 60 * 24 });
    return res;
  } catch (e: any) {
    console.error('Signup error:', e && e.stack ? e.stack : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
