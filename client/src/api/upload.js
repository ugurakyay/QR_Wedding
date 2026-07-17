import axios from 'axios';
import api from './client.js';

export async function getUploadConfig() {
  const { data } = await api.get('/upload/config');
  return data;
}

export async function getPresignedUrl({ uploaderName, mimeType, fileSize }) {
  const { data } = await api.post('/upload/presign', {
    uploaderName,
    mimeType,
    fileSize,
  });
  return data;
}

export async function uploadFile(file, uploaderName, onProgress) {
  const presigned = await getPresignedUrl({
    uploaderName,
    mimeType: file.type,
    fileSize: file.size,
  });

  await axios.put(presigned.uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(event.loaded / event.total);
      }
    },
  });

  return presigned;
}
