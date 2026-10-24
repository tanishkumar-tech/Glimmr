/*
  Migration helper: safely remove legacy indexes that conflict with current schema.
  Usage:
    node scripts/remove_legacy_indexes.js
  Requires environment variable `MONGO_URI` to point to your database.
  This script will only remove the legacy index named `mobile_1` on the `users` collection.
*/

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function run() {
  if (!MONGO_URI) {
    console.error('MONGO_URI not set. Set it in your environment or .env file. Aborting.');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const db = mongoose.connection.db;

  try {
    const coll = db.collection('users');
    const indexes = await coll.indexes();
    const hasMobileIndex = indexes.some(idx => idx.name === 'mobile_1');
    if (!hasMobileIndex) {
      console.log('No legacy index `mobile_1` found. Nothing to do.');
      process.exit(0);
    }

    console.log('Found legacy index `mobile_1`.');

    // Confirmation prompt
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question('Drop index `mobile_1` on `users` collection? This is irreversible. (yes/no): ', (ans) => {
        rl.close();
        resolve(ans.trim().toLowerCase());
      });
    });

    if (answer !== 'yes') {
      console.log('Aborted by user. No changes made.');
      process.exit(0);
    }

    console.log('Dropping legacy index `mobile_1`...');
    await coll.dropIndex('mobile_1');
    console.log('Dropped legacy index `mobile_1`.');
  } catch (err) {
    console.error('Failed to remove legacy index:', err && err.message ? err.message : err);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

run().catch(err => {
  console.error('Migration script error:', err && err.message ? err.message : err);
  process.exit(2);
});
