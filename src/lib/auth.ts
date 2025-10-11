import jwt from 'jsonwebtoken';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export async function getSessionFromHeader(req: any) {
  try {
    const auth = req.headers?.get ? req.headers.get('authorization') : req.headers['authorization'];
    if (!auth) return null;
    const m = auth.split(' ');
    if (m.length !== 2) return null;
    const token = m[1];
    const payload: any = jwt.verify(token, JWT_SECRET);
    if (!payload || !payload.sub) return null;
    // Optionally fetch user from DB — if DB unavailable, return the payload so guest tokens still work
    try {
      const rows = await query('SELECT id, name, email FROM users WHERE id = ?', [payload.sub]);
      if ((rows as any[]).length === 0) return { user: { id: payload.sub, email: payload.email || null }, token };
      return { user: (rows as any[])[0], token };
    } catch (e) {
      return { user: { id: payload.sub, email: payload.email || null }, token };
    }
  } catch (e) {
    return null;
  }
}

export default null;
