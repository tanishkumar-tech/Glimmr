const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isBlacklisted } = require('./tokenBlacklist');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];

    // Check blacklist first
    if (isBlacklisted(token)) {
      return res.status(401).json({ error: 'Token revoked' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (verifyErr) {
      console.error('Token verify failed:', verifyErr && verifyErr.message ? verifyErr.message : verifyErr);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Accept common id fields in the token payload
    const userId = payload.id || payload._id || payload.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err && err.message ? err.message : err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = auth;
