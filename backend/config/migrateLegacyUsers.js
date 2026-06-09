/**
 * One-time migration: Restaurant + NGO collections → User
 * Run: node config/migrateLegacyUsers.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('../models/User');

const migrate = async () => {
  await connectDB();
  const Restaurant = mongoose.models.Restaurant || require('../models/Restaurant');
  const NGO = mongoose.models.NGO || require('../models/Ngo');

  const restaurants = await Restaurant.find();
  for (const r of restaurants) {
    const exists = await User.findOne({ email: r.email.toLowerCase() });
    if (!exists) {
      await User.collection.insertOne({
        name: r.name,
        email: r.email.toLowerCase(),
        password: r.password,
        role: 'restaurant',
        phone: r.contactNumber || '',
        address: r.address || '',
        city: '',
        pincode: '',
        isApproved: true,
        isVerified: false,
        isSuspended: false,
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Migrated restaurant:', r.email);
    }
  }

  const ngos = await NGO.find();
  for (const n of ngos) {
    const exists = await User.findOne({ email: n.email.toLowerCase() });
    if (!exists) {
      await User.collection.insertOne({
        name: n.name,
        email: n.email.toLowerCase(),
        password: n.password,
        role: 'ngo',
        phone: n.contactNumber || '',
        address: n.address || '',
        city: '',
        pincode: '',
        isApproved: true,
        isVerified: false,
        isSuspended: false,
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('Migrated NGO:', n.email);
    }
  }

  console.log('Migration complete');
  process.exit(0);
};

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
