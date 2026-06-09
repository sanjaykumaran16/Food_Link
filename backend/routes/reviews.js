const express = require('express');
const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const { reviewee, listing, rating, comment } = req.body;
    if (!reviewee || !listing || !rating) {
      res.status(400);
      throw new Error('reviewee, listing, and rating required');
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee,
      listing,
      rating,
      comment: comment || '',
    });
    res.status(201).json(review);
  })
);

router.get(
  '/:userId',
  asyncHandler(async (req, res) => {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name profilePhoto role')
      .sort({ createdAt: -1 });
    res.json(reviews);
  })
);

module.exports = router;
