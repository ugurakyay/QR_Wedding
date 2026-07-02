import { randomBytes } from 'crypto';

const validTokens = new Set();

export function generateToken() {
  const token = randomBytes(32).toString('hex');
  validTokens.add(token);
  return token;
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  if (!validTokens.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}