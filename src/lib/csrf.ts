import crypto from 'crypto';

const SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'dev_csrf_secret_change_me';
const TOKEN_LENGTH_BYTES = 32;

export function generateCsrfToken(): string {
  const raw = crypto.randomBytes(TOKEN_LENGTH_BYTES).toString('base64url');
  const sig = sign(raw);
  return `${raw}.${sig}`; // cookie value
}

function sign(token: string): string {
  return crypto.createHmac('sha256', SECRET).update(token).digest('base64url');
}

export function extractRaw(tokenWithSig: string): string | null {
  if (!tokenWithSig) return null;
  const parts = tokenWithSig.split('.');
  if (parts.length !== 2) return null;
  return parts[0];
}

export function verifyCsrfToken(tokenWithSig: string | null, presentedRaw: string | null): boolean {
  if (!tokenWithSig || !presentedRaw) return false;
  const parts = tokenWithSig.split('.');
  if (parts.length !== 2) return false;
  const [raw, sig] = parts;
  if (raw !== presentedRaw) return false;
  const expected = sign(raw);
  // constant-time comparison
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
