import api from './client.js';

export async function fetchMedia() {
  const { data } = await api.get('/upload/media');
  return data;
}

export async function getMediaViewUrl(key) {
  const encodedKey = encodeURIComponent(key);
  const { data } = await api.get(`/upload/media/${encodedKey}/view`);
  return data.url;
}
