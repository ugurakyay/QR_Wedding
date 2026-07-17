import { Router } from 'express';
import { config } from '../config/env.js';
import { generateToken, requireAuth } from '../middleware/auth.js';
import { deleteObject, createPresignedDownloadUrl, parseUploaderName } from '../services/s3.service.js';

const router = Router();

router.post('/login', (req, res) => {
  if (!config.admin.password) {
    return res.status(501).json({ error: 'Admin not configured on this server' });
  }
  const { password } = req.body;
  if (!password || password !== config.admin.password) {
    return res.status(401).json({ error: 'Incorrect password' });
  }
  const token = generateToken();
  res.json({ token });
});

router.delete('/media/:key', requireAuth, async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key);
    await deleteObject(key);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

router.get('/media/:key/download', requireAuth, async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key);
    const ext = key.includes('.') ? key.slice(key.lastIndexOf('.') + 1) : '';
    const filename = `${parseUploaderName(key).replace(/\s+/g, '_')}${ext ? `.${ext}` : ''}`;
    const url = await createPresignedDownloadUrl(key, { downloadFilename: filename });
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

export default router;