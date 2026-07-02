import { Router } from 'express';
import {
  createPresignedUploadUrl,
  createPresignedDownloadUrl,
  listMediaObjects,
} from '../services/s3.service.js';
import { config } from '../config/env.js';
import { isImage, isVideo } from '../utils/mime.js';

const router = Router();

/**
 * POST /api/upload/presign
 * Body: { filename, mimeType, fileSize }
 * Returns a presigned S3 PUT URL for direct upload.
 */
router.post('/presign', async (req, res, next) => {
  try {
    const { filename, mimeType, fileSize } = req.body;

    if (!filename || !mimeType || fileSize === undefined) {
      return res.status(400).json({
        error: 'filename, mimeType, and fileSize are required',
      });
    }

    const parsedSize = Number(fileSize);
    if (Number.isNaN(parsedSize) || parsedSize <= 0) {
      return res.status(400).json({ error: 'fileSize must be a positive number' });
    }

    const result = await createPresignedUploadUrl({
      filename,
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
 * List all uploaded media with presigned view URLs.
 */
router.get('/media', async (_req, res, next) => {
  try {
    const objects = await listMediaObjects();

    const media = await Promise.all(
      objects.map(async (obj) => {
        const viewUrl = await createPresignedDownloadUrl(obj.key);
        const mimeType = inferMimeTypeFromKey(obj.key);

        return {
          key: obj.key,
          size: obj.size,
          lastModified: obj.lastModified,
          viewUrl,
          type: isVideo(mimeType) ? 'video' : isImage(mimeType) ? 'image' : 'unknown',
          mimeType,
        };
      }),
    );

    res.json({ media, count: media.length });
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
