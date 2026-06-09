import api from './api';

export const getTasks = async () => {
  const { data } = await api.get('/api/volunteers/tasks');
  return data;
};

export const acceptTask = async (claimId) => {
  const { data } = await api.post(`/api/volunteers/tasks/${claimId}/accept`);
  return data;
};

export const updateTask = async (claimId, status, note) => {
  const { data } = await api.patch(`/api/volunteers/tasks/${claimId}/update`, { status, note });
  return data;
};
