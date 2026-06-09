const mongoose = require('mongoose');

const foodListingSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'bakery', 'dairy'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    unit: {
      type: String,
      enum: ['kg', 'portions', 'boxes', 'litres'],
      required: true,
    },
    allergens: [{ type: String }],
    photos: [{ type: String }],
    pickupAddress: { type: String, required: true },
    city: { type: String, default: '' },
    pincode: { type: String, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    pickupWindowStart: { type: Date, required: true },
    pickupWindowEnd: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['available', 'claimed', 'completed', 'expired'],
      default: 'available',
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deliveryVolunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    safetyChecklist: {
      properlyStored: { type: Boolean, default: false },
      withinSafeTemp: { type: Boolean, default: false },
      labeledCorrectly: { type: Boolean, default: false },
      noCrossContamination: { type: Boolean, default: false },
    },
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ListingTemplate', default: null },
  },
  { timestamps: true }
);

foodListingSchema.index({ location: '2dsphere' });
foodListingSchema.index({ status: 1, city: 1, category: 1 });
foodListingSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('FoodListing', foodListingSchema);
