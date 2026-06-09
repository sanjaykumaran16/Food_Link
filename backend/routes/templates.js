const express = require('express');
const asyncHandler = require('express-async-handler');
const ListingTemplate = require('../models/ListingTemplate');
const FoodListing = require('../models/FoodListing');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.get(
  '/',
  auth,
  role('restaurant'),
  asyncHandler(async (req, res) => {
    const templates = await ListingTemplate.find({ owner: req.user._id }).sort({
      updatedAt: -1,
    });
    res.json(templates);
  })
);

router.post(
  '/',
  auth,
  role('restaurant'),
  asyncHandler(async (req, res) => {
    const template = await ListingTemplate.create({ ...req.body, owner: req.user._id });
    res.status(201).json(template);
  })
);

router.post(
  '/:id/post',
  auth,
  role('restaurant'),
  asyncHandler(async (req, res) => {
    const template = await ListingTemplate.findById(req.params.id);
    if (!template || template.owner.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Template not found');
    }

    const now = new Date();
    const end = new Date(
      now.getTime() + (template.defaultDurationHours || 4) * 60 * 60 * 1000
    );

    const listing = await FoodListing.create({
      postedBy: req.user._id,
      title: template.title,
      description: template.description,
      category: template.category,
      quantity: template.quantity,
      unit: template.unit,
      allergens: template.allergens,
      pickupAddress: template.pickupAddress || req.user.address,
      city: template.city || req.user.city,
      pincode: template.pincode || req.user.pincode,
      pickupWindowStart: now,
      pickupWindowEnd: end,
      expiresAt: end,
      templateId: template._id,
      status: 'available',
    });

    res.status(201).json(listing);
  })
);

module.exports = router;
