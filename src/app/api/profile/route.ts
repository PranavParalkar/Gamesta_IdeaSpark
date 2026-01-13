import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getSessionFromHeader } from '../../../lib/auth';
import { computeAdminInfo } from '../../../lib/admin';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromHeader(req as any);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const userId = Number(session.user.id);
    let user: any = null;
    try {
      const rows = (await query('SELECT id, name, email FROM users WHERE id = ?', [userId])) as any[];
      if (rows && rows.length > 0) user = rows[0];
    } catch {}
    // Fallback to session payload if DB lookup failed
    if (!user) user = { id: userId, name: (session.user as any)?.name || null, email: (session.user as any)?.email || null };

    const adminInfo = computeAdminInfo(user?.email || null);
    const responseUser = { ...user, isAdmin: adminInfo.isAdmin, role: adminInfo.role };
    return NextResponse.json({ user: responseUser }, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/profile error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
