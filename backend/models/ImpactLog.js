const mongoose = require('mongoose');

const impactLogSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    quantityKg: { type: Number, default: 0 },
    mealsEstimate: { type: Number, default: 0 },
    co2SavedKg: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImpactLog', impactLogSchema);
