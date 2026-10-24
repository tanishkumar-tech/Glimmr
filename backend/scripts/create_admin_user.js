const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

function generateAdminKey() {
  const prefix = 'GLIMMR-ADMIN-';
  const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${randomPart1}-${randomPart2}`;
}

async function createAdminUser() {
  try {
    // Connect to MongoDB - same logic as server.js
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glimmr';
    try {
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB for admin creation');
    } catch (err) {
      console.error('MongoDB connection failed, using in-memory server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('Connected to in-memory MongoDB for admin creation');
    }

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Generate unique admin key
    const adminKey = generateAdminKey();
    const hashedAdminKey = await bcrypt.hash(adminKey, 10);

    // Generate secure password
    const password = Math.random().toString(36).slice(-12) + 'A1!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email
    const email = `admin-${Date.now()}@glimmr.com`;

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: email,
      password: hashedPassword,
      phone: '9999999999',
      role: 'admin',
      adminKey: hashedAdminKey,
      addresses: []
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('=====================================');
    console.log('Admin Email:', email);
    console.log('Admin Password:', password);
    console.log('Admin Key:', adminKey);
    console.log('=====================================');
    console.log('⚠️  IMPORTANT: Save these credentials securely!');
    console.log('⚠️  The admin key is required for admin login.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createAdminUser();
