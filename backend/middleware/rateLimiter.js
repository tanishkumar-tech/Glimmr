const rateLimit = require('express-rate-limit');

// General limiter for auth endpoints to prevent abuse
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again later.' },
});

// Stricter limiter for OTP verification attempts
const verifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // limit each IP to 20 verification attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification attempts. Please try again later.' },
});

module.exports = {
  authLimiter,
  verifyLimiter,
};
