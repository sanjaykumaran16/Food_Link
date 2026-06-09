import api from './api';

export const getTemplates = async () => {
  const { data } = await api.get('/api/templates');
  return data;
};

export const createTemplate = async (payload) => {
  const { data } = await api.post('/api/templates', payload);
  return data;
};

export const postFromTemplate = async (templateId) => {
  const { data } = await api.post(`/api/templates/${templateId}/post`);
  return data;
};
