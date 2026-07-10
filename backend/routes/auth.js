const express = require('express');
const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/auth');
const {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} = require('../utils/generateTokens');
const { geocodeAddress, buildAddressQuery } = require('../utils/geocode');
const { sendEmail } = require('../utils/emailService');

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
  preferredCategories: user.preferredCategories || [],
  dailyMealCapacity: user.dailyMealCapacity ?? 100,
  serviceRadiusKm: user.serviceRadiusKm ?? 15,
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
    if (!['restaurant', 'ngo'].includes(userRole)) {
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
      isApproved: true,
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

router.patch(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const {
      name,
      phone,
      address,
      city,
      pincode,
      preferredCategories,
      dailyMealCapacity,
      serviceRadiusKm,
    } = req.body;

    if (name) user.name = name;
    if (phone != null) user.phone = phone;
    if (address != null) user.address = address;
    if (city != null) user.city = city;
    if (pincode != null) user.pincode = pincode;

    if (user.role === 'ngo') {
      if (Array.isArray(preferredCategories)) {
        user.preferredCategories = preferredCategories;
      }
      if (dailyMealCapacity != null) {
        user.dailyMealCapacity = Math.max(0, Number(dailyMealCapacity) || 0);
      }
      if (serviceRadiusKm != null) {
        user.serviceRadiusKm = Math.max(1, Number(serviceRadiusKm) || 15);
      }
    }

    if (address || city || pincode) {
      const geo = await geocodeAddress(buildAddressQuery(user));
      if (geo) {
        user.location = { type: 'Point', coordinates: [geo.lng, geo.lat] };
      }
    }

    await user.save();
    res.json(publicUser(user));
  })
);

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
router.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const { email, role } = req.body;
    if (!email || !role) {
      res.status(400);
      throw new Error('Please provide email and role');
    }

    const user = await User.findOne({ email: email.toLowerCase(), role });
    if (!user) {
      res.status(404);
      throw new Error('No account found with this email and role');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset for your ${role} account on Food Link.</p>
      <p>Please click the link below to reset your password. This link is valid for 1 hour:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Food Link Password Reset Request',
        html: message,
      });
      res.json({ message: 'Password reset link sent to your email' });
    } catch (err) {
      console.error('[SMTP Error] Details:', err);
      console.log('--------------------------------------------------');
      console.log('PASSWORD RESET LINK (Local Copy for Testing):');
      console.log(resetUrl);
      console.log('--------------------------------------------------');
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      res.status(500);
      throw new Error('Email could not be sent. Please check backend terminal logs for details / local reset link.');
    }
  })
);

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
router.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const { email, token, password } = req.body;
    if (!email || !token || !password) {
      res.status(400);
      throw new Error('Please provide email, token, and new password');
    }
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can now log in.' });
  })
);

module.exports = router;
