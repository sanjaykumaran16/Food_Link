const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodListing',
      required: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['claimed', 'volunteer_assigned', 'picked_up', 'delivered', 'cancelled'],
      default: 'claimed',
    },
    proofPhoto: { type: String, default: '' },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

claimSchema.index({ claimedBy: 1, status: 1 });
claimSchema.index({ volunteer: 1, status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
