#!/usr/bin/env node
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const Product = require('../models/Product');

async function getSilverPerGramINR() {
  try {
    const token = process.env.GOLDAPI_TOKEN || 'goldapi-pdixz26mhm8766q-io';
    const url = 'https://www.goldapi.io/api/XAG/INR/20251130';
    const resp = await axios.get(url, { headers: { 'x-access-token': token, 'Accept': 'application/json' }, timeout: 10000 });
    const data = resp.data || {};
    const ounce = (data.error ? null : (data.price || data.close_price || data.open_price)) || null;
    if (ounce) {
      const OZ_TO_GRAM = 31.1034768;
      return Number(ounce) / OZ_TO_GRAM;
    }
    return 75;
  } catch (e) {
    return 75;
  }
}

async function run() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glimmr';
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  const perGram = await getSilverPerGramINR();
  console.log(`Using silver per-gram INR: ${perGram}`);

  const filter = { material: { $regex: /^silver$/i } };
  const products = await Product.find(filter);
  console.log(`Found ${products.length} silver products`);

  let updated = 0;
  for (const p of products) {
    const weight = Number(p.weight) || 0;
    let price = p.price;
    if (weight > 0) {
      price = Math.round(perGram * weight);
    } else {
      price = p.price || 0; // leave as-is if no weight
    }
    const needsUpdate = (price !== p.price);
    if (needsUpdate) {
      p.price = price;
      try {
        await p.save();
        updated += 1;
        console.log(`Updated ${p._id}: price=${price}`);
      } catch (err) {
        console.warn(`Failed to update ${p._id}:`, err && err.message ? err.message : err);
      }
    }
  }

  console.log(`Migration complete. Updated ${updated} silver products.`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error('Migration failed:', e && e.message ? e.message : e);
  process.exit(1);
});
