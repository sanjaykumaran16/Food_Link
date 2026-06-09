const mongoose = require('mongoose');

const listingTemplateSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'bakery', 'dairy'],
      required: true,
    },
    quantity: { type: Number, required: true },
    unit: {
      type: String,
      enum: ['kg', 'portions', 'boxes', 'litres'],
      required: true,
    },
    allergens: [{ type: String }],
    pickupAddress: { type: String, default: '' },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    defaultPickupHoursAhead: { type: Number, default: 2 },
    defaultDurationHours: { type: Number, default: 4 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ListingTemplate', listingTemplateSchema);
