import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root (monorepo)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name, defaultValue) {
  const value = process.env[name];
  return value !== undefined && value !== '' ? value : defaultValue;
}

export const config = {
  port: parseInt(optionalEnv('PORT', '3001'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  clientUrl: optionalEnv('CLIENT_URL', 'http://localhost:5173'),

  aws: {
    region: requireEnv('AWS_REGION'),
    accessKeyId: requireEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('AWS_SECRET_ACCESS_KEY'),
    bucket: requireEnv('AWS_S3_BUCKET'),
  },

  upload: {
    maxFileSize: parseInt(optionalEnv('MAX_FILE_SIZE', '104857600'), 10),
    presignedUrlExpiry: parseInt(optionalEnv('PRESIGNED_URL_EXPIRY', '300'), 10),
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
      'video/mp4',
      'video/quicktime',
      'video/webm',
    ],
  },

  admin: {
    password: optionalEnv('ADMIN_PASSWORD', ''),
  },
};

export const isProduction = config.nodeEnv === 'production';
