import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getSession } from 'next-auth/react';
import { query } from '../../../../lib/db';
import { generateCsrfToken } from '../../../../lib/csrf';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// This endpoint expects the NextAuth session cookie to be present. It will
// upsert the user into the `users` table (if not present) and return the
// app's JWT token so the client can use the same auth flow as email/password.
export async function GET(req: NextRequest) {
  try {
    // Note: getSession won't work directly on the server using this import in app router.
    // Instead, NextAuth stores a session cookie; we rely on the session callback to set token info.
    // As a pragmatic approach, call NextAuth's session endpoint internally.
    // Always use the current request origin to ensure cookies are scoped correctly,
    // avoiding cross-origin session lookups when NEXTAUTH_URL points to production.
    const currentOrigin = `${req.nextUrl.protocol}//${req.headers.get('host')}`;
    const resp = await fetch(`${currentOrigin}/api/auth/session`, {
      headers: { cookie: req.headers.get('cookie') || '' }
    });
    if (!resp.ok) return NextResponse.json({ error: 'No session' }, { status: 401 });
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
      const csrfCookie = generateCsrfToken();
      const res = NextResponse.json({ token, userId, csrf: csrfCookie.split('.')[0] });
      const secureFlag = process.env.NODE_ENV === 'production';
      res.cookies.set('session', token, { httpOnly: true, sameSite: 'strict', secure: secureFlag, path: '/', maxAge: 60 * 60 * 24 * 7 });
      res.cookies.set('csrf_token', csrfCookie, { httpOnly: false, sameSite: 'strict', secure: secureFlag, path: '/', maxAge: 60 * 60 * 24 });
      return res;
    } catch (e: any) {
      console.error('OAuth token error:', e && e.stack ? e.stack : e);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to get oauth token' }, { status: 500 });
  }
}
