import api from './api';

export const createClaim = async (listingId) => {
  const { data } = await api.post(`/api/claims/${listingId}`);
  return data;
};

export const getMyClaims = async () => {
  const { data } = await api.get('/api/claims/my');
  return data;
};

export const updateClaimStatus = async (id, status, note = '') => {
  const { data } = await api.patch(`/api/claims/${id}/status`, { status, note });
  return data;
};

export const uploadProof = async (claimId, file) => {
  const formData = new FormData();
  formData.append('proof', file);
  const { data } = await api.post(`/api/claims/${claimId}/proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
