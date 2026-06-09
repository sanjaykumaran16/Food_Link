const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const restaurants = await User.countDocuments({ role: 'restaurant' });
    const ngos = await User.countDocuments({ role: 'ngo' });
    const donations = await FoodListing.countDocuments({
      status: { $in: ['claimed', 'completed'] },
    });
    res.json({ restaurants, ngos, donations });
  })
);

module.exports = router;
