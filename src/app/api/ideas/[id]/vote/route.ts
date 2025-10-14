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

    // Only upvotes (1) are supported. Downvotes are not allowed.
    if (!ideaId || vote !== 1) {
      return NextResponse.json({ error: 'Invalid payload: idea id and vote (1) required' }, { status: 400 });
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

    // Enforce one vote per user per idea. Toggle behavior for upvote:
    // - If same upvote exists -> remove (unvote)
    // - If no vote -> insert upvote
    const existing = (await query('SELECT id, vote FROM votes WHERE idea_id = ? AND voter_user_id = ?', [ideaId, session.user.id])) as any[];
    if (existing.length > 0) {
      const row = existing[0];
      const existingVote = Number(row.vote || 0);
      if (existingVote === 1) {
        // User already upvoted -> remove the vote (toggle off)
        await query('DELETE FROM votes WHERE id = ?', [row.id]);
        const stats = await getIdeaStats(ideaId);
        return NextResponse.json({ ok: true, removed: true, stats }, { status: 200 });
      } else {
        // Defensive: if some other value exists, normalize to upvote
        await query('UPDATE votes SET vote = 1 WHERE id = ?', [row.id]);
        const stats = await getIdeaStats(ideaId);
        return NextResponse.json({ ok: true, updated: true, stats }, { status: 200 });
      }
    }

    // No existing vote, insert new upvote
    const res = await query('INSERT INTO votes (idea_id, voter_user_id, vote) VALUES (?, ?, ?)', [ideaId, session.user.id, 1]);
    const stats = await getIdeaStats(ideaId);
    return NextResponse.json({ ok: true, inserted: true, id: (res as any).insertId, stats }, { status: 201 });
  } catch (err: any) {
    // Better error info for debugging (don't leak sensitive info in production)
    console.error('Vote route error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
