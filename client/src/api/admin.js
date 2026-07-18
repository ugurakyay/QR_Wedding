import api from './client.js';

const ADMIN_SESSION_KEY = 'admin_authenticated';
const ADMIN_TOKEN_KEY = 'admin_token';

// localStorage (not sessionStorage) on purpose: the login should survive
// closing the tab/browser. The token itself never expires server-side.
export function isAdminAuthenticated() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function loginAdmin(password) {
  try {
    const { data } = await api.post('/admin/login', { password });
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    if (data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    }
    return { success: true };
  } catch (err) {
    if (err.response?.status === 401) {
      return { success: false, error: 'Şifre yanlış' };
    }
    return {
      success: false,
      error: err.response?.data?.error || 'Giriş yapılamadı',
    };
  }
}

export async function deleteMedia(key) {
  const encodedKey = encodeURIComponent(key);
  await api.delete(`/admin/media/${encodedKey}`);
}

export async function getFreshDownloadUrl(key) {
  const encodedKey = encodeURIComponent(key);
  const { data } = await api.get(`/admin/media/${encodedKey}/download`);
  return data.url;
}
