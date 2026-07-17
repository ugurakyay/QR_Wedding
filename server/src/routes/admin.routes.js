import { Router } from 'express';
import archiver from 'archiver';
import { config } from '../config/env.js';
import { generateToken, requireAuth } from '../middleware/auth.js';
import {
  deleteObject,
  createPresignedDownloadUrl,
  parseUploaderName,
  getObjectStream,
} from '../services/s3.service.js';

const router = Router();
const UPLOAD_PREFIX = 'uploads/';

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

router.post('/media/zip', requireAuth, async (req, res, next) => {
  const { keys } = req.body;
  const validKeys = Array.isArray(keys)
    ? keys.filter((key) => typeof key === 'string' && key.startsWith(UPLOAD_PREFIX))
    : [];

  if (validKeys.length === 0) {
    return res.status(400).json({ error: 'keys is required' });
  }

  try {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="secilen-dosyalar.zip"');

    const archive = archiver('zip', { zlib: { level: 0 } });
    archive.on('error', (err) => res.destroy(err));
    archive.pipe(res);

    const usedNames = new Set();
    for (const key of validKeys) {
      const ext = key.includes('.') ? key.slice(key.lastIndexOf('.') + 1) : '';
      const base = parseUploaderName(key).replace(/\s+/g, '_');
      let name = `${base}${ext ? `.${ext}` : ''}`;
      let suffix = 1;
      while (usedNames.has(name)) {
        suffix += 1;
        name = `${base}_${suffix}${ext ? `.${ext}` : ''}`;
      }
      usedNames.add(name);

      const stream = await getObjectStream(key);
      archive.append(stream, { name });
    }

    await archive.finalize();
  } catch (err) {
    if (res.headersSent) {
      res.destroy();
    } else {
      next(err);
    }
  }
});

export default router;