const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const router = express.Router();

// POST /api/orders - create order from cart
router.post('/', async (req, res) => {
  const { userId } = req.body;
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const totalAmount = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.items.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: { name: item.product.name },
          unit_amount: item.product.price * 100,
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    const order = new Order({
      user: userId,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount,
      paymentIntentId: session.id,
    });
    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    res.json({ sessionId: session.id, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:userId - order history
router.get('/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId }).populate('items.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
