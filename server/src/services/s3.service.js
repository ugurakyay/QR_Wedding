import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';
import { getExtensionForMimeType, isAllowedMimeType } from '../utils/mime.js';

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const UPLOAD_PREFIX = 'uploads/';

/**
 * Turn a free-typed name into a key-safe, underscore-separated slug.
 * Keeps letters from any alphabet (Turkish included) so the name reads
 * back exactly as typed — S3 keys are UTF-8, so there's no need to
 * transliterate down to ASCII.
 */
function slugifyName(name) {
  const slug = name
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\p{L}\p{N}_]/gu, '')
    .slice(0, 40);
  return slug || 'Misafir';
}

/**
 * Build a unique S3 object key, grouped per uploader.
 * Format: uploads/{nameSlug}/{epochMs}-{shortId}.{ext}
 * The "folder" is just a key prefix (S3 has no real directories), so
 * grouping costs nothing; the epoch + random suffix rule out collisions
 * even when the same guest uploads several files within the same second.
 */
export function buildObjectKey({ uploaderName, mimeType }) {
  const ext = getExtensionForMimeType(mimeType);
  const nameSlug = slugifyName(uploaderName);
  const shortId = uuidv4().replace(/-/g, '').slice(0, 6);
  const suffix = ext ? `.${ext}` : '';
  return `${UPLOAD_PREFIX}${nameSlug}/${Date.now()}-${shortId}${suffix}`;
}

/**
 * Recover the uploader's display name from an object key.
 * Understands the current uploads/{nameSlug}/... layout, the earlier
 * flat uploads/{epochMs}-{nameSlug}-{shortId} layout, and falls back
 * to "Misafir" for anything older.
 */
export function parseUploaderName(key) {
  const base = key.slice(UPLOAD_PREFIX.length);
  const slash = base.indexOf('/');
  if (slash > 0) {
    return base.slice(0, slash).replace(/_/g, ' ');
  }
  const dot = base.lastIndexOf('.');
  const withoutExt = dot === -1 ? base : base.slice(0, dot);
  const parts = withoutExt.split('-');
  const nameSlug = parts.length === 3 ? parts[1] : null;
  return nameSlug ? nameSlug.replace(/_/g, ' ') : 'Misafir';
}

/**
 * Generate a presigned PUT URL for direct client-to-S3 upload.
 */
export async function createPresignedUploadUrl({ uploaderName, mimeType, fileSize }) {
  if (!isAllowedMimeType(mimeType)) {
    throw Object.assign(new Error(`File type not allowed: ${mimeType}`), { status: 400 });
  }

  if (fileSize > config.upload.maxFileSize) {
    throw Object.assign(
      new Error(`File exceeds maximum size of ${config.upload.maxFileSize} bytes`),
      { status: 400 },
    );
  }

  const key = buildObjectKey({ uploaderName, mimeType });

  const command = new PutObjectCommand({
    Bucket: config.aws.bucket,
    Key: key,
    ContentType: mimeType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: config.upload.presignedUrlExpiry,
  });

  return {
    uploadUrl,
    key,
    bucket: config.aws.bucket,
    expiresIn: config.upload.presignedUrlExpiry,
    mimeType,
  };
}

/**
 * Build a Content-Disposition value that survives non-ASCII names (Turkish
 * letters etc). A plain `filename="..."` with raw UTF-8 bytes gets rejected
 * by S3 with 400 Bad Request, so this pairs an ASCII fallback with the
 * RFC 5987 `filename*=UTF-8''...` form browsers actually use to display it.
 */
function buildContentDisposition(filename) {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, "'");
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

/**
 * Generate a presigned GET URL for viewing or downloading a private object.
 * Pass downloadFilename to force a "Save As" download via the S3 response's
 * Content-Disposition header — the HTML `download` attribute alone doesn't
 * force a save for cross-origin URLs like these, browsers just navigate.
 */
export async function createPresignedDownloadUrl(key, { expiresIn = 3600, downloadFilename } = {}) {
  const command = new GetObjectCommand({
    Bucket: config.aws.bucket,
    Key: key,
    ...(downloadFilename
      ? { ResponseContentDisposition: buildContentDisposition(downloadFilename) }
      : {}),
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * List all uploaded media objects in the bucket.
 */
export async function listMediaObjects() {
  const command = new ListObjectsV2Command({
    Bucket: config.aws.bucket,
    Prefix: UPLOAD_PREFIX,
  });

  const response = await s3Client.send(command);

  return (response.Contents ?? [])
    .filter((item) => item.Key && !item.Key.endsWith('/'))
    .map((item) => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
    }))
    .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
}

/**
 * Delete an object from S3.
 */
export async function deleteObject(key) {
  const command = new DeleteObjectCommand({
    Bucket: config.aws.bucket,
    Key: key,
  });

  await s3Client.send(command);
}

export { s3Client };
