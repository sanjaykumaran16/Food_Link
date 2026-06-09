import api from './api';

export const postReview = async (payload) => {
  const { data } = await api.post('/api/reviews', payload);
  return data;
};

export const getReviewsForUser = async (userId) => {
  const { data } = await api.get(`/api/reviews/${userId}`);
  return data;
};
