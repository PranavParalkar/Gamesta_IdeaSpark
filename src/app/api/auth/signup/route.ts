import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim().toLowerCase();
  const password = (body.password || '').toString();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Allow only MITAOE college email addresses (mitaoe.ac.in)
  const mitaoeDomainRegex = /@mitaoe\.ac\.in$/i;
  if (!email || !emailRegex.test(email)) return NextResponse.json({ error: 'Please use a valid email address' }, { status: 400 });
  if (!mitaoeDomainRegex.test(email)) return NextResponse.json({ error: 'Please register with your MITAOE email (mitaoe.ac.in)' }, { status: 400 });
  // Ensure local-part is numeric PRN up to 12 digits
  const localPart = email.split('@')[0] || '';
  const prnRegex = /^\d{12}$/; // exactly 12 digits
  if (!prnRegex.test(localPart)) return NextResponse.json({ error: 'Please use your 12-digit numeric PRN as the email local-part' }, { status: 400 });
  if (!name || name.length === 0) return NextResponse.json({ error: 'Please provide your full name' }, { status: 400 });
  if (!password || password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });

  try {
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if ((existing as any[]).length > 0) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const ins = await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name || null, email, hash]);
    const userId = (ins as any).insertId;
    const token = jwt.sign({ sub: String(userId), email }, JWT_SECRET, { expiresIn: '7d' });
    return NextResponse.json({ token, userId });
  } catch (e: any) {
    console.error('Signup error:', e && e.stack ? e.stack : e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
