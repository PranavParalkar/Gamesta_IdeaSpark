import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { requireAdmin } from '../../../../lib/admin';

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.message }, { status: gate.status });

  try {
    const db = (await query('SELECT DATABASE() AS db')) as any[];
    const user = (await query('SELECT USER() AS user')) as any[];
    const host = (await query('SELECT @@hostname AS host')) as any[];
    const counts = {
      users: (await query('SELECT COUNT(*) AS c FROM users')) as any[],
      ideas: (await query('SELECT COUNT(*) AS c FROM ideas')) as any[],
      votes: (await query('SELECT COUNT(*) AS c FROM votes')) as any[],
    };

    return NextResponse.json(
      {
        database: db?.[0]?.db ?? null,
        dbUser: user?.[0]?.user ?? null,
        dbHost: host?.[0]?.host ?? null,
        counts: {
          users: counts.users?.[0]?.c ?? 0,
          ideas: counts.ideas?.[0]?.c ?? 0,
          votes: counts.votes?.[0]?.c ?? 0,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ error: 'Diagnostics failed' }, { status: 500 });
  }
}
