const express = require('express');
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Claim = require('../models/Claim');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews  — NGO submits a review for a restaurant after delivery
router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'ngo') {
      res.status(403);
      throw new Error('Only NGOs can submit reviews');
    }

    const { reviewee, listing, rating, comment } = req.body;
    if (!reviewee || !listing || !rating) {
      res.status(400);
      throw new Error('reviewee, listing, and rating are required');
    }
    if (rating < 1 || rating > 5) {
      res.status(400);
      throw new Error('Rating must be between 1 and 5');
    }

    // Guard: only allow review if NGO has a delivered claim on this listing
    const validClaim = await Claim.findOne({
      listing,
      claimedBy: req.user._id,
      status: 'delivered',
    });
    if (!validClaim) {
      res.status(403);
      throw new Error('You can only review a restaurant after a completed (delivered) donation');
    }

    // Guard: prevent duplicate reviews
    const existing = await Review.findOne({ reviewer: req.user._id, listing });
    if (existing) {
      res.status(400);
      throw new Error('You have already reviewed this listing');
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee,
      listing,
      rating: Number(rating),
      comment: comment || '',
    });

    const populated = await review.populate('reviewer', 'name profilePhoto role');
    res.status(201).json(populated);
  })
);

// GET /api/reviews/restaurant/:userId  — all reviews for a restaurant (with avg rating)
router.get(
  '/restaurant/:userId',
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name profilePhoto role')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });

    const avgRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    res.json({ reviews, avgRating, totalCount: reviews.length });
  })
);

// GET /api/reviews/my  — reviews the logged-in user has written
router.get(
  '/my',
  auth,
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ reviewer: req.user._id })
      .populate('reviewee', 'name')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  })
);

// GET /api/reviews/check/:listingId  — check if current user already reviewed this listing
router.get(
  '/check/:listingId',
  auth,
  asyncHandler(async (req, res) => {
    const existing = await Review.findOne({
      reviewer: req.user._id,
      listing: req.params.listingId,
    });

    // Also check if a delivered claim exists
    const validClaim = await Claim.findOne({
      listing: req.params.listingId,
      claimedBy: req.user._id,
      status: 'delivered',
    });

    res.json({
      canReview: !!validClaim && !existing,
      alreadyReviewed: !!existing,
      hasDeliveredClaim: !!validClaim,
    });
  })
);

// Legacy: GET /api/reviews/:userId  — kept for backward compat
router.get(
  '/:userId',
  asyncHandler(async (req, res) => {
    // If the param looks like a listing ID query, redirect to restaurant lookup
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name profilePhoto role')
      .sort({ createdAt: -1 });
    res.json(reviews);
  })
);

module.exports = router;
