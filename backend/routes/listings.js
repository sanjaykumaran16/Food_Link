const express = require('express');
const asyncHandler = require('express-async-handler');
const FoodListing = require('../models/FoodListing');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const { uploadBuffer, isCloudinaryConfigured, cloudinarySetupHint } = require('../utils/uploadCloudinary');
const { mapListingForClient } = require('../utils/listingMapper');
const { createNotification } = require('../utils/notifications');
const { geocodeUser, geocodeListing } = require('../utils/geocode');
const { haversineKm, isValidCoords } = require('../utils/geoHelpers');

const router = express.Router();

const parseQuantity = (value) => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  const match = String(value || '').match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
};

const parseLegacyBody = (body, user) => {
  const title = body.title || body.itemName;
  const expiresAt = body.expiresAt || body.expiryDate;
  const now = new Date();
  const pickupWindowStart = body.pickupWindowStart
    ? new Date(body.pickupWindowStart)
    : now;
  const pickupWindowEnd = body.pickupWindowEnd
    ? new Date(body.pickupWindowEnd)
    : expiresAt
      ? new Date(expiresAt)
      : new Date(now.getTime() + 4 * 60 * 60 * 1000);

  return {
    title,
    description: body.description || '',
    category: body.category || 'cooked',
    quantity: parseQuantity(body.quantity),
    unit: body.unit || 'portions',
    allergens: body.allergens || [],
    pickupAddress: body.pickupAddress || user.address || '',
    city: body.city || user.city || '',
    pincode: body.pincode || user.pincode || '',
    location: body.location || {
      type: 'Point',
      coordinates: body.coordinates || user.location?.coordinates || [0, 0],
    },
    pickupWindowStart,
    pickupWindowEnd,
    expiresAt: expiresAt ? new Date(expiresAt) : pickupWindowEnd,
    safetyChecklist: body.safetyChecklist || {},
    templateId: body.templateId || null,
  };
};

const uploadPhotos = async (files) => {
  if (!files?.length) return [];
  const urls = [];
  for (const file of files) {
    const result = await uploadBuffer(file.buffer, 'foodlink/listings');
    urls.push(result.secure_url);
  }
  return urls;
};

router.post(
  '/',
  auth,
  role('restaurant'),
  upload.array('photos', 5),
  asyncHandler(async (req, res) => {
    const data = parseLegacyBody(req.body, req.user);
    let safetyChecklist = req.body.safetyChecklist || {};
    if (typeof req.body.safetyChecklist === 'string') {
      try { safetyChecklist = JSON.parse(req.body.safetyChecklist); } catch { /* ignore */ }
    }
    if (!data.title || !data.quantity) {
      res.status(400);
      throw new Error('Please provide title/itemName and quantity');
    }

    let photos = [];
    try {
      photos = await uploadPhotos(req.files);
    } catch (err) {
      if (req.files?.length) {
        res.status(err.statusCode || 503);
        throw new Error(err.message || 'Photo upload failed');
      }
    }
    if (req.body.photoUrls) {
      photos = photos.concat(
        Array.isArray(req.body.photoUrls) ? req.body.photoUrls : [req.body.photoUrls]
      );
    }

    const listing = await FoodListing.create({
      ...data,
      postedBy: req.user._id,
      photos,
      safetyChecklist,
      status: 'available',
    });

    const User = require('../models/User');
    const io = req.app.get('io');
    const ngoFilter = listing.city ? { role: 'ngo', city: listing.city } : { role: 'ngo' };
    const ngos = await User.find(ngoFilter);
    for (const ngo of ngos) {
      await createNotification({
        user: ngo._id,
        type: 'listing',
        title: 'New food listing nearby',
        message: `${req.user.name} posted "${listing.title}" in ${listing.city || 'your area'}.`,
        relatedListing: listing._id,
        io,
      });
    }

    res.status(201).json(mapListingForClient(listing));
  })
);

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const { city, category, status } = req.query;
    const filter = {};
    if (city) filter.city = new RegExp(city, 'i');
    if (category) filter.category = category;
    if (status) filter.status = status;
    else if (req.user.role === 'ngo') {
      filter.status = 'available';
      filter.expiresAt = { $gte: new Date() };
    }

    const listings = await FoodListing.find(filter)
      .populate('postedBy', 'name address phone city')
      .populate('claimedBy', 'name phone')
      .sort({ expiresAt: 1 });

    res.json(listings.map(mapListingForClient));
  })
);

const withDistance = (listing, lat, lng) => {
  const mapped = mapListingForClient(listing);
  const coords = listing.location?.coordinates;
  if (isValidCoords(coords)) {
    mapped.distanceKm = Math.round(haversineKm(lng, lat, coords[0], coords[1]) * 10) / 10;
  }
  return mapped;
};

