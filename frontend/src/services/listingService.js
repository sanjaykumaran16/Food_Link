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
