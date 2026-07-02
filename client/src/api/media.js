import api from './client.js';

export async function fetchMedia() {
  const { data } = await api.get('/upload/media');
  return data;
}
