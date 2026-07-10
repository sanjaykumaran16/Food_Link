import api from './api';

export const createListing = async (payload) => {
  const { data } = await api.post('/api/foodlistings', payload);
  return data;
};

export const createListingWithPhotos = async (formData) => {
  const { data } = await api.post('/api/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getAvailableListings = async () => {
  const { data } = await api.get('/api/foodlistings');
  return data;
};

// Advanced server-side filtering — calls the new GET /api/listings endpoint
// Params: { city, category, allergens (array), pickupAfter, pickupBefore, minQty, maxQty, sortBy }
export const getFilteredListings = async (filters = {}) => {
  const params = {};
  if (filters.city) params.city = filters.city;
  if (filters.category && filters.category !== 'all') params.category = filters.category;
  if (filters.allergens && filters.allergens.length > 0) {
    params.allergens = filters.allergens.join(',');
  }
  if (filters.pickupAfter) params.pickupAfter = filters.pickupAfter;
  if (filters.pickupBefore) params.pickupBefore = filters.pickupBefore;
  if (filters.minQty !== '' && filters.minQty !== undefined) params.minQty = filters.minQty;
  if (filters.maxQty !== '' && filters.maxQty !== undefined) params.maxQty = filters.maxQty;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  const { data } = await api.get('/api/listings', { params });
  return data;
};

export const getMatchedListings = async (lat, lng, radius) => {
  const params = {};
  if (lat != null && lng != null) {
    params.lat = lat;
    params.lng = lng;
  }
  if (radius != null) params.radius = radius;
  const { data } = await api.get('/api/listings/matched', { params });
  return data;
};

export const getNearbyListings = async (lat, lng, radius = 10) => {
  const { data } = await api.get('/api/listings/nearby', { params: { lat, lng, radius } });
  return data;
};

export const getNearbyRestaurants = async (lat, lng, radius = 15) => {
  const { data } = await api.get('/api/listings/nearby-restaurants', { params: { lat, lng, radius } });
  return data;
};

export const getNgoMapLocation = async () => {
  const { data } = await api.get('/api/listings/ngo-location');
  return data;
};

export const getMyListings = async () => {
  const { data } = await api.get('/api/foodlistings/myListings');
  return data;
};

export const updateListing = async (id, payload) => {
  const { data } = await api.put(`/api/foodlistings/${id}`, payload);
  return data;
};

export const deleteListing = async (id) => {
  const { data } = await api.delete(`/api/foodlistings/${id}`);
  return data;
};

export const claimListing = async (id) => {
  const { data } = await api.put(`/api/foodlistings/${id}/claim`);
  return data;
};
