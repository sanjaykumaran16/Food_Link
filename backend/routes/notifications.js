const express = require('express');
const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

router.get(
  '/',
  auth,
  asyncHandler(async (req, res) => {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('relatedListing', 'title')
      .sort({ createdAt: -1 })
      .limit(100);

    const mapped = notifications.map((n) => {
      const doc = n.toObject();
      return {
        ...doc,
        recipient: doc.user,
        foodListing: doc.relatedListing,
        message: doc.message,
        senderNgo: doc.type === 'claim' ? { name: doc.title } : undefined,
      };
    });
    res.json(mapped);
  })
);

router.patch(
  '/read-all',
  auth,
  asyncHandler(async (req, res) => {
    const result = await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All marked read', modifiedCount: result.modifiedCount });
  })
);

router.delete(
  '/all',
  auth,
  asyncHandler(async (req, res) => {
    const result = await Notification.deleteMany({ user: req.user._id });
    res.json({ message: 'Deleted', deletedCount: result.deletedCount });
  })
);

module.exports = router;
