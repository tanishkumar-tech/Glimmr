const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// GET /api/user/profile - get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// PUT /api/user/profile - update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Check if email is being changed and if it's unique
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ error: 'Email already in use' });
      user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();
    res.json({ message: 'Profile updated successfully', user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// PUT /api/user/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// POST /api/user/addresses - add address
router.post('/addresses', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, line1, city, state, pincode, country, isDefault, isDefaultShipping, isDefaultBilling } = req.body;
    if (!name || !line1 || !city || !state || !pincode || !country) {
      return res.status(400).json({ error: 'Name, line1, city, state, pincode, and country are required' });
    }

    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }

    user.addresses.push({ name, line1, city, state, pincode, country, line2: req.body.line2 || '', isDefault: !!isDefault });
    await user.save();
    const newAddr = user.addresses[user.addresses.length - 1];

    if (isDefaultShipping) user.defaultShippingAddressId = newAddr._id;
    if (isDefaultBilling) user.defaultBillingAddressId = newAddr._id;
    await user.save();
    res.json({ message: 'Address added successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/user/addresses/:id - update address
router.put('/addresses/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);
    if (addressIndex === -1) return res.status(404).json({ error: 'Address not found' });
    const { name, line1, city, state, pincode, country, line2, isDefault, isDefaultShipping, isDefaultBilling } = req.body;
    if (!name || !line1 || !city || !state || !pincode || !country) {
      return res.status(400).json({ error: 'Name, line1, city, state, pincode, and country are required' });
    }
    if (isDefault) {
      user.addresses.forEach(addr => (addr.isDefault = false));
    }
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      name,
      line1,
      city,
      state,
      pincode,
      country,
      line2: line2 || '',
      isDefault: !!isDefault,
    };
    const addrId = user.addresses[addressIndex]._id;
    if (isDefaultShipping) user.defaultShippingAddressId = addrId;
    if (isDefaultBilling) user.defaultBillingAddressId = addrId;
    await user.save();
    res.json({ message: 'Address updated successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/user/addresses/:id - delete address
router.delete('/addresses/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const removeId = req.params.id;
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== removeId);
    if (user.defaultShippingAddressId && user.defaultShippingAddressId.toString() === removeId) {
      user.defaultShippingAddressId = undefined;
    }
    if (user.defaultBillingAddressId && user.defaultBillingAddressId.toString() === removeId) {
      user.defaultBillingAddressId = undefined;
    }
    await user.save();
    res.json({ message: 'Address deleted successfully', addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

// Orders routes
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Coupons & Rewards
router.get('/coupons', authMiddleware, async (req, res) => {
  try {
    // Placeholder: static available coupons
    res.json({
      coupons: [
        { code: 'WELCOME10', description: '10% off on first order', expiresAt: null },
        { code: 'FESTIVE20', description: '20% off on selected items', expiresAt: new Date(Date.now() + 30*24*3600*1000) }
      ]
    });
  } catch (error) {
    console.error('Coupons fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/rewards', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('email');
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Placeholder: loyalty points and cashback history
    res.json({
      points: 850,
      history: [
        { date: new Date(Date.now() - 7*24*3600*1000), type: 'purchase', points: 50 },
        { date: new Date(Date.now() - 14*24*3600*1000), type: 'referral', points: 100 }
      ]
    });
  } catch (error) {
    console.error('Rewards fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product', 'name price images');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ order });
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

router.get('/orders/:id/invoice', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    // Placeholder: return a simple invoice JSON; replace with PDF generation later
    res.json({
      invoice: {
        id: order._id,
        date: order.createdAt,
        totalAmount: order.totalAmount,
        status: order.status,
        items: order.items.map(i => ({ product: i.product, quantity: i.quantity, price: i.price }))
      }
    });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});
