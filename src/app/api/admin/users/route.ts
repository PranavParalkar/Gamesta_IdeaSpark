import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/admin';
import bcrypt from 'bcryptjs';
import { computeAdminInfo } from '../../../../lib/admin';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    const rows = (await query('SELECT id, name, email, created_at AS createdAt FROM users ORDER BY id DESC')) as any[];
    const data = (rows || []).map((u) => {
      const admin = computeAdminInfo(u?.email || null);
      return { ...u, role: admin.role, isAdmin: admin.isAdmin };
    });
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    const body = await req.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = (await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email])) as any[];
    if (existing?.length) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    const ins = (await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name || null, email, hash])) as any;
    const id = ins?.insertId;
    const rows = (await query('SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?', [id])) as any[];
    const user = rows?.[0];
    const admin = computeAdminInfo(user?.email || null);
    return NextResponse.json({ data: { ...user, role: admin.role, isAdmin: admin.isAdmin } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
