import { NextRequest } from 'next/server';
import { getSessionFromHeader } from './auth';

// Comma-separated list of super-admin emails (case-insensitive), e.g.
// SUPER_ADMIN_EMAILS=a@x.com,b@y.com
//
// Backwards-compat: if not set, falls back to the legacy single hardcoded email.
const SUPER_ADMIN_EMAIL = "202301040202@mitaoe.ac.in";
const SUPER_ADMIN_EMAILS = process.env.SUPER_ADMIN_EMAILS || SUPER_ADMIN_EMAIL;
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

export type AdminInfo = {
  isAdmin: boolean;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
};

export function computeAdminInfo(email?: string | null, role?: string | null): AdminInfo {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const normalizedRole = (role || '').toUpperCase().trim();

  // Role in DB wins (except the email allowlist can elevate to SUPER_ADMIN).
  if (normalizedRole === 'SUPER_ADMIN') return { isAdmin: true, role: 'SUPER_ADMIN' };
  if (normalizedRole === 'ADMIN') return { isAdmin: true, role: 'ADMIN' };

  // Backwards-compat / emergency access: allowlist of super-admin emails
  if (normalizedEmail) {
    const superAdmins = (SUPER_ADMIN_EMAILS || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (superAdmins.includes(normalizedEmail)) return { isAdmin: true, role: 'SUPER_ADMIN' };
  }

  if (!normalizedEmail) return { isAdmin: false, role: 'USER' };
  return { isAdmin: false, role: 'USER' };
}

export async function requireAdmin(req: NextRequest) {
  // Allow legacy secret header for service operations
  const headerSecret = req.headers.get('x-admin-secret') || req.headers.get('X-Admin-Secret') || '';
  if (ADMIN_SECRET && headerSecret && headerSecret === ADMIN_SECRET) {
    return { ok: true, admin: { isAdmin: true, role: 'SUPER_ADMIN' as const }, session: null };
  }

  const session = await getSessionFromHeader(req as any);
  if (!session) return { ok: false, status: 401, message: 'Authentication required' };
  const email = (session.user as any)?.email || null;
  const role = (session.user as any)?.role || null;
  const admin = computeAdminInfo(email, role);
  if (!admin.isAdmin) return { ok: false, status: 403, message: 'Admin privileges required' };
  return { ok: true, admin, session };
}
