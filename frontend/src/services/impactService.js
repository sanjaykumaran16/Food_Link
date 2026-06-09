import api from './api';

export const getPlatformStats = async () => {
  const { data } = await api.get('/api/impact/platform');
  return data;
};

export const getPublicStats = async () => {
  const { data } = await api.get('/api/stats');
  return data;
};

export const getRestaurantImpact = async (id) => {
  const { data } = await api.get(`/api/impact/restaurant/${id}`);
  return data;
};

export const downloadCertificate = async (userId) => {
  const response = await api.get(`/api/impact/certificate/${userId}`, {
    responseType: 'blob',
  });
  return response.data;
};
