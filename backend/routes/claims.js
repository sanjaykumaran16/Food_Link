const express = require('express');
const asyncHandler = require('express-async-handler');
const Claim = require('../models/Claim');
const FoodListing = require('../models/FoodListing');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const { uploadBuffer } = require('../utils/uploadCloudinary');
const { createNotification } = require('../utils/notifications');
const { estimateImpact } = require('../utils/impactCalculator');
const ImpactLog = require('../models/ImpactLog');
const { sendEmail } = require('../utils/emailService');
const {
  validatePickupConfirmation,
  validateDeliveryConfirmation,
  appendAuditEntry,
} = require('../utils/foodSafety');

const router = express.Router();

const addTimeline = (claim, status, note = '') => {
  claim.timeline.push({ status, timestamp: new Date(), note });
  claim.status = status;
};

router.post(
  '/:listingId',
  auth,
  role('ngo'),
  asyncHandler(async (req, res) => {
    const listing = await FoodListing.findById(req.params.listingId).populate(
      'postedBy',
      'name email'
    );
    if (!listing) {
      res.status(404);
      throw new Error('Listing not found');
    }
    if (listing.status !== 'available') {
      res.status(400);
      throw new Error('Listing is no longer available');
    }
    if (listing.safetyStatus !== 'verified') {
      res.status(400);
      throw new Error('Listing has not passed food safety verification');
    }

    const existing = await Claim.findOne({
      listing: listing._id,
      status: { $nin: ['cancelled'] },
    });
    if (existing) {
      res.status(400);
      throw new Error('Listing already claimed');
    }

    const claim = await Claim.create({
      listing: listing._id,
      claimedBy: req.user._id,
      timeline: [{ status: 'claimed', timestamp: new Date(), note: 'NGO claimed listing' }],
    });

    listing.status = 'claimed';
    listing.claimedBy = req.user._id;
    await listing.save();

    const io = req.app.get('io');
    await createNotification({
      user: listing.postedBy._id || listing.postedBy,
      type: 'claim',
      title: 'Food listing claimed',
      message: `${req.user.name} claimed "${listing.title}".`,
      relatedListing: listing._id,
      io,
    });

    if (listing.postedBy?.email) {
      await sendEmail({
        to: listing.postedBy.email,
        subject: 'Your food listing was claimed',
        html: `<p>${req.user.name} claimed your listing "${listing.title}".</p>`,
      });
    }

    res.status(201).json(claim);
  })
);

router.get(
  '/my',
  auth,
  asyncHandler(async (req, res) => {
    const filter =
      req.user.role === 'ngo'
        ? { claimedBy: req.user._id }
        : req.user.role === 'volunteer'
          ? { volunteer: req.user._id }
          : { listing: { $in: await FoodListing.find({ postedBy: req.user._id }).distinct('_id') } };

    const claims = await Claim.find(filter)
      .populate({
        path: 'listing',
        populate: { path: 'postedBy', select: 'name address phone' },
      })
      .populate('claimedBy', 'name phone')
      .populate('volunteer', 'name phone')
      .sort({ createdAt: -1 });

    res.json(claims);
  })
);

router.post(
  '/:id/confirm-pickup-safety',
  auth,
  asyncHandler(async (req, res) => {
    const claim = await Claim.findById(req.params.id).populate('listing');
    if (!claim) {
      res.status(404);
      throw new Error('Claim not found');
    }

    const isNgoOrVolunteer =
      claim.claimedBy.toString() === req.user._id.toString() ||
      claim.volunteer?.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isNgoOrVolunteer) {
      res.status(403);
      throw new Error('Not authorized');
    }

    const confirmation = {
      receivedInSafeCondition: Boolean(req.body.receivedInSafeCondition),
      tempVerified: Boolean(req.body.tempVerified),
      packagingIntact: Boolean(req.body.packagingIntact),
      withinTimeLimit: Boolean(req.body.withinTimeLimit),
      notes: req.body.notes || '',
      confirmedAt: new Date(),
      confirmedBy: req.user._id,
    };

    const validation = validatePickupConfirmation(confirmation);
    if (!validation.valid) {
      res.status(400);
      throw new Error(validation.message);
    }

    claim.pickupSafetyConfirmation = confirmation;
    addTimeline(claim, 'picked_up', 'Pickup safety confirmed');
    await claim.save();

    const listing = claim.listing;
    listing.safetyStatus = 'pickup_confirmed';
    appendAuditEntry(listing, 'pickup_confirmed', req.user._id, confirmation.notes);
    await listing.save();

    res.json(claim);
  })
);

