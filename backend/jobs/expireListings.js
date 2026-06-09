const cron = require('node-cron');
const FoodListing = require('../models/FoodListing');

const startExpireListingsJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      const result = await FoodListing.updateMany(
        { status: 'available', expiresAt: { $lt: new Date() } },
        { $set: { status: 'expired' } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[cron] Expired ${result.modifiedCount} listings`);
      }
    } catch (err) {
      console.error('[cron] expire listings error:', err);
    }
  });
};

module.exports = { startExpireListingsJob };
