export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getFilenameFromKey(key) {
  const parts = key.split('/');
  const filename = parts[parts.length - 1] || key;
  return filename.replace(/^[a-f0-9-]{36}-/, '');
}

export function isAllowedFile(file, allowedMimeTypes) {
  return allowedMimeTypes.includes(file.type);
}

export function validateFiles(files, config) {
  const errors = [];
  const valid = [];

  for (const file of files) {
    if (!config.allowedMimeTypes.includes(file.type)) {
      errors.push(`${file.name}: desteklenmeyen dosya türü`);
      continue;
    }
    if (file.size > config.maxFileSize) {
      errors.push(`${file.name}: maksimum boyutu aşıyor (${formatFileSize(config.maxFileSize)})`);
      continue;
    }
    valid.push(file);
  }

  return { valid, errors };
}