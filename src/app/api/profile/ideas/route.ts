import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { getSessionFromHeader } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromHeader(req as any);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const userId = session.user.id;

    // Fetch user's ideas with aggregated stats
    const rows = (await query(
      `SELECT i.id, i.title, i.description, i.created_at, COALESCE(SUM(v.vote),0) as score, 
              COALESCE(SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END),0) as upvote_count,
              COUNT(v.id) as vote_count
       FROM ideas i
       LEFT JOIN votes v ON v.idea_id = i.id
       WHERE i.user_id = ?
       GROUP BY i.id
       ORDER BY score DESC, vote_count DESC`,
      [userId]
    )) as any[];

    // Fetch all ideas' aggregated scores and compute rank mapping in JS.
    // This avoids using window functions and per-idea subqueries which may fail on older MySQL.
    const allRows = (await query(
      `SELECT i.id, COALESCE(SUM(v.vote),0) as score, COUNT(v.id) as vote_count
       FROM ideas i
       LEFT JOIN votes v ON v.idea_id = i.id
       GROUP BY i.id
       ORDER BY score DESC, vote_count DESC`
    )) as any[];

    const rankMap: Record<number, number> = {};
    let lastScore: number | null = null;
    let lastVoteCount: number | null = null;
    let rank = 0;
    let position = 0;
    for (const a of allRows) {
      position += 1;
      const s = Number(a.score ?? 0);
      const vc = Number(a.vote_count ?? 0);
      if (lastScore === null || s !== lastScore || vc !== lastVoteCount) {
        rank = position; // assign new rank at this position
        lastScore = s;
        lastVoteCount = vc;
      }
      rankMap[Number(a.id)] = rank;
    }

    const data = rows.map((r) => ({ ...r, rank: rankMap[Number(r.id)] ?? null }));

    return NextResponse.json({ data }, { status: 200 });
  } catch (err: any) {
    console.error('Error in GET /api/profile/ideas:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
