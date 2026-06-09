/**
 * Backward-compatible shims for existing frontend paths.
 * Delegates to unified User + listings + claims APIs.
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} = require('../utils/generateTokens');
const { geocodeAddress, buildAddressQuery } = require('../utils/geocode');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');
const { getRestaurantListingCounts } = require('../utils/restaurantStats');

const router = express.Router();

const issueTokens = async (user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();
  user.refreshToken = hashRefreshToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken, token: accessToken };
};

const registerHandler = (userRole) =>
  asyncHandler(async (req, res) => {
    const { name, email, password, address, contactNumber, city, pincode } = req.body;
    if (!name || !email || !password || !address || !contactNumber) {
      res.status(400);
      throw new Error('Please provide all required fields');
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      res.status(400);
      throw new Error('User already exists with this email');
    }
    const userData = {
      name,
      email,
      password,
      role: userRole,
      phone: contactNumber,
      address,
      city: city || '',
      pincode: pincode || '',
    };
    const geo = await geocodeAddress(buildAddressQuery(userData));
    if (geo) {
      userData.location = { type: 'Point', coordinates: [geo.lng, geo.lat] };
    }
    const user = await User.create(userData);
    const tokens = await issueTokens(user);
    res.status(201).json({
      message: `${userRole} registered successfully`,
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      contactNumber: user.phone,
      ...tokens,
    });
  });

const loginHandler = (userRole) =>
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase(), role: userRole });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    const tokens = await issueTokens(user);
    res.json({
      message: 'Login successful',
      _id: user._id,
      name: user.name,
      email: user.email,
      ...tokens,
    });
  });

const meHandler = asyncHandler(async (req, res) => {
  const u = req.user;
  const payload = {
    ...u.toObject(),
    contactNumber: u.phone,
    type: u.role,
  };

  if (u.role === 'restaurant') {
    const [listingCounts, unreadNotificationCount] = await Promise.all([
      getRestaurantListingCounts(u._id),
      Notification.countDocuments({ user: u._id, isRead: false }),
    ]);
    payload.listingCounts = listingCounts;
    payload.unreadNotificationCount = unreadNotificationCount;
  }

  if (u.role === 'ngo') {
    const receivedCount = await FoodListing.countDocuments({
      claimedBy: u._id,
      status: { $in: ['claimed', 'completed'] },
    });
    payload.receivedCount = receivedCount;
  }

  res.json(payload);
});

module.exports = {
  restaurantRouter: (() => {
    const r = express.Router();
    r.post('/register', registerHandler('restaurant'));
    r.post('/login', loginHandler('restaurant'));
    r.get('/me', auth, role('restaurant'), meHandler);
    return r;
  })(),
  ngoRouter: (() => {
    const r = express.Router();
    r.post('/register', registerHandler('ngo'));
    r.post('/login', loginHandler('ngo'));
    r.get('/me', auth, role('ngo'), meHandler);
    return r;
  })(),
};
