import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET(_req: NextRequest) {
  try {
    const rows = (await query(
      `SELECT 
         (SELECT COUNT(*) FROM users) AS users,
         (SELECT COUNT(*) FROM ideas) AS ideas,
         (SELECT COUNT(*) FROM votes) AS votes,
         (SELECT COUNT(*) FROM votes WHERE vote = 1) AS upvotes`
    )) as any[];
    const row = rows?.[0] || { users: 0, ideas: 0, votes: 0, upvotes: 0 };
    return NextResponse.json({ data: row }, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/stats error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