router.post(
  '/:id/confirm-delivery-safety',
  auth,
  asyncHandler(async (req, res) => {
    const claim = await Claim.findById(req.params.id).populate('listing');
    if (!claim) {
      res.status(404);
      throw new Error('Claim not found');
    }

    const isNgoOrVolunteer =
      claim.claimedBy.toString() === req.user._id.toString() ||
      claim.volunteer?.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isNgoOrVolunteer) {
      res.status(403);
      throw new Error('Not authorized');
    }

    if (claim.status !== 'picked_up') {
      res.status(400);
      throw new Error('Confirm pickup safety before delivery confirmation');
    }

    const confirmation = {
      distributedSafely: Boolean(req.body.distributedSafely),
      recipientsInformed: Boolean(req.body.recipientsInformed),
      notes: req.body.notes || '',
      confirmedAt: new Date(),
      confirmedBy: req.user._id,
    };

    const validation = validateDeliveryConfirmation(confirmation);
    if (!validation.valid) {
      res.status(400);
      throw new Error(validation.message);
    }

    claim.deliverySafetyConfirmation = confirmation;
    addTimeline(claim, 'delivered', 'Delivery safety confirmed');
    await claim.save();

    const listing = claim.listing;
    listing.status = 'completed';
    listing.safetyStatus = 'completed';
    appendAuditEntry(listing, 'delivery_confirmed', req.user._id, confirmation.notes);
    await listing.save();

    const impact = estimateImpact(listing.quantity, listing.unit);
    await ImpactLog.create({
      restaurant: listing.postedBy,
      ngo: claim.claimedBy,
      listing: listing._id,
      ...impact,
    });

    const io = req.app.get('io');
    await createNotification({
      user: listing.postedBy,
      type: 'claim',
      title: 'Delivery completed',
      message: `"${listing.title}" was delivered with safety confirmation.`,
      relatedListing: listing._id,
      io,
    });

    res.json(claim);
  })
);

router.patch(
  '/:id/status',
  auth,
  asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const allowed = ['claimed', 'volunteer_assigned', 'picked_up', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    const claim = await Claim.findById(req.params.id).populate('listing');
    if (!claim) {
      res.status(404);
      throw new Error('Claim not found');
    }

    const listing = claim.listing;
    const isOwner =
      listing.postedBy?.toString() === req.user._id.toString() ||
      claim.claimedBy.toString() === req.user._id.toString() ||
      claim.volunteer?.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isOwner) {
      res.status(403);
      throw new Error('Not authorized');
    }

    if (status === 'picked_up') {
      const pickupValid = validatePickupConfirmation(claim.pickupSafetyConfirmation);
      if (!pickupValid.valid) {
        res.status(400);
        throw new Error('Submit pickup safety confirmation before marking picked up.');
      }
    }

    if (status === 'delivered') {
      const deliveryValid = validateDeliveryConfirmation(claim.deliverySafetyConfirmation);
      if (!deliveryValid.valid) {
        res.status(400);
        throw new Error('Submit delivery safety confirmation before completing.');
      }
    }

    addTimeline(claim, status, note || '');
    await claim.save();

    const io = req.app.get('io');
    if (status === 'delivered') {
      listing.status = 'completed';
      listing.safetyStatus = 'completed';
      await listing.save();

      const impact = estimateImpact(listing.quantity, listing.unit);
      await ImpactLog.create({
        restaurant: listing.postedBy,
        ngo: claim.claimedBy,
        listing: listing._id,
        ...impact,
      });

      await createNotification({
        user: listing.postedBy,
        type: 'claim',
        title: 'Delivery completed',
        message: `"${listing.title}" was delivered successfully.`,
        relatedListing: listing._id,
        io,
      });
    } else if (status === 'cancelled') {
      listing.status = 'available';
      listing.claimedBy = null;
      listing.safetyStatus = 'verified';
      await listing.save();
    }

    res.json(claim);
  })
);

router.post(
  '/:id/proof',
  auth,
  role('ngo', 'admin'),
  upload.single('proof'),
  asyncHandler(async (req, res) => {
    const claim = await Claim.findById(req.params.id);
    if (!claim) {
      res.status(404);
      throw new Error('Claim not found');
    }
    if (!req.file) {
      res.status(400);
      throw new Error('Proof photo required');
    }

    const result = await uploadBuffer(req.file.buffer, 'foodlink/proof');
    claim.proofPhoto = result.secure_url;
    claim.timeline.push({
      status: claim.status,
      timestamp: new Date(),
      note: 'Proof photo uploaded',
    });
    await claim.save();
    res.json(claim);
  })
);

module.exports = router;
