import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const SALT_ROUNDS = 10;

// This endpoint supports sign-in with email+password. If the email does not exist,
// we create a new user with the provided password (signup-on-first-use).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim().toLowerCase();
  const password = (body.password || '').toString();
  if (!email || !email.includes('@')) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

  try {
    const res = await query('SELECT id, password FROM users WHERE email = ?', [email]);
    if ((res as any[]).length === 0) {
      // If user not found, create an account (signup-on-first-use)
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      const ins = await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name || null, email, hash]);
      const userId = (ins as any).insertId;
      const token = jwt.sign({ sub: String(userId), email }, JWT_SECRET, { expiresIn: '7d' });
      return NextResponse.json({ token, userId });
    }
    // User exists: verify password
    const row = (res as any[])[0];
    const hashed = row.password;
    if (!hashed) return NextResponse.json({ error: 'Account exists without password' }, { status: 400 });
    const ok = await bcrypt.compare(password, hashed);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    const token = jwt.sign({ sub: String(row.id), email }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token, userId: row.id });
  } catch (e: any) {
    console.error('Signin error:', e && e.stack ? e.stack : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
