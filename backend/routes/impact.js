const express = require('express');
const asyncHandler = require('express-async-handler');
const ImpactLog = require('../models/ImpactLog');
const User = require('../models/User');
const FoodListing = require('../models/FoodListing');
const auth = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const { getRestaurantImpactFromListings } = require('../utils/restaurantStats');

const router = express.Router();

const aggregateImpact = async (filter) => {
  const result = await ImpactLog.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalKg: { $sum: '$quantityKg' },
        totalMeals: { $sum: '$mealsEstimate' },
        totalCo2: { $sum: '$co2SavedKg' },
        count: { $sum: 1 },
      },
    },
  ]);
  return (
    result[0] || { totalKg: 0, totalMeals: 0, totalCo2: 0, count: 0 }
  );
};

router.get(
  '/platform',
  asyncHandler(async (req, res) => {
    const impact = await aggregateImpact({});
    const restaurants = await User.countDocuments({ role: 'restaurant' });
    const ngos = await User.countDocuments({ role: 'ngo' });
    const donations = await FoodListing.countDocuments({
      status: { $in: ['claimed', 'completed'] },
    });

    res.json({
      restaurants,
      ngos,
      donations: donations || impact.count,
      meals: impact.totalMeals,
      co2SavedKg: impact.totalCo2,
      kgRescued: impact.totalKg,
    });
  })
);

router.get(
  '/restaurant/:id',
  auth,
  asyncHandler(async (req, res) => {
    if (req.user._id.toString() !== req.params.id) {
      res.status(403);
      throw new Error('Not authorized to view this impact data');
    }
    const impact = await getRestaurantImpactFromListings(req.params.id);
    res.json(impact);
  })
);

router.get(
  '/ngo/:id',
  auth,
  asyncHandler(async (req, res) => {
    const impact = await aggregateImpact({ ngo: req.params.id });
    res.json(impact);
  })
);

router.get(
  '/certificate/:userId',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const impact =
      user.role === 'restaurant'
        ? await getRestaurantImpactFromListings(user._id)
        : await aggregateImpact({ ngo: user._id });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=foodlink-impact-${user._id}.pdf`
    );

    const doc = new PDFDocument();
    doc.pipe(res);
    doc.fontSize(22).text('FoodLink Impact Certificate', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Awarded to: ${user.name}`);
    doc.text(`Role: ${user.role}`);
    doc.moveDown();
    doc.text(`Meals provided: ${impact.totalMeals}`);
    doc.text(`Food rescued (kg): ${impact.totalKg}`);
    doc.text(`CO₂ saved (kg): ${impact.totalCo2}`);
    doc.text(`Completed rescues: ${impact.count}`);
    doc.end();
  })
);

module.exports = router;
