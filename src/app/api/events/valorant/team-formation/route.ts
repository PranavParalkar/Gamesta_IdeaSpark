import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { getSessionFromHeader } from '@/lib/auth';
import { assertSameOriginOrThrow, getIP, rateLimit } from '@/lib/security';

const EVENT_NAME = 'Valorant Tournament';
const ROLES = ['Sentinel', 'Controller', 'Duelist', 'Initiator'] as const;

type Role = (typeof ROLES)[number];

type RequestRow = {
  id: number;
  createdAt: string;
  eventName: string;
  kind: 'player' | 'team';
  roles: Role[];
  description: string;
  contact: string | null;
  status: 'open' | 'closed';
  createdByUserId: number;
};

function phase1Window(now: Date) {
  // Phase 1: 14-Jan to 31-Jan (local server time), current year.
  const y = now.getFullYear();
  const start = new Date(y, 0, 14, 0, 0, 0);
  const end = new Date(y, 0, 31, 23, 59, 59);
  return { start, end };
}

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS team_formation_requests (
      id BIGINT NOT NULL AUTO_INCREMENT,
      created_at DATETIME(6) NOT NULL,
      event_name VARCHAR(255) NOT NULL,
      kind VARCHAR(16) NOT NULL,
      roles_json TEXT NULL,
      description TEXT NOT NULL,
      contact VARCHAR(255) NULL,
      status VARCHAR(16) NOT NULL DEFAULT 'open',
      created_by_user_id BIGINT NOT NULL,
      PRIMARY KEY (id),
      INDEX idx_event_status_created (event_name, status, created_at),
      INDEX idx_created_by (created_by_user_id)
    )
  `);
}

const PostBody = z.object({
  kind: z.enum(['player', 'team']),
  roles: z
    .array(z.enum(ROLES))
    .min(1, 'Select at least one role')
    .max(4),
  description: z.string().trim().min(10, 'Add a bit more detail').max(1200),
  contact: z.string().trim().min(3).max(120).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await ensureTable();

    const ip = getIP(req);
    if (rateLimit(`valorant:team-formation:get:${ip}`, 60, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Optional auth: if logged in, include contact.
    const session = await getSessionFromHeader(req as any);
    const viewerUserId = session?.user?.id ? Number((session.user as any).id) : null;

    const rows = (await query(
      `SELECT id, created_at AS createdAt, event_name AS eventName, kind, roles_json AS rolesJson, description, contact, status, created_by_user_id AS createdByUserId
       FROM team_formation_requests
       WHERE event_name = ? AND status = 'open'
       ORDER BY created_at DESC
       LIMIT 200`,
      [EVENT_NAME],
    )) as any[];

    const data: RequestRow[] = (rows || []).map((r) => {
      let roles: Role[] = [];
      try {
        const parsed = JSON.parse(String(r.rolesJson || '[]'));
        if (Array.isArray(parsed)) roles = parsed.filter((x) => ROLES.includes(x));
      } catch {
        // ignore
      }

      const contact = viewerUserId ? (r.contact ? String(r.contact) : null) : null;

      return {
        id: Number(r.id),
        createdAt: new Date(r.createdAt).toISOString(),
        eventName: String(r.eventName),
        kind: String(r.kind) === 'team' ? 'team' : 'player',
        roles,
        description: String(r.description || ''),
        contact,
        status: String(r.status) === 'closed' ? 'closed' : 'open',
        createdByUserId: Number(r.createdByUserId),
      };
    });

    return NextResponse.json({ data, roles: ROLES }, { status: 200 });
  } catch (err: any) {
    console.error('GET /api/events/valorant/team-formation error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Failed to load team formation posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    assertSameOriginOrThrow(req);
    await ensureTable();

    const session = await getSessionFromHeader(req as any);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = Number((session.user as any).id);
    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Invalid user' }, { status: 401 });
    }

    const ip = getIP(req);
    if (rateLimit(`valorant:team-formation:post:${ip}:${userId}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const now = new Date();
    const { start, end } = phase1Window(now);
    if (now < start || now > end) {
      return NextResponse.json(
        { error: 'Phase 1 is closed. Team formation posts are available only from 14-Jan to 31-Jan.' },
        { status: 403 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = PostBody.safeParse(body);
    if (!parsed.success) {
      const msg = parsed.error.issues?.[0]?.message || 'Invalid request';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { kind, roles, description, contact } = parsed.data;

    await query(
      `INSERT INTO team_formation_requests (created_at, event_name, kind, roles_json, description, contact, status, created_by_user_id)
       VALUES (NOW(6), ?, ?, ?, ?, ?, 'open', ?)`,
      [EVENT_NAME, kind, JSON.stringify(roles), description, contact || null, userId],
    );

    return NextResponse.json({ status: 'ok' }, { status: 201 });
  } catch (err: any) {
    const status = err?.status ? Number(err.status) : 500;
    if (status !== 500) {
      return NextResponse.json({ error: err?.message || 'Request blocked' }, { status });
    }
    console.error('POST /api/events/valorant/team-formation error:', err && err.stack ? err.stack : err);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
