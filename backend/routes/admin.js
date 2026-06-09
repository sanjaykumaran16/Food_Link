const express = require('express');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const Claim = require('../models/Claim');
const ImpactLog = require('../models/ImpactLog');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/upload');
const { uploadBuffer } = require('../utils/uploadCloudinary');

const router = express.Router();

router.use(auth, role('admin'));

router.get(
  '/users',
  asyncHandler(async (req, res) => {
    const { role: roleFilter } = req.query;
    const filter = roleFilter ? { role: roleFilter } : {};
    const users = await User.find(filter).select('-password -refreshToken').sort({ createdAt: -1 });
    res.json(users);
  })
);

router.patch(
  '/users/:id/approve',
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password -refreshToken');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  })
);

router.patch(
  '/users/:id/suspend',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.isSuspended = !user.isSuspended;
    await user.save();
    res.json(user);
  })
);

router.post(
  '/users/:id/documents',
  upload.single('document'),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (!req.file) {
      res.status(400);
      throw new Error('Document file required');
    }
    const result = await uploadBuffer(req.file.buffer, 'foodlink/documents');
    user.documents.push({ type: req.body.type || 'verification', url: result.secure_url });
    if (req.body.markVerified === 'true') user.isVerified = true;
    await user.save();
    res.json(user);
  })
);

router.get(
  '/listings',
  asyncHandler(async (req, res) => {
    const listings = await FoodListing.find()
      .populate('postedBy', 'name email role')
      .populate('claimedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(listings);
  })
);

router.get(
  '/analytics',
  asyncHandler(async (req, res) => {
    const [usersByRole, listingsByStatus, claimsByStatus, impact] = await Promise.all([
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      FoodListing.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Claim.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ImpactLog.aggregate([
        {
          $group: {
            _id: null,
            meals: { $sum: '$mealsEstimate' },
            kg: { $sum: '$quantityKg' },
            co2: { $sum: '$co2SavedKg' },
          },
        },
      ]),
    ]);

    res.json({
      usersByRole,
      listingsByStatus,
      claimsByStatus,
      impact: impact[0] || { meals: 0, kg: 0, co2: 0 },
    });
  })
);

module.exports = router;
