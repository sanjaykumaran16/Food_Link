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

    addTimeline(claim, status, note || '');
    await claim.save();

    const io = req.app.get('io');
    if (status === 'delivered') {
      listing.status = 'completed';
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
      await listing.save();
    }

    res.json(claim);
  })
);

router.post(
  '/:id/proof',
  auth,
  role('volunteer', 'ngo', 'admin'),
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
    addTimeline(claim, 'picked_up', 'Proof photo uploaded');
    await claim.save();
    res.json(claim);
  })
);

module.exports = router;
