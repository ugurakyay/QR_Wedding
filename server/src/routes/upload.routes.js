import { Router } from 'express';
import {
  createPresignedUploadUrl,
  createPresignedDownloadUrl,
  listMediaObjects,
  parseUploaderName,
} from '../services/s3.service.js';
import { config } from '../config/env.js';
import { isImage, isVideo } from '../utils/mime.js';

const router = Router();

const UPLOAD_PREFIX = 'uploads/';

/**
 * POST /api/upload/presign
 * Body: { uploaderName, mimeType, fileSize }
 * Returns a presigned S3 PUT URL for direct upload.
 */
router.post('/presign', async (req, res, next) => {
  try {
    const { uploaderName, mimeType, fileSize } = req.body;

    if (!uploaderName || typeof uploaderName !== 'string' || !uploaderName.trim()) {
      return res.status(400).json({ error: 'uploaderName is required' });
    }

    if (!mimeType || fileSize === undefined) {
      return res.status(400).json({
        error: 'mimeType and fileSize are required',
      });
    }

    const parsedSize = Number(fileSize);
    if (Number.isNaN(parsedSize) || parsedSize <= 0) {
      return res.status(400).json({ error: 'fileSize must be a positive number' });
    }

    const result = await createPresignedUploadUrl({
      uploaderName: uploaderName.trim(),
      mimeType,
      fileSize: parsedSize,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/upload/media
 * List all uploaded media. No per-item signing here on purpose — with
 * hundreds of guests uploading, signing a view URL for every item on
 * every list request doesn't scale. A view URL is only generated when
 * a specific item is opened, via GET /media/:key/view below.
 */
router.get('/media', async (_req, res, next) => {
  try {
    const objects = await listMediaObjects();

    const media = objects.map((obj) => {
      const mimeType = inferMimeTypeFromKey(obj.key);

      return {
        key: obj.key,
        size: obj.size,
        lastModified: obj.lastModified,
        uploaderName: parseUploaderName(obj.key),
        type: isVideo(mimeType) ? 'video' : isImage(mimeType) ? 'image' : 'unknown',
        mimeType,
      };
    });

    res.json({ media, count: media.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/upload/media/:key/view
 * Generate a presigned view URL for a single item, on demand.
 */
router.get('/media/:key/view', async (req, res, next) => {
  try {
    const key = decodeURIComponent(req.params.key);
    if (!key.startsWith(UPLOAD_PREFIX)) {
      return res.status(400).json({ error: 'Invalid key' });
    }

    const url = await createPresignedDownloadUrl(key);
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/upload/config
 * Public upload configuration for the client.
 */
router.get('/config', (_req, res) => {
  res.json({
    maxFileSize: config.upload.maxFileSize,
    allowedMimeTypes: config.upload.allowedMimeTypes,
    presignedUrlExpiry: config.upload.presignedUrlExpiry,
  });
});

function inferMimeTypeFromKey(key) {
  const ext = key.split('.').pop()?.toLowerCase();
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
  };
  return map[ext] ?? 'application/octet-stream';
}

export default router;
