import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/admin';
import bcrypt from 'bcryptjs';
import { computeAdminInfo } from '../../../../lib/admin';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });
  try {
    let rows: any[] = [];
    try {
      rows = (await query('SELECT id, name, email, role, created_at AS createdAt FROM users ORDER BY id DESC')) as any[];
    } catch (e: any) {
      if (String((e as any)?.code || '').toUpperCase() === 'ER_BAD_FIELD_ERROR') {
        rows = (await query('SELECT id, name, email, created_at AS createdAt FROM users ORDER BY id DESC')) as any[];
      } else {
        throw e;
      }
    }
    const data = (rows || []).map((u) => {
      const admin = computeAdminInfo(u?.email || null, u?.role || null);
      return { ...u, role: admin.role, isAdmin: admin.isAdmin };
    });
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    const msg = process.env.NODE_ENV === 'production' ? 'Failed to fetch users' : e?.message || 'Failed to fetch users';
    return NextResponse.json({ error: msg }, { status: 500 });
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
    const roleInput = String(body?.role || 'USER').trim().toUpperCase();
    const validRoles = new Set(['USER', 'ADMIN', 'SUPER_ADMIN']);
    const role = validRoles.has(roleInput) ? roleInput : 'USER';

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = (await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email])) as any[];
    if (existing?.length) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

    const hash = await bcrypt.hash(password, 10);
    let ins: any;
    try {
      ins = (await query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name || null, email, hash, role])) as any;
    } catch (e: any) {
      if (String((e as any)?.code || '').toUpperCase() === 'ER_BAD_FIELD_ERROR') {
        ins = (await query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name || null, email, hash])) as any;
      } else {
        throw e;
      }
    }
    const id = ins?.insertId;
    let rows: any[] = [];
    try {
      rows = (await query('SELECT id, name, email, role, created_at AS createdAt FROM users WHERE id = ?', [id])) as any[];
    } catch (e: any) {
      if (String((e as any)?.code || '').toUpperCase() === 'ER_BAD_FIELD_ERROR') {
        rows = (await query('SELECT id, name, email, created_at AS createdAt FROM users WHERE id = ?', [id])) as any[];
      } else {
        throw e;
      }
    }
    const user = rows?.[0];
    const admin = computeAdminInfo(user?.email || null, user?.role || null);
    return NextResponse.json({ data: { ...user, role: admin.role, isAdmin: admin.isAdmin } }, { status: 201 });
  } catch (e: any) {
    const msg = process.env.NODE_ENV === 'production' ? 'Failed to create user' : e?.message || 'Failed to create user';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
