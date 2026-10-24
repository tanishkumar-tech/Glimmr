require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createUser() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://Ayush:12345@cluster0.qhs1btd.mongodb.net/';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const phone = process.env.TEST_CREATE_PHONE || '+919999000111';
  const password = process.env.TEST_CREATE_PASSWORD || 'password123';

  let user = await User.findOne({ phone });
  if (user) {
    console.log('Test user already exists:', phone);
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  user = new User({ phone, passwordHash: hash, isVerified: true, phoneVerified: true, contactMethod: 'phone' });
  await user.save();
  console.log('Created test user', phone, 'with password', password);
  await mongoose.disconnect();
}

createUser().catch((err) => {
  console.error('Failed to create test user', err);
  process.exit(1);
});
