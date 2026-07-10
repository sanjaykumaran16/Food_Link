/**
 * Legacy /api/foodlistings routes — maps to listings + claims.
 */
const express = require('express');
const asyncHandler = require('express-async-handler');
const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { mapListingForClient } = require('../utils/listingMapper');
const { createNotification } = require('../utils/notifications');
const { geocodeUser } = require('../utils/geocode');
const { isValidCoords } = require('../utils/geoHelpers');
const { normalizeChecklist, evaluateListingSafety } = require('../utils/foodSafety');
const { getNgoMatchingContext, enrichListingsWithScores } = require('../utils/matchingEngine');

const router = express.Router();

const parseQuantity = (value) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const match = String(value || '').match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
};

const parseLegacyBody = async (body, user) => {
  const title = body.title || body.itemName;
  const expiresAt = body.expiresAt || body.expiryDate;
  const now = new Date();
  let coordinates = body.coordinates || user.location?.coordinates;
  if (!isValidCoords(coordinates)) {
    await geocodeUser(user);
    coordinates = user.location?.coordinates;
  }
  return {
    title,
    description: body.description || '',
    category: body.category || 'cooked',
    quantity: parseQuantity(body.quantity),
    unit: body.unit || 'portions',
    pickupAddress: body.pickupAddress || user.address || '',
    city: body.city || user.city || '',
    pincode: body.pincode || user.pincode || '',
    pickupWindowStart: now,
    pickupWindowEnd: expiresAt ? new Date(expiresAt) : new Date(now.getTime() + 4 * 60 * 60 * 1000),
    expiresAt: expiresAt ? new Date(expiresAt) : new Date(now.getTime() + 4 * 60 * 60 * 1000),
    location: {
      type: 'Point',
      coordinates: isValidCoords(coordinates) ? coordinates : [0, 0],
    },
    safetyChecklist: (() => {
      let raw = body.safetyChecklist;
      if (typeof raw === 'string') {
        try { raw = JSON.parse(raw); } catch { raw = {}; }
      }
      return normalizeChecklist(raw);
    })(),
    preparedAt: body.preparedAt ? new Date(body.preparedAt) : null,
    storageTemp: body.storageTemp || 'ambient',
  };
};

router.post('/', auth, role('restaurant'), asyncHandler(async (req, res) => {
  const data = await parseLegacyBody(req.body, req.user);
  if (!data.title || !data.quantity) {
    res.status(400);
    throw new Error('Please provide itemName, quantity, and expiryDate');
  }

  const safety = evaluateListingSafety(data);
  if (!safety.canPublish) {
    res.status(400);
    throw new Error(safety.errors.join(' ') || 'Food safety requirements not met.');
  }

  const listing = await FoodListing.create({
    ...data,
    safetyChecklist: safety.checklist,
    safetyStatus: safety.safetyStatus,
    safetyWarnings: safety.warnings,
    safetyVerifiedAt: new Date(),
    safetyAuditLog: [
      {
        action: 'published',
        by: req.user._id,
        at: new Date(),
        note: 'Safety checklist verified at publish',
      },
    ],
    postedBy: req.user._id,
    status: 'available',
  });
  res.status(201).json(mapListingForClient(listing));
}));

router.get('/', auth, role('ngo'), asyncHandler(async (req, res) => {
  const listings = await FoodListing.find({
    status: 'available',
    expiresAt: { $gte: new Date() },
    safetyStatus: 'verified',
  })
    .populate('postedBy', 'name address phone contactNumber')
    .limit(100);

  const context = await getNgoMatchingContext(req.user);
  const scored = enrichListingsWithScores(
    listings,
    req.user,
    context,
    req.user.location?.coordinates
  );
  res.json(scored.map(mapListingForClient));
}));

router.get('/myListings', auth, role('restaurant'), asyncHandler(async (req, res) => {
  const listings = await FoodListing.find({ postedBy: req.user._id })
    .populate('claimedBy', 'name phone')
    .sort({ createdAt: -1 });
  res.json(listings.map(mapListingForClient));
}));

router.get('/myReceived', auth, role('ngo'), asyncHandler(async (req, res) => {
  const listings = await FoodListing.find({
    claimedBy: req.user._id,
    status: { $in: ['claimed', 'completed'] },
  })
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 });
  res.json(listings.map(mapListingForClient));
}));

router.put('/:id/claim', auth, role('ngo'), asyncHandler(async (req, res) => {
  const listing = await FoodListing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Food listing not found.');
  }
  if (listing.status !== 'available') {
    res.status(400);
    throw new Error('Listing is no longer available.');
  }
  if (listing.safetyStatus !== 'verified') {
    res.status(400);
    throw new Error('Listing has not passed food safety verification.');
  }

  await Claim.create({
    listing: listing._id,
    claimedBy: req.user._id,
    timeline: [{ status: 'claimed', timestamp: new Date(), note: 'Claimed via legacy API' }],
  });

  listing.status = 'claimed';
  listing.claimedBy = req.user._id;
  await listing.save();

  const io = req.app.get('io');
  await createNotification({
    user: listing.postedBy,
    type: 'claim',
    title: 'Listing claimed',
    message: `${req.user.name} claimed "${listing.title}".`,
    relatedListing: listing._id,
    io,
  });

  res.json(mapListingForClient(listing));
}));

router.put('/:id', auth, role('restaurant'), asyncHandler(async (req, res) => {
  const listing = await FoodListing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Food listing not found.');
  }
  if (listing.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to update this listing.');
  }
  if (listing.status !== 'available') {
    res.status(400);
    throw new Error('Cannot edit a listing that has already been collected.');
  }

  const data = await parseLegacyBody(req.body, req.user);
  if (data.title) listing.title = data.title;
  if (data.quantity) listing.quantity = data.quantity;
  if (data.expiresAt) listing.expiresAt = data.expiresAt;
  await listing.save();
  res.json(mapListingForClient(listing));
}));

router.delete('/:id', auth, role('restaurant'), asyncHandler(async (req, res) => {
  const listing = await FoodListing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Food listing not found.');
  }
  if (listing.postedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to delete this listing.');
  }
  await listing.deleteOne();
  res.json({ message: 'Food listing deleted successfully.' });
}));

module.exports = router;
