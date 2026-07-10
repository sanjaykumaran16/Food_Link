const Claim = require('../models/Claim');
const { haversineKm, isValidCoords } = require('./geoHelpers');
const { estimateImpact } = require('./impactCalculator');

const WEIGHTS = {
  distance: 0.3,
  urgency: 0.25,
  categoryFit: 0.15,
  capacityFit: 0.15,
  reliability: 0.15,
};

const scoreDistance = (distanceKm, maxRadiusKm = 15) => {
  if (distanceKm == null) return 40;
  if (distanceKm <= 0.5) return 100;
  if (distanceKm >= maxRadiusKm) return 5;
  return Math.round(100 * (1 - distanceKm / maxRadiusKm));
};

const scoreUrgency = (expiresAt, pickupWindowEnd) => {
  const deadline = pickupWindowEnd || expiresAt;
  if (!deadline) return 30;
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft <= 0) return 0;
  if (hoursLeft < 1) return 100;
  if (hoursLeft < 3) return 90;
  if (hoursLeft < 6) return 75;
  if (hoursLeft < 12) return 55;
  if (hoursLeft < 24) return 35;
  return 20;
};

const scoreCategoryFit = (listing, ngo) => {
  const prefs = ngo.preferredCategories || [];
  if (!prefs.length) return 70;
  return prefs.includes(listing.category) ? 100 : 25;
};

const scoreCapacityFit = (listing, activeMealsToday, dailyCapacity) => {
  if (!dailyCapacity || dailyCapacity <= 0) return 70;
  const { mealsEstimate } = estimateImpact(listing.quantity, listing.unit);
  const remaining = Math.max(0, dailyCapacity - (activeMealsToday || 0));
  if (mealsEstimate <= remaining) return 100;
  if (remaining === 0) return 10;
  const ratio = remaining / mealsEstimate;
  return Math.round(Math.max(15, ratio * 100));
};

const scoreReliability = (ngoStats) => {
  const { completed = 0, total = 0, withRestaurant = 0 } = ngoStats;
  if (total === 0) return 60;
  const completionRate = completed / total;
  const base = Math.round(completionRate * 100);
  const bonus = withRestaurant > 0 ? 15 : 0;
  return Math.min(100, base + bonus);
};

const computeMatchScore = (listing, ngo, context = {}) => {
  const {
    distanceKm = null,
    maxRadiusKm = ngo.serviceRadiusKm || 15,
    activeMealsToday = 0,
    ngoStats = {},
  } = context;

  const breakdown = {
    distance: scoreDistance(distanceKm, maxRadiusKm),
    urgency: scoreUrgency(listing.expiresAt, listing.pickupWindowEnd),
    categoryFit: scoreCategoryFit(listing, ngo),
    capacityFit: scoreCapacityFit(listing, activeMealsToday, ngo.dailyMealCapacity),
    reliability: scoreReliability(ngoStats),
  };

  const totalScore = Math.round(
    breakdown.distance * WEIGHTS.distance +
      breakdown.urgency * WEIGHTS.urgency +
      breakdown.categoryFit * WEIGHTS.categoryFit +
      breakdown.capacityFit * WEIGHTS.capacityFit +
      breakdown.reliability * WEIGHTS.reliability
  );

  const urgencyLevel =
    breakdown.urgency >= 90 ? 'critical' : breakdown.urgency >= 75 ? 'high' : breakdown.urgency >= 55 ? 'medium' : 'low';

  return {
    matchScore: totalScore,
    urgencyScore: breakdown.urgency,
    urgencyLevel,
    matchBreakdown: breakdown,
    distanceKm,
  };
};

const getNgoMatchingContext = async (ngo) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const activeClaims = await Claim.find({
    claimedBy: ngo._id,
    status: { $in: ['claimed', 'volunteer_assigned', 'picked_up'] },
    createdAt: { $gte: startOfDay },
  }).populate('listing', 'quantity unit');

  let activeMealsToday = 0;
  for (const claim of activeClaims) {
    if (claim.listing) {
      activeMealsToday += estimateImpact(claim.listing.quantity, claim.listing.unit).mealsEstimate;
    }
  }

  const allClaims = await Claim.find({ claimedBy: ngo._id });
  const completed = allClaims.filter((c) => c.status === 'delivered').length;

  return {
    activeMealsToday,
    ngoStats: {
      completed,
      total: allClaims.length,
      withRestaurant: 0,
    },
    maxRadiusKm: ngo.serviceRadiusKm || 15,
  };
};

const enrichListingsWithScores = (listings, ngo, context, ngoCoords) => {
  const [ngoLng, ngoLat] = ngoCoords || ngo.location?.coordinates || [];

  return listings
    .map((listing) => {
      let distanceKm = listing.distanceKm ?? null;
      const coords = listing.location?.coordinates;
      if (distanceKm == null && isValidCoords(coords) && isValidCoords([ngoLng, ngoLat])) {
        distanceKm = Math.round(haversineKm(ngoLng, ngoLat, coords[0], coords[1]) * 10) / 10;
      }

      const doc = listing.toObject ? listing.toObject() : { ...listing };
      const scores = computeMatchScore(doc, ngo, { ...context, distanceKm });

      return {
        ...doc,
        ...scores,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.urgencyScore - a.urgencyScore);
};

module.exports = {
  WEIGHTS,
  computeMatchScore,
  getNgoMatchingContext,
  enrichListingsWithScores,
  scoreUrgency,
};
