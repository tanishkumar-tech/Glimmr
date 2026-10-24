#!/usr/bin/env node
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const Product = require('../models/Product');

async function getPerGramINR() {
  try {
    const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5001;
    const base = `http://localhost:${backendPort}/api/prices`;
    await axios.get(`${base}?currency=inr`, { timeout: 10000 }).catch(() => {});
    const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 }).catch(() => ({ data: null }));
    if (latest && latest.data && latest.data.gold && latest.data.gold.price) {
      return Number(latest.data.gold.price) || 0;
    }
    return 6500; // fallback INR per gram
  } catch (e) {
    return 6500; // fallback if backend not running
  }
}

async function run() {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glimmr';
  await mongoose.connect(mongoURI);
  console.log('Connected to MongoDB');

  const perGram = await getPerGramINR();
  console.log(`Using per-gram INR: ${perGram}`);

  const filter = { material: { $regex: /^gold$/i } };
  const products = await Product.find(filter);
  console.log(`Found ${products.length} gold products`);

  let updated = 0;
  for (const p of products) {
    const karat = p.karat && [18, 22, 24].includes(p.karat) ? p.karat : 24;
    const weight = Number(p.weight) || 0;
    const purity = karat === 24 ? 1.0 : karat === 22 ? 22/24 : 18/24;
    let price = p.price;
    if (weight > 0) {
      price = Math.round(perGram * weight * purity);
    } else {
      price = p.price || 0; // leave as-is if no weight
    }
    const needsUpdate = (p.karat !== karat) || (price !== p.price);
    if (needsUpdate) {
      p.karat = karat;
      p.price = price;
      try {
        await p.save();
        updated += 1;
        console.log(`Updated ${p._id}: karat=${karat}, price=${price}`);
      } catch (err) {
        console.warn(`Failed to update ${p._id}:`, err && err.message ? err.message : err);
      }
    }
  }

  console.log(`Migration complete. Updated ${updated} products.`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error('Migration failed:', e && e.message ? e.message : e);
  process.exit(1);
});
