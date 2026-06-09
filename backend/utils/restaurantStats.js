const FoodListing = require('../models/FoodListing');
const { estimateImpact } = require('./impactCalculator');

const getRestaurantListingCounts = async (restaurantId) => {
  const now = new Date();
  const listings = await FoodListing.find({ postedBy: restaurantId }).select(
    'status expiresAt'
  );

  const counts = { collected: 0, available: 0, expired: 0 };
  for (const listing of listings) {
    if (listing.status === 'claimed' || listing.status === 'completed') {
      counts.collected += 1;
    } else if (
      listing.status === 'expired' ||
      (listing.status === 'available' && listing.expiresAt < now)
    ) {
      counts.expired += 1;
    } else if (listing.status === 'available') {
      counts.available += 1;
    }
  }
  return counts;
};

const getRestaurantImpactFromListings = async (restaurantId) => {
  const listings = await FoodListing.find({
    postedBy: restaurantId,
    status: { $in: ['claimed', 'completed'] },
  });

  let totalKg = 0;
  let totalMeals = 0;
  let totalCo2 = 0;
  let claimed = 0;
  let completed = 0;

  for (const listing of listings) {
    const impact = estimateImpact(listing.quantity, listing.unit);
    totalKg += impact.quantityKg;
    totalMeals += impact.mealsEstimate;
    totalCo2 += impact.co2SavedKg;
    if (listing.status === 'claimed') claimed += 1;
    if (listing.status === 'completed') completed += 1;
  }

  return {
    totalKg: Math.round(totalKg * 100) / 100,
    totalMeals,
    totalCo2: Math.round(totalCo2 * 100) / 100,
    count: listings.length,
    claimed,
    completed,
  };
};

module.exports = { getRestaurantListingCounts, getRestaurantImpactFromListings };
