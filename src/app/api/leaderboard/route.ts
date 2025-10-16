import { NextRequest } from 'next/server';
import { query } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  let limit = Number(url.searchParams.get('limit') || '10');
  if (!Number.isFinite(limit) || limit <= 0) limit = 10;
  limit = Math.min(100, Math.floor(limit));

  // Rank by number of upvotes (vote = 1). Tiebreaker: total score then vote_count.
  const rows = await query(
    `SELECT i.id, i.title, i.description, u.name as author_name,
       COALESCE(SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END),0) as upvote_count,
       COALESCE(SUM(v.vote),0) as score,
       COUNT(v.id) as vote_count
     FROM ideas i
     LEFT JOIN users u ON u.id = i.user_id
     LEFT JOIN votes v ON v.idea_id = i.id
     GROUP BY i.id
     ORDER BY upvote_count DESC, score DESC, vote_count DESC
     LIMIT ${limit}`
  );

  return new Response(JSON.stringify({ data: rows }), { status: 200 });
}
