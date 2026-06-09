import api from './api';

export const getNotifications = async () => {
  const { data } = await api.get('/api/notifications');
  return data;
};

export const markAllRead = async () => {
  const { data } = await api.patch('/api/notifications/read-all');
  return data;
};

export const deleteAllNotifications = async () => {
  const { data } = await api.delete('/api/notifications/all');
  return data;
};
