// Clean seeder (temporary replacement)
const categories = ['rings', 'necklaces', 'wedding', 'bracelets', 'earrings'];
const materials = ['gold', 'diamond', 'silver'];

function sampleImageForCategory(cat) {
  const map = {
    rings: 'photo-1605100804763-247f67b3557e',
    necklaces: 'photo-1515562141207-7a88fb7ce338',
    wedding: 'photo-1515562141207-7a88fb7ce338',
    bracelets: 'photo-1520975914443-3d9b36b4f9f3',
    earrings: 'photo-1535632066927-ab7c9ab60908',
  };
  const id = map[cat] || 'photo-1605100804763-247f67b3557e';
  return `https://images.unsplash.com/${id}?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80`;
}

function makeProduct(cat, material, idx) {
  const baseName = `${cat.charAt(0).toUpperCase() + cat.slice(1, -1)}`;
  const name = `${material.charAt(0).toUpperCase() + material.slice(1)} ${baseName} ${idx + 1}`;
  const priceBase = material === 'diamond' ? 2000 : material === 'gold' ? 1000 : 300;
  const price = priceBase + Math.floor(Math.random() * 2000);
  return {
    name,
    description: `${name} - Handcrafted ${material} ${cat.slice(0, -1)}.`,
    category: cat,
    material,
    price,
    weight: Math.round(Math.random() * 20) + 1,
    images: [sampleImageForCategory(cat)],
    variants: [],
    rating: +(Math.random() * 1.5 + 3.5).toFixed(1),
    stock: Math.floor(Math.random() * 50) + 1,
    isActive: true,
  };
}

async function ensureSeed(minPerCategory = 50) {
  const Product = require('../models/Product');
  for (const cat of categories) {
    const count = await Product.countDocuments({ category: cat });
    if (count >= minPerCategory) continue;
    const toCreate = minPerCategory - count;
    const docs = [];
    for (let i = 0; i < toCreate; i++) {
      const material = materials[Math.floor(Math.random() * materials.length)];
      docs.push(makeProduct(cat, material, i + count));
    }
    await Product.insertMany(docs);
    console.log(`Seeded ${toCreate} products for category ${cat}`);
  }
}

module.exports = { ensureSeed };

if (require.main === module) {
  (async () => {
    const mongoose = require('mongoose');
    require('dotenv').config();
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('MONGO_URI not set. Aborting.');
      process.exit(2);
    }
    try {
      await mongoose.connect(mongoURI);
      const batch = [];
      for (const cat of categories) {
        for (let i = 0; i < 50; i++) {
          const material = materials[Math.floor(Math.random() * materials.length)];
          batch.push(makeProduct(cat, material, i));
        }
      }
      const Product = require('../models/Product');
      await Product.insertMany(batch);
      console.log(`CLI seeded ${batch.length} products`);
      process.exit(0);
    } catch (err) {
      console.error('CLI seed failed', err && err.message ? err.message : err);
      process.exit(1);
    }
  })();
}
