import api from './api';

// Submit a review (NGO only, gated by delivered claim on backend)
export const postReview = async (payload) => {
  const { data } = await api.post('/api/reviews', payload);
  return data;
};

// Get all reviews for a restaurant user (includes avgRating + totalCount)
export const getRestaurantReviews = async (userId) => {
  const { data } = await api.get(`/api/reviews/restaurant/${userId}`);
  return data;
};

// Legacy: get reviews by userId (backward compat)
export const getReviewsForUser = async (userId) => {
  const { data } = await api.get(`/api/reviews/${userId}`);
  return data;
};

// Check if logged-in user can review a specific listing
export const checkCanReview = async (listingId) => {
  const { data } = await api.get(`/api/reviews/check/${listingId}`);
  return data;
};

// Get reviews written by the logged-in user
export const getMyReviews = async () => {
  const { data } = await api.get('/api/reviews/my');
  return data;
};
