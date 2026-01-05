import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET() {
  const diagnostics: any = {
    connected: false,
    tables: {
      users: false,
      ideas: false,
      votes: false
    },
    error: null
  };
  try {
    // Simple connectivity test
    await query('SELECT 1');
    diagnostics.connected = true;

    // Check if required tables exist in current database
    try {
      const rows = await query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('users','ideas','votes')`
      ) as any[];
      const names = new Set(rows.map((r: any) => r.table_name));
      diagnostics.tables.users = names.has('users');
      diagnostics.tables.ideas = names.has('ideas');
      diagnostics.tables.votes = names.has('votes');
    } catch (e: any) {
      diagnostics.error = `Failed to inspect tables: ${e?.message || e}`;
    }

    return NextResponse.json({ ok: true, diagnostics }, { status: 200 });
  } catch (err: any) {
    diagnostics.error = err?.message || String(err);
    return NextResponse.json({ ok: false, diagnostics }, { status: 500 });
  }
}
