/** Allowed MIME types and their S3 key extensions */
export const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'video/mp4': 'mp4',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
};

export function isAllowedMimeType(mimeType) {
  return Object.prototype.hasOwnProperty.call(MIME_EXTENSIONS, mimeType);
}

export function getExtensionForMimeType(mimeType) {
  return MIME_EXTENSIONS[mimeType] ?? null;
}

export function isImage(mimeType) {
  return mimeType.startsWith('image/');
}

export function isVideo(mimeType) {
  return mimeType.startsWith('video/');
}
