const mapUserRef = (user) => {
  if (!user || typeof user !== 'object' || !user._id) return user;
  return {
    ...user,
    contactNumber: user.phone || user.contactNumber || '',
  };
};

/** Map listing for legacy frontend fields without changing UI components */
const mapListingForClient = (listing) => {
  if (!listing) return listing;
  const doc = listing.toObject ? listing.toObject() : { ...listing };
  const postedBy = mapUserRef(doc.postedBy);
  const claimedBy = mapUserRef(doc.claimedBy || doc.collectedByNgo);
  return {
    ...doc,
    itemName: doc.title || doc.itemName,
    expiryDate: doc.expiresAt || doc.expiryDate,
    listedAt: doc.createdAt || doc.listedAt,
    restaurant: postedBy,
    collectedByNgo: claimedBy,
    status: normalizeStatus(doc.status),
    address: doc.pickupAddress || doc.address,
  };
};

const normalizeStatus = (status) => {
  if (!status) return status;
  const map = {
    available: 'Available',
    claimed: 'Collected',
    completed: 'Collected',
    expired: 'Expired',
    Available: 'Available',
    Collected: 'Collected',
  };
  return map[status] || status;
};

const toDbStatus = (status) => {
  const map = {
    Available: 'available',
    Collected: 'claimed',
    Expired: 'expired',
  };
  return map[status] || status?.toLowerCase?.() || status;
};

module.exports = { mapListingForClient, normalizeStatus, toDbStatus };
