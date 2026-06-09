const express = require('express');
const asyncHandler = require('express-async-handler');
const Claim = require('../models/Claim');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { createNotification } = require('../utils/notifications');

const router = express.Router();

router.get(
  '/tasks',
  auth,
  role('volunteer'),
  asyncHandler(async (req, res) => {
    const tasks = await Claim.find({
      status: { $in: ['claimed', 'volunteer_assigned', 'picked_up'] },
      $or: [{ volunteer: null }, { volunteer: req.user._id }],
    })
      .populate({
        path: 'listing',
        populate: { path: 'postedBy', select: 'name address phone' },
      })
      .populate('claimedBy', 'name phone address')
      .sort({ createdAt: -1 });
    res.json(tasks);
  })
);

router.post(
  '/tasks/:claimId/accept',
  auth,
  role('volunteer'),
  asyncHandler(async (req, res) => {
    const claim = await Claim.findById(req.params.claimId).populate('listing');
    if (!claim) {
      res.status(404);
      throw new Error('Task not found');
    }
    if (claim.volunteer) {
      res.status(400);
      throw new Error('Task already assigned');
    }

    claim.volunteer = req.user._id;
    claim.timeline.push({
      status: 'volunteer_assigned',
      timestamp: new Date(),
      note: `${req.user.name} accepted delivery`,
    });
    claim.status = 'volunteer_assigned';
    await claim.save();

    if (claim.listing) {
      claim.listing.deliveryVolunteer = req.user._id;
      await claim.listing.save();
    }

    const io = req.app.get('io');
    await createNotification({
      user: claim.claimedBy,
      type: 'volunteer',
      title: 'Volunteer assigned',
      message: `${req.user.name} will handle delivery.`,
      relatedListing: claim.listing?._id,
      io,
    });

    res.json(claim);
  })
);

router.patch(
  '/tasks/:claimId/update',
  auth,
  role('volunteer'),
  asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const claim = await Claim.findById(req.params.claimId);
    if (!claim) {
      res.status(404);
      throw new Error('Task not found');
    }
    if (claim.volunteer?.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not your task');
    }

    claim.timeline.push({ status, timestamp: new Date(), note: note || '' });
    claim.status = status;
    await claim.save();
    res.json(claim);
  })
);

module.exports = router;
