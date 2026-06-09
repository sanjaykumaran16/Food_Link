/** Haversine distance in kilometres between two [lng, lat] points */
const haversineKm = (lng1, lat1, lng2, lat2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const isValidCoords = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) return false;
  const [lng, lat] = coordinates;
  if (lng === 0 && lat === 0) return false;
  if (Number.isNaN(lng) || Number.isNaN(lat)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const coordsToLatLng = (coordinates) => {
  if (!isValidCoords(coordinates)) return null;
  return { lat: coordinates[1], lng: coordinates[0] };
};

module.exports = { haversineKm, isValidCoords, coordsToLatLng };
