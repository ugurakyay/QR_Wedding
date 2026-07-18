import { createHmac } from 'crypto';
import { config } from '../config/env.js';

// The token is derived from the admin password instead of being stored
// in memory: it never expires and stays valid across restarts/redeploys,
// so the admin doesn't have to log in again after every deploy.
function deriveToken() {
  return createHmac('sha256', 'wedding-admin-token')
    .update(config.admin.password)
    .digest('hex');
}

export function generateToken() {
  return deriveToken();
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  if (!config.admin.password || token !== deriveToken()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
