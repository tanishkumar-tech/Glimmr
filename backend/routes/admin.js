const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

// GET /api/admin/users - get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/users/:id - update user role (admin only)
router.put('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = role;
    await user.save();
    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/users/:id - delete user (admin only)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin user' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/admin/orders - get all orders (admin only)
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/orders/:id - update order status (admin only)
router.put('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    await order.save();
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
// POST /api/admin/recalc-silver - recalc silver product prices using current per-gram (admin only)
const Product = require('../models/Product');
const axios = require('axios');

router.post('/recalc-silver', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const backendPort = process.env.PORT || process.env.BACKEND_PORT || 5001;
    const base = `http://localhost:${backendPort}/api/prices`;
    // Ensure cache has latest
    try { await axios.get(`${base}?currency=inr`, { timeout: 8000 }); } catch {}
    let perGram = 0;
    try {
      const latest = await axios.get(`${base}/latest?currency=inr`, { timeout: 5000 });
      perGram = Number(latest.data?.silver?.price || 0);
    } catch {}
    if (!perGram || perGram <= 0) perGram = 75;

    const products = await Product.find({ material: { $regex: /^silver$/i } });
    let updated = 0;
    for (const p of products) {
      const weight = Number(p.weight) || 0;
      if (weight > 0) {
        const newPrice = Math.round(perGram * weight);
        if (newPrice !== p.price) {
          p.price = newPrice;
          await p.save();
          updated += 1;
        }
      }
    }
    return res.json({ ok: true, perGram, updated, total: products.length });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to recalc silver prices' });
  }
});
