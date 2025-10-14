import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '../../../../lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function normalizeBaseUrl(url: string) {
  if (!url) return '';
  // strip trailing slash
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

// This endpoint expects the NextAuth session cookie to be present. It will
// upsert the user into the `users` table (if not present) and return the
// app's JWT token so the client can use the same auth flow as email/password.
export async function GET(req: NextRequest) {
  try {
    // Note: getSession won't work directly on the server using this import in app router.
    // Instead, NextAuth stores a session cookie; we rely on the session callback to set token info.
    // As a pragmatic approach, call NextAuth's session endpoint internally.
    let base = process.env.NEXTAUTH_URL || '';
    if (!base) {
      const host = req.headers.get('host');
      if (!host) return NextResponse.json({ error: 'Missing host header and NEXTAUTH_URL' }, { status: 500 });
      const proto = req.headers.get('x-forwarded-proto') || 'https';
      base = `${proto}://${host}`;
    }
    base = normalizeBaseUrl(base);
    if (!base) return NextResponse.json({ error: 'Unable to determine NEXTAUTH_URL' }, { status: 500 });

    const resp = await fetch(`${base}/api/auth/session`, {
      headers: { cookie: req.headers.get('cookie') || '' }
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => 'failed to read body');
      console.error('Failed to fetch NextAuth session', { base, status: resp.status, body: text });
      return NextResponse.json({ error: 'No session from NextAuth', details: text }, { status: 401 });
    }
    const session = await resp.json();
    const email = session?.user?.email;
    const name = session?.user?.name || (email ? email.split('@')[0] : null);
    if (!email) return NextResponse.json({ error: 'No email in session' }, { status: 400 });

    // upsert user
    try {
      const rows = await query('SELECT id FROM users WHERE email = ?', [email]);
      let userId: number;
      if ((rows as any[]).length === 0) {
        const ins = await query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
        userId = (ins as any).insertId;
      } else {
        userId = (rows as any[])[0].id;
      }
      const token = jwt.sign({ sub: String(userId), email }, JWT_SECRET, { expiresIn: '7d' });
      return NextResponse.json({ token, userId });
    } catch (e: any) {
      console.error('OAuth token error:', e && e.stack ? e.stack : e);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to get oauth token' }, { status: 500 });
  }
}
