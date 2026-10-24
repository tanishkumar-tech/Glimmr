require('dotenv').config();
const mongoose = require('mongoose');

async function listIndexes() {
  const uri = process.env.MONGO_URI || 'mongodb+srv://Ayush:12345@cluster0.qhs1btd.mongodb.net/';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const coll = mongoose.connection.db.collection('users');
  const indexes = await coll.indexes();
  console.log('User collection indexes:');
  console.log(JSON.stringify(indexes, null, 2));
  await mongoose.disconnect();
}

listIndexes().catch((err) => {
  console.error('failed to list indexes', err);
  process.exit(1);
});
