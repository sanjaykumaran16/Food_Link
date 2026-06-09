const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const auth = require('../middleware/auth');
const {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} = require('../utils/generateTokens');
const { geocodeAddress, buildAddressQuery } = require('../utils/geocode');

const router = express.Router();

const issueTokens = async (user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();
  user.refreshToken = hashRefreshToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  address: user.address,
  city: user.city,
  pincode: user.pincode,
  profilePhoto: user.profilePhoto,
  isVerified: user.isVerified,
  isApproved: user.isApproved,
  contactNumber: user.phone,
  location: user.location,
});

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      city,
      pincode,
      contactNumber,
    } = req.body;

    const userRole = role || req.body.userType;
    if (!name || !email || !password || !userRole) {
      res.status(400);
      throw new Error('Please provide name, email, password, and role');
    }
    if (!['restaurant', 'ngo', 'volunteer'].includes(userRole)) {
      res.status(400);
      throw new Error('Invalid role for registration');
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
      phone: phone || contactNumber || '',
      address: address || '',
      city: city || '',
      pincode: pincode || '',
      isApproved: userRole !== 'volunteer',
    };
    const geo = await geocodeAddress(buildAddressQuery(userData));
    if (geo) {
      userData.location = { type: 'Point', coordinates: [geo.lng, geo.lat] };
    }
    const user = await User.create(userData);

    const tokens = await issueTokens(user);
    res.status(201).json({
      message: 'Registration successful',
      user: publicUser(user),
      ...tokens,
      token: tokens.accessToken,
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    const query = { email: email?.toLowerCase() };
    if (role) query.role = role;

    const user = await User.findOne(query);
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }
    if (!user.isApproved) {
      res.status(403);
      throw new Error('Account pending admin approval');
    }
    if (user.isSuspended) {
      res.status(403);
      throw new Error('Account suspended');
    }

    const tokens = await issueTokens(user);
    res.json({
      message: 'Login successful',
      user: publicUser(user),
      ...tokens,
      token: tokens.accessToken,
    });
  })
);

router.post(
  '/refresh-token',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Refresh token required');
    }

    const users = await User.find({ refreshToken: { $ne: null } });
    const user = users.find(
      (u) => u.refreshToken === hashRefreshToken(refreshToken)
    );
    if (!user) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    const tokens = await issueTokens(user);
    res.json(tokens);
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    res.json(publicUser(req.user));
  })
);

router.post(
  '/logout',
  auth,
  asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ message: 'Logged out' });
  })
);

module.exports = router;
