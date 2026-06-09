/**
 * Create default admin: admin@foodlink.app / admin123
 * Run: node config/seedAdmin.js
 */
require('dotenv').config();
const connectDB = require('./db');
const User = require('../models/User');

const seed = async () => {
  await connectDB();
  const email = process.env.ADMIN_EMAIL || 'admin@foodlink.app';
  const exists = await User.findOne({ email });
  if (exists) {
    console.log('Admin already exists');
    process.exit(0);
  }
  await User.create({
    name: 'Platform Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin',
    isApproved: true,
    isVerified: true,
  });
  console.log('Admin created:', email);
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
