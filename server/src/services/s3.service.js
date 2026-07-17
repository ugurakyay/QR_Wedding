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
 * Build a unique S3 object key from the uploader's name and upload time.
 * Format: uploads/{epochMs}-{nameSlug}-{shortId}.{ext}
 * The epoch + random suffix rule out collisions even when the same
 * guest uploads several files within the same second.
 */
export function buildObjectKey({ uploaderName, mimeType }) {
  const ext = getExtensionForMimeType(mimeType);
  const nameSlug = slugifyName(uploaderName);
  const shortId = uuidv4().replace(/-/g, '').slice(0, 6);
  const suffix = ext ? `.${ext}` : '';
  return `${UPLOAD_PREFIX}${Date.now()}-${nameSlug}-${shortId}${suffix}`;
}

/**
 * Recover the uploader's display name from an object key built by buildObjectKey.
 * Falls back to "Misafir" for keys that predate this naming scheme.
 */
export function parseUploaderName(key) {
  const base = key.slice(UPLOAD_PREFIX.length);
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
 * Generate a presigned GET URL for viewing a private object.
 */
export async function createPresignedDownloadUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: config.aws.bucket,
    Key: key,
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
    .filter((item) => item.Key && item.Key !== UPLOAD_PREFIX)
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
