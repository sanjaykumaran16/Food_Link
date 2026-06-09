import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export const getStoredToken = () =>
  localStorage.getItem('accessToken') ||
  localStorage.getItem('restaurantToken') ||
  localStorage.getItem('ngoToken') ||
  localStorage.getItem('volunteerToken');

export const storeAuth = ({ accessToken, refreshToken, role, legacyToken, userId }) => {
  if (accessToken) localStorage.setItem('accessToken', accessToken);
  if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  if (role) localStorage.setItem('userRole', role);
  if (userId) {
    localStorage.setItem('userId', userId);
    window.dispatchEvent(new Event('foodlink-auth'));
  }
  if (legacyToken) {
    if (role === 'restaurant') localStorage.setItem('restaurantToken', legacyToken);
    if (role === 'ngo') localStorage.setItem('ngoToken', legacyToken);
    if (role === 'volunteer') localStorage.setItem('volunteerToken', legacyToken);
  }
  const token = accessToken || legacyToken;
  if (role === 'restaurant' && token) localStorage.setItem('restaurantToken', token);
  if (role === 'ngo' && token) localStorage.setItem('ngoToken', token);
};

export const clearAuth = () => {
  ['accessToken', 'refreshToken', 'userRole', 'restaurantToken', 'ngoToken', 'volunteerToken'].forEach(
    (k) => localStorage.removeItem(k)
  );
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${baseURL}/api/auth/refresh-token`, {
            refreshToken,
          });
          storeAuth({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            role: localStorage.getItem('userRole'),
          });
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          clearAuth();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
