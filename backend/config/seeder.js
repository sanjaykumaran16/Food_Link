require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Restaurant = require('../models/Restaurant');
const Ngo = require('../models/Ngo');
const FoodListing = require('../models/FoodListing');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI;

const seedData = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI is missing from backend env variables!');
    }

    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected. Cleaning existing data...');

    // Clear old data
    await Restaurant.deleteMany({});
    await Ngo.deleteMany({});
    await FoodListing.deleteMany({});
    await Notification.deleteMany({});

    console.log('Existing collections cleared.');

    // Passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('Inserting Restaurants...');
    const restaurants = await Restaurant.create([
      {
        name: 'Green Bistro',
        email: 'bistro@example.com',
        password: hashedPassword,
        address: '142 S Olive St, Los Angeles, CA',
        contactNumber: '213-555-0199',
      },
      {
        name: 'Downtown Bakeries',
        email: 'bakery@example.com',
        password: hashedPassword,
        address: '808 Broadway, Los Angeles, CA',
        contactNumber: '213-555-0215',
      },
      {
        name: 'Fresh Harvest Salad Bar',
        email: 'harvest@example.com',
        password: hashedPassword,
        address: '456 Hill St, Los Angeles, CA',
        contactNumber: '213-555-0344',
      }
    ]);

    console.log('Inserting NGOs...');
    const ngos = await Ngo.create([
      {
        name: 'Community Table Food Bank',
        email: 'table@example.com',
        password: hashedPassword,
        address: '910 Hope St, Los Angeles, CA',
        contactNumber: '213-555-9080',
      },
      {
        name: 'Hope Food Agency',
        email: 'hope@example.com',
        password: hashedPassword,
        address: '1004 Grand Ave, Los Angeles, CA',
        contactNumber: '213-555-4420',
      }
    ]);

    console.log('Inserting Food Listings...');
    const now = new Date();

    // 1. Available listings
    const l1 = await FoodListing.create({
      restaurant: restaurants[0]._id,
      itemName: 'Organic Vegetarian Salads & Warm Wraps',
      quantity: 25,
      expiryDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Expires in 2 hours (Urgent!)
      address: restaurants[0].address,
      status: 'Available'
    });

    const l2 = await FoodListing.create({
      restaurant: restaurants[1]._id,
      itemName: 'Surplus Sourdough Loaves & Croissants',
      quantity: 40,
      expiryDate: new Date(now.getTime() + 10 * 60 * 60 * 1000), // Expires in 10 hours (Amber!)
      address: restaurants[1].address,
      status: 'Available'
    });

    const l3 = await FoodListing.create({
      restaurant: restaurants[2]._id,
      itemName: 'Daily Buffet Rice & Vegetable Curry',
      quantity: 15,
      expiryDate: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Expires in 24 hours (Normal)
      address: restaurants[2].address,
      status: 'Available'
    });

    // 2. Already Claimed listings
    const l4 = await FoodListing.create({
      restaurant: restaurants[0]._id,
      itemName: 'Delicious Seafood Pastas',
      quantity: 12,
      expiryDate: new Date(now.getTime() - 2 * 60 * 60 * 1000), // Expired past
      address: restaurants[0].address,
      status: 'Collected',
      collectedByNgo: ngos[0]._id,
      collectionTime: now
    });

    const l5 = await FoodListing.create({
      restaurant: restaurants[1]._id,
      itemName: 'Warm Fruit Danishes',
      quantity: 30,
      expiryDate: new Date(now.getTime() - 5 * 60 * 60 * 1000), // Expired past
      address: restaurants[1].address,
      status: 'Collected',
      collectedByNgo: ngos[1]._id,
      collectionTime: now
    });

    console.log('Inserting Notifications...');
    await Notification.create([
      {
        recipient: restaurants[0]._id,
        senderNgo: ngos[0]._id,
        foodListing: l4._id,
        message: `${ngos[0].name} has successfully claimed and collected your listing for "Delicious Seafood Pastas".`,
        type: 'Claim',
        isRead: false
      },
      {
        recipient: restaurants[1]._id,
        senderNgo: ngos[1]._id,
        foodListing: l5._id,
        message: `${ngos[1].name} has claimed and collected your listing for "Warm Fruit Danishes".`,
        type: 'Claim',
        isRead: true
      }
    ]);

    console.log('----------------------------------------');
    console.log('Database seeded successfully!');
    console.log('Dummy Credentials for testing:');
    console.log('Restaurant Donor: bistro@example.com (password: password123)');
    console.log('NGO Partner:      table@example.com  (password: password123)');
    console.log('----------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
