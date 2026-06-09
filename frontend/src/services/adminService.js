import api from './api';

export const getUsers = async (role) => {
  const { data } = await api.get('/api/admin/users', { params: role ? { role } : {} });
  return data;
};

export const approveUser = async (id) => {
  const { data } = await api.patch(`/api/admin/users/${id}/approve`);
  return data;
};

export const suspendUser = async (id) => {
  const { data } = await api.patch(`/api/admin/users/${id}/suspend`);
  return data;
};

export const getAdminListings = async () => {
  const { data } = await api.get('/api/admin/listings');
  return data;
};

export const getAnalytics = async () => {
  const { data } = await api.get('/api/admin/analytics');
  return data;
};
