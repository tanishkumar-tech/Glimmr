const mongoose = require('mongoose');
const User = require('../models/User');

async function getAdminCredentials() {
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
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found');
      return;
    }

    console.log('Admin user found:');
    console.log('=====================================');
    console.log('Admin Email:', adminUser.email);
    console.log('Admin Name:', adminUser.name);
    console.log('Admin Role:', adminUser.role);
    console.log('=====================================');
    console.log('⚠️  Note: Password and admin key are hashed in the database.');
    console.log('⚠️  You need the original password and admin key used during creation.');

  } catch (error) {
    console.error('Error retrieving admin user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

getAdminCredentials();
