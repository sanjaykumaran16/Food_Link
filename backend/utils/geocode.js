const { isValidCoords } = require('./geoHelpers');

const cache = new Map();
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const buildAddressQuery = ({ address, city, pincode }) =>
  [address, city, pincode, 'India'].filter(Boolean).join(', ');

const geocodeAddress = async (query) => {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key);

  try {
    const params = new URLSearchParams({
      q: query,
      format: 'json',
      limit: '1',
      countrycodes: 'in',
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { 'User-Agent': 'FoodLink/1.0 (food donation platform)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.length) return null;
    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
    cache.set(key, result);
    return result;
  } catch {
    return null;
  }
};

const geocodeUser = async (user) => {
  if (isValidCoords(user.location?.coordinates)) {
    return user.location.coordinates;
  }
  const query = buildAddressQuery(user);
  const result = await geocodeAddress(query);
  if (!result) return null;
  user.location = { type: 'Point', coordinates: [result.lng, result.lat] };
  await user.save();
  return user.location.coordinates;
};

const geocodeListing = async (listing) => {
  if (isValidCoords(listing.location?.coordinates)) {
    return listing.location.coordinates;
  }
  const postedBy = listing.postedBy?.address
    ? listing.postedBy
    : await require('../models/User').findById(listing.postedBy).select('address city pincode name location');
  const query = buildAddressQuery({
    address: listing.pickupAddress || postedBy?.address,
    city: listing.city || postedBy?.city,
    pincode: listing.pincode || postedBy?.pincode,
    name: postedBy?.name,
  });
  const result = await geocodeAddress(query);
  if (!result) return null;
  listing.location = { type: 'Point', coordinates: [result.lng, result.lat] };
  await listing.save();
  return listing.location.coordinates;
};

module.exports = { geocodeAddress, geocodeUser, geocodeListing, buildAddressQuery };
