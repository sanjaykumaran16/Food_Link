import api, { storeAuth, clearAuth } from './api';

export const register = async (payload) => {
  const { data } = await api.post('/api/auth/register', payload);
  const token = data.accessToken || data.token;
  storeAuth({
    accessToken: token,
    refreshToken: data.refreshToken,
    role: data.user?.role || payload.role,
    legacyToken: token,
    userId: data.user?._id || data._id,
  });
  return data;
};

export const login = async ({ email, password, role }) => {
  const endpoint = role === 'restaurant'
    ? '/api/restaurants/login'
    : role === 'ngo'
      ? '/api/ngos/login'
      : '/api/auth/login';

  const body = role === 'restaurant' || role === 'ngo'
    ? { email, password }
    : { email, password, role };

  const { data } = await api.post(endpoint, body);
  const token = data.accessToken || data.token;
  const userRole = data.user?.role || role;
  storeAuth({
    accessToken: token,
    refreshToken: data.refreshToken,
    role: userRole,
    legacyToken: token,
    userId: data.user?._id || data._id,
  });
  return data;
};

export const registerLegacy = async (role, payload) => {
  const endpoint = role === 'restaurant' ? '/api/restaurants/register' : '/api/ngos/register';
  const { data } = await api.post(endpoint, payload);
  const token = data.accessToken || data.token;
  storeAuth({
    accessToken: token,
    refreshToken: data.refreshToken,
    role,
    legacyToken: token,
    userId: data._id,
  });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/api/auth/me');
  return data;
};

export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } finally {
    clearAuth();
  }
};
