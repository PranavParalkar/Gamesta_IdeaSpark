import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';
import { getSessionFromHeader } from '../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromHeader(req as any);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const userId = Number(session.user.id);
    const rows = (await query('SELECT id, name, email FROM users WHERE id = ?', [userId])) as any[];
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = rows[0];
    return NextResponse.json({ user }, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/profile error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
