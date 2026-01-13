import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';

const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

export async function POST(req: NextRequest) {
  const headerSecret = req.headers.get('x-admin-secret') || req.headers.get('X-Admin-Secret') || '';
  if (!ADMIN_SECRET || headerSecret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const email: string | undefined = body?.email;
    const idStr: string | undefined = body?.id;
    const roleStr: string = (body?.role || 'ADMIN').toString();

    if ((!email || !email.trim()) && (!idStr || !idStr.trim())) {
      return NextResponse.json({ error: 'email or id required' }, { status: 400 });
    }

    let userRow: any = null;
    if (email && email.trim()) {
      const rows = (await query('SELECT id, email, role FROM users WHERE email = ?', [email])) as any[];
      if (rows.length) userRow = rows[0];
    } else {
      const id = Number(idStr);
      if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
      const rows = (await query('SELECT id, email, role FROM users WHERE id = ?', [id])) as any[];
      if (rows.length) userRow = rows[0];
    }

    if (!userRow) return NextResponse.json({ error: 'user not found' }, { status: 404 });

    const validRoles = new Set(['ADMIN', 'SUPER_ADMIN', 'USER']);
    const role = roleStr.toUpperCase();
    if (!validRoles.has(role)) return NextResponse.json({ error: 'invalid role' }, { status: 400 });

    await query('UPDATE users SET role = ? WHERE id = ?', [role, userRow.id]);
    return NextResponse.json({ status: 'updated', userId: userRow.id, role }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
