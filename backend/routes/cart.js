const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Cart = require('../models/Cart');

const router = express.Router();

// Helper: fetch live per-gram rates for gold and silver (INR by default)
async function fetchPerGramRates(currency = 'INR') {
  const goldApiToken = process.env.GOLDAPI_TOKEN || 'goldapi-pdixz26mhm8766q-io';
  const OZ_TO_GRAM = 31.1034768;

  const tryEndpoint = async (metal) => {
    const base = `https://www.goldapi.io/api/${metal}/${currency.toUpperCase()}`;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;
    const urls = [base, `${base}/${dateStr}`];
    let lastErr;
    for (const u of urls) {
      try {
        const resp = await axios.get(u, {
          headers: { 'x-access-token': goldApiToken, 'Accept': 'application/json' },
          timeout: 10000,
        });
        const data = resp.data || {};
        const ounce = (data && !data.error) ? (data.price || data.close_price || data.open_price) : null;
        if (ounce) return Number(ounce) / OZ_TO_GRAM; // per gram
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr || new Error(`Failed fetching ${metal}`);
  };

  let goldPerGram = 0, silverPerGram = 0;
  try { goldPerGram = await tryEndpoint('XAU'); } catch {}
  try { silverPerGram = await tryEndpoint('XAG'); } catch {}

  if (!goldPerGram) goldPerGram = currency.toUpperCase() === 'GBP' ? 60 : 6500; // fallback approx per gram
  if (!silverPerGram) silverPerGram = currency.toUpperCase() === 'GBP' ? 0.7 : 75;

  return { goldPerGram, silverPerGram };
}

// Helper: compute live unit price for a product (weight in grams, karat for gold)
function computeLivePrice(product, perGram) {
  const weight = Number(product.weight || 0);
  if (!weight || weight <= 0) return 0;
  const material = String(product.material || '').toLowerCase();
  if (material === 'gold') {
    const karat = Number(product.karat || 24);
    const purity = karat === 24 ? 1.0 : karat === 22 ? 22/24 : karat === 18 ? 18/24 : karat/24;
    return Math.round(perGram.goldPerGram * weight * purity);
  }
  if (material === 'silver') {
    return Math.round(perGram.silverPerGram * weight);
  }
  // Other materials fall back to existing price
  return Math.round(Number(product.price || 0));
}

// POST /api/cart - add to cart
router.post('/', async (req, res) => {
  const { userId, productId, quantity = 1, guestId } = req.body;
  try {
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    const query = userId ? { user: userId } : { guestId: guestId || req.ip };
    let cart = await Cart.findOne(query);
    if (!cart) {
      cart = new Cart({ user: userId || undefined, guestId: userId ? undefined : (guestId || req.ip), items: [] });
    }
    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product');
    try {
      const perGram = await fetchPerGramRates('INR');
      populated.items.forEach(it => {
        if (it.product) {
          const p = it.product;
          const live = computeLivePrice(p, perGram);
          // override price for response without persisting
          if (typeof p.set === 'function') {
            p.set('price', live, { strict: false });
          } else {
            p.price = live;
          }
        }
      });
    } catch {}
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/cart/:userId
router.get('/:userId', async (req, res) => {
  try {
    const id = req.params.userId;
    let query;
    if (!id || id === 'undefined' || id === 'null') {
      const guestId = req.query.guestId || req.ip;
      query = { guestId };
    } else {
      const or = [];
      if (mongoose.Types.ObjectId.isValid(id)) {
        or.push({ user: id });
      }
      or.push({ guestId: id });
      query = { $or: or };
    }
    const cart = await Cart.findOne(query).populate('items.product');
    if (!cart) return res.json({ items: [] });
    try {
      const perGram = await fetchPerGramRates('INR');
      cart.items.forEach(it => {
        if (it.product) {
          const p = it.product;
          const live = computeLivePrice(p, perGram);
          if (typeof p.set === 'function') {
            p.set('price', live, { strict: false });
          } else {
            p.price = live;
          }
        }
      });
    } catch {}
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/:userId - update quantity
router.put('/:userId', async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const cart = await Cart.findOne({ $or: [{ user: req.params.userId }, { guestId: req.params.userId }] });
    const item = cart.items.find(item => item.product.toString() === productId);
    if (item) {
      item.quantity = quantity;
      await cart.save();
    }
    const populated = await Cart.findById(cart._id).populate('items.product');
    try {
      const perGram = await fetchPerGramRates('INR');
      populated.items.forEach(it => {
        if (it.product) {
          const p = it.product;
          const live = computeLivePrice(p, perGram);
          if (typeof p.set === 'function') {
            p.set('price', live, { strict: false });
          } else {
            p.price = live;
          }
        }
      });
    } catch {}
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/cart/:userId/:productId - remove from cart
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ $or: [{ user: req.params.userId }, { guestId: req.params.userId }] });
    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product');
    try {
      const perGram = await fetchPerGramRates('INR');
      populated.items.forEach(it => {
        if (it.product) {
          const p = it.product;
          const live = computeLivePrice(p, perGram);
          if (typeof p.set === 'function') {
            p.set('price', live, { strict: false });
          } else {
            p.price = live;
          }
        }
      });
    } catch {}
    res.json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
