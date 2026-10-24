const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // e.g., rings, necklaces, etc.
  material: { type: String, required: true }, // gold, silver, diamond, etc.
  price: { type: Number, required: false, default: 0 },
  weight: { type: Number, required: true }, // in grams
  karat: { type: Number, required: false, default: 24 }, // gold purity: 24, 22, 18
  images: [{ type: String, required: true }], // array of image URLs
  variants: [{ type: String }], // e.g., sizes, colors
  rating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  stock: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