router.get(
  '/nearby',
  auth,
  asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius) || 10;
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      res.status(400);
      throw new Error('lat and lng query params required');
    }

    let listings = await FoodListing.find({
      status: 'available',
      expiresAt: { $gte: new Date() },
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    })
      .populate('postedBy', 'name address phone city location')
      .limit(50);

    if (!listings.length) {
      const fallback = await FoodListing.find({
        status: 'available',
        expiresAt: { $gte: new Date() },
      })
        .populate('postedBy', 'name address phone city location')
        .limit(50);
      for (const listing of fallback) {
        await geocodeListing(listing);
      }
      listings = fallback.filter((l) => isValidCoords(l.location?.coordinates));
      listings.sort((a, b) => {
        const da = haversineKm(lng, lat, a.location.coordinates[0], a.location.coordinates[1]);
        const db = haversineKm(lng, lat, b.location.coordinates[0], b.location.coordinates[1]);
        return da - db;
      });
      listings = listings.filter(
        (l) => haversineKm(lng, lat, l.location.coordinates[0], l.location.coordinates[1]) <= radiusKm
      );
    }

    res.json(listings.map((l) => withDistance(l, lat, lng)));
  })
);

router.get(
  '/nearby-restaurants',
  auth,
  role('ngo'),
  asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius) || 15;
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      res.status(400);
      throw new Error('lat and lng query params required');
    }

    const listings = await FoodListing.find({
      status: 'available',
      expiresAt: { $gte: new Date() },
    })
      .populate('postedBy', 'name address phone city location')
      .limit(100);

    for (const listing of listings) {
      await geocodeListing(listing);
    }

    const byRestaurant = {};
    for (const listing of listings) {
      const coords = listing.location?.coordinates;
      if (!isValidCoords(coords)) continue;
      const distanceKm = haversineKm(lng, lat, coords[0], coords[1]);
      if (distanceKm > radiusKm) continue;

      const restaurantId = listing.postedBy._id.toString();
      if (!byRestaurant[restaurantId]) {
        byRestaurant[restaurantId] = {
          restaurant: {
            _id: listing.postedBy._id,
            name: listing.postedBy.name,
            address: listing.postedBy.address,
            phone: listing.postedBy.phone,
            city: listing.postedBy.city,
            location: listing.postedBy.location,
          },
          distanceKm: Math.round(distanceKm * 10) / 10,
          listings: [],
        };
      } else {
        byRestaurant[restaurantId].distanceKm = Math.min(
          byRestaurant[restaurantId].distanceKm,
          Math.round(distanceKm * 10) / 10
        );
      }
      byRestaurant[restaurantId].listings.push(withDistance(listing, lat, lng));
    }

    const suggestions = Object.values(byRestaurant)
      .map((s) => ({ ...s, listingCount: s.listings.length }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(suggestions);
  })
);

router.get(
  '/ngo-location',
  auth,
  role('ngo'),
  asyncHandler(async (req, res) => {
    const coords = await geocodeUser(req.user);
    if (!coords) {
      res.status(404);
      throw new Error('Could not determine your location. Please update your address in profile.');
    }
    res.json({ lat: coords[1], lng: coords[0], coordinates: coords });
  })
);

router.get(
  '/my',
  auth,
  role('restaurant'),
  asyncHandler(async (req, res) => {
    const listings = await FoodListing.find({ postedBy: req.user._id })
      .populate('claimedBy', 'name phone')
      .sort({ createdAt: -1 });
    res.json(listings.map(mapListingForClient));
  })
);

router.get(
  '/:id',
  auth,
  asyncHandler(async (req, res) => {
    const listing = await FoodListing.findById(req.params.id)
      .populate('postedBy', 'name address phone city')
      .populate('claimedBy', 'name phone');
    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }
    res.json(mapListingForClient(listing));
  })
);

router.put(
  '/:id',
  auth,
  role('restaurant'),
  upload.array('photos', 5),
  asyncHandler(async (req, res) => {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }
    if (listing.postedBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    if (listing.status !== 'available') {
      res.status(400);
      throw new Error('Cannot edit a claimed or completed listing');
    }

    const data = parseLegacyBody(req.body, req.user);
    if (data.title) listing.title = data.title;
    if (data.quantity) listing.quantity = data.quantity;
    if (data.expiresAt) listing.expiresAt = data.expiresAt;
    if (data.description) listing.description = data.description;
    if (req.body.category) listing.category = data.category;
    if (req.body.unit) listing.unit = data.unit;

    const newPhotos = await uploadPhotos(req.files);
    if (newPhotos.length) listing.photos = [...listing.photos, ...newPhotos];

    await listing.save();
    res.json(mapListingForClient(listing));
  })
);

router.delete(
  '/:id',
  auth,
  role('restaurant'),
  asyncHandler(async (req, res) => {
    const listing = await FoodListing.findById(req.params.id);
    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }
    if (listing.postedBy.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  })
);

module.exports = router;
