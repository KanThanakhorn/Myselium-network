const mongoose = require('mongoose');
const User = require('../models/User');
const SensorNode = require('../models/SensorNode');
const Alert = require('../models/Alert');
const { seedNodes } = require('../controllers/nodeController');
const { seedAlerts } = require('../controllers/alertController');

const seedDB = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('MongoDB not connected. Skipping database seeding.');
      return;
    }

    console.log('Checking database collections for seeding...');

    // 1. Seed Users
    const userCount = await User.countDocuments({});
    if (userCount === 0) {
      console.log('Seeding default users...');
      await User.create([
        {
          email: 'admin@mycelium.org',
          password: 'password',
          role: 'admin',
          name: 'Somchai Jaidee (Admin)',
          permissions: ['all'],
        },
        {
          email: 'ranger@mycelium.org',
          password: 'password',
          role: 'ranger',
          name: 'Ranger Kittisak',
          permissions: ['read', 'acknowledge', 'resolve'],
        }
      ]);
      console.log('Default users seeded successfully.');
    }

    // 2. Seed Sensor Nodes
    const nodeCount = await SensorNode.countDocuments({});
    if (nodeCount === 0) {
      console.log('Seeding default sensor nodes...');
      await SensorNode.insertMany(seedNodes);
      console.log('Default sensor nodes seeded successfully.');
    }

    // 3. Seed Alerts
    const alertCount = await Alert.countDocuments({});
    if (alertCount === 0) {
      console.log('Seeding default alerts...');
      await Alert.insertMany(seedAlerts);
      console.log('Default alerts seeded successfully.');
    }

    console.log('Database check/seeding completed.');
  } catch (error) {
    console.error('Database Seeding Error:', error.message);
  }
};

module.exports = seedDB;
