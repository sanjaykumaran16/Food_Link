import api from './api';

export const buildConversationId = (userIdA, userIdB, listingId) => {
  const ids = [String(userIdA), String(userIdB)].sort();
  const base = `${ids[0]}_${ids[1]}`;
  return listingId ? `${base}_${listingId}` : base;
};

export const getConversations = async () => {
  const { data } = await api.get('/api/messages/conversations');
  return data;
};

export const getMessages = async (conversationId) => {
  const { data } = await api.get(`/api/messages/${conversationId}`);
  return data;
};

export const sendMessage = async (payload) => {
  const { data } = await api.post('/api/messages', payload);
  return data;
};
