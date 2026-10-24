const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function updateAdminKey() {
  try {
    // Connect to MongoDB - same logic as server.js
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glimmr';
    try {
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection failed, using in-memory server');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to in-memory MongoDB');
    }

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@glimmr.com' });
    if (!adminUser) {
      console.log('Admin user not found');
      return;
    }

    // Update admin key if not exists
    if (!adminUser.adminKey) {
      const adminKey = 'GLIMMR-ADMIN-DEFAULT';
      const hashedAdminKey = await bcrypt.hash(adminKey, 10);
      adminUser.adminKey = hashedAdminKey;
      await adminUser.save();
      console.log('Admin key updated successfully');
      console.log('Admin Email: admin@glimmr.com');
      console.log('Admin Password: admin123');
      console.log('Admin Key: GLIMMR-ADMIN-DEFAULT');
    } else {
      console.log('Admin key already exists');
      console.log('Admin Email: admin@glimmr.com');
      console.log('Admin Password: admin123');
      console.log('Admin Key: GLIMMR-ADMIN-DEFAULT');
    }

  } catch (error) {
    console.error('Error updating admin key:', error);
  } finally {
    await mongoose.connection.close();
  }
}

updateAdminKey();
