import api from './client.js';

const ADMIN_SESSION_KEY = 'admin_authenticated';
const ADMIN_TOKEN_KEY = 'admin_token';

export function isAdminAuthenticated() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * Attempt backend login first; fall back to client-side env password
 * until backend admin routes are implemented.
 */
export async function loginAdmin(password) {
  try {
    const { data } = await api.post('/admin/login', { password });
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    if (data.token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    }
    return { success: true };
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 501) {
      const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
      if (envPassword && password === envPassword) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
        return { success: true, clientSide: true };
      }
    }

    if (err.response?.status === 401) {
      return { success: false, error: 'Incorrect password' };
    }

    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (envPassword && password === envPassword) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return { success: true, clientSide: true };
    }

    return {
      success: false,
      error: err.response?.data?.error || 'Incorrect password',
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
