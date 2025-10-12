import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../../lib/db';
import { getSessionFromHeader } from '../../../../../lib/auth';

export async function POST(req: NextRequest, { params }: any) {
  try {
    const session = await getSessionFromHeader(req);
    if (!session) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    // idea id from URL has priority over body
    const body = await req.json().catch(() => ({}));
    const ideaId = Number(params?.id ?? body.ideaId ?? body.id ?? 0);
    const vote = Number(body.vote ?? 0);

    if (!ideaId || ![1, -1].includes(vote)) {
      return NextResponse.json({ error: 'Invalid payload: idea id and vote (1 or -1) required' }, { status: 400 });
    }

    // Helper to get aggregated stats for the idea
    async function getIdeaStats(id: number) {
      const stats = (await query(
        `SELECT COALESCE(SUM(v.vote),0) as score,
                COALESCE(SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END),0) as upvote_count,
                COUNT(v.id) as vote_count
         FROM votes v
         WHERE v.idea_id = ?`,
        [id]
      )) as any[];
      return stats[0] || { score: 0, upvote_count: 0, vote_count: 0 };
    }

    // Enforce one vote per user per idea. Toggle behavior:
    // - If same vote exists -> remove (unvote)
    // - If opposite vote exists -> update to new value
    // - If no vote -> insert
    const existing = (await query('SELECT id, vote FROM votes WHERE idea_id = ? AND voter_user_id = ?', [ideaId, session.user.id])) as any[];
    if (existing.length > 0) {
      const row = existing[0];
      const existingVote = Number(row.vote || 0);
      if (existingVote === vote) {
        // Idempotent: same vote already exists, no-op (do not remove). Prevent accidental score decrease.
        const stats = await getIdeaStats(ideaId);
        return NextResponse.json({ ok: true, unchanged: true, stats }, { status: 200 });
      } else {
        // Update to new vote
        await query('UPDATE votes SET vote = ? WHERE id = ?', [vote, row.id]);
        const stats = await getIdeaStats(ideaId);
        return NextResponse.json({ ok: true, updated: true, stats }, { status: 200 });
      }
    }

    // No existing vote, insert new
    const res = await query('INSERT INTO votes (idea_id, voter_user_id, vote) VALUES (?, ?, ?)', [ideaId, session.user.id, vote]);
    const stats = await getIdeaStats(ideaId);
    return NextResponse.json({ ok: true, inserted: true, id: (res as any).insertId, stats }, { status: 201 });
  } catch (err: any) {
    // Better error info for debugging (don't leak sensitive info in production)
    console.error('Vote route error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
