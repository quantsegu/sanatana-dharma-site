import crypto from 'crypto';

const secret = () => process.env.ADMIN_SECRET || 'change-admin-secret-in-production';

export function createAuthToken() {
  const payload = { exp: Date.now() + 7 * 24 * 3600 * 1000 };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyAuthToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  try {
    const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
    if (expected !== sig) return false;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD || 'dev-admin-change-me';
  return typeof password === 'string' && password.length > 0 && password === expected;
}
