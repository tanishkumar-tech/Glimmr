const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// Twilio removed: prefer Firebase client-side phone auth
const crypto = require('crypto');
const admin = require('firebase-admin');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');


const router = express.Router();
const { authLimiter, verifyLimiter } = require('../middleware/rateLimiter');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5', 10);
const OTP_RESEND_INTERVAL_MS =
  parseInt(process.env.OTP_RESEND_INTERVAL_SECONDS || '60', 10) * 1000;
const OTP_LOCK_DURATION_MS =
  parseInt(process.env.OTP_LOCK_DURATION_MINUTES || '10', 10) * 60 * 1000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Firebase Admin initialization is handled in `server.js` so the app can
// initialize it from a service account path or key and expose it via
// `app.locals.firebaseAdmin` and `app.locals.firebaseEnabled`.
// We still `require('firebase-admin')` here to access the module if it
// was initialized by the server process, but we do not initialize it here.

const mailTransport = createMailTransport();
// Server-side SMS provider removed in favor of Firebase client-side phone auth

// Lightweight audit log for SMS/Verify events (non-sensitive metadata)
const smsAuditLogFile = path.join(__dirname, '..', 'logs', 'sms_audit.log');
function auditSmsEvent(event) {
  try {
    fs.mkdirSync(path.dirname(smsAuditLogFile), { recursive: true });
    const out = Object.assign({ ts: new Date().toISOString() }, event);
    fs.appendFileSync(smsAuditLogFile, JSON.stringify(out) + '\n');
  } catch (err) {
    console.error('SMS audit log error:', err && err.message ? err.message : err);
  }
}

function createMailTransport() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  console.warn(
    'SMTP credentials not configured. Falling back to console email logger. Configure SMTP_* env vars for production.'
  );
  return nodemailer.createTransport({
    jsonTransport: true,
  });
}

// NOTE: Twilio has been removed. For phone verification, use Firebase client-side
// phone authentication. The backend will verify Firebase ID tokens via the
// `/auth/firebase-login` endpoint (requires `FIREBASE_SERVICE_ACCOUNT_KEY` or
// `FIREBASE_SERVICE_ACCOUNT_PATH` to be set). Server-side SMS sending is no
// longer supported in this project.

const CONTACT_TYPES = {
  EMAIL: 'email',
  PHONE: 'phone',
};

const normalizeEmail = (email) => (email || '').trim().toLowerCase();
const normalizePhone = (phone) => {
  // Enforce Indian phone numbers only (E.164 +91XXXXXXXXXX)
  if (!phone) return '';
  const raw = String(phone).trim();
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return '';

  // Remove leading zeros
  const cleaned = digits.replace(/^0+/, '');

  // If user provided national 10-digit number, assume India and prefix 91
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  // If user provided country code +91 or 91 prefixed number (e.g. 9198... -> 12 digits), accept it
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  // Already E.164 with leading '91' (rare case where + included and digits length 12)
  if (raw.startsWith('+') && cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  // Otherwise, not an Indian phone number we accept
  return '';
};

const resolveIdentity = (body = {}) => {
  const email = normalizeEmail(body.email);
  if (email) {
    return { field: 'email', value: email, channel: CONTACT_TYPES.EMAIL };
  }

  const phone = normalizePhone(body.phone);
  if (phone) {
    return { field: 'phone', value: phone, channel: CONTACT_TYPES.PHONE };
  }

  return null;
};

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const buildOtpExpiry = () =>
  new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

async function sendOtpEmail(email, otp, context) {
  const subject = `Your ${context} OTP`;
  const html = `
    <p>Hello,</p>
    <p>Your OTP for ${context} is <strong>${otp}</strong>.</p>
    <p>This OTP will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
    <p>If you did not request it, you can ignore this email.</p>
  `;

  const message = {
    from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@glimmr.local',
    to: email,
    subject,
    text: `Your OTP for ${context} is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    html,
  };

  await mailTransport.sendMail(message);
}

async function sendOtpSms(phone, otp, context) {
  // Server-side SMS sending has been removed. Phone verification must be
  // performed on the client via Firebase Phone Auth. The client should then
  // POST the resulting ID token to `/api/auth/firebase-login` so the server
  // can verify the token and create/verify the user.
  if (!phone) return;
  console.log('[SMS] server-side SMS disabled. Use Firebase client-side phone auth instead.');
  throw new Error('Server-side SMS sending is disabled. Use Firebase client-side phone auth or configure an SMS provider.');
}

async function issueOtp(user, context, channel = CONTACT_TYPES.EMAIL) {
  // Phone channel: prefer client-side Firebase phone auth. If Firebase Admin
  // is configured on the server, we just update metadata and expect the
  // client to perform phone verification and call `/auth/firebase-login`.
  if (channel === CONTACT_TYPES.PHONE) {
    if (admin && admin.apps && admin.apps.length > 0) {
      user.otp = undefined;
      user.otpExpiry = buildOtpExpiry();
      user.otpAttempts = 0;
      user.otpLockedUntil = undefined;
      user.lastOtpSentAt = new Date();
      await user.save();
      console.log('[AUTH] Using Firebase client-side phone auth; instruct client to perform phone verification');
      return;
    }

    // No Firebase admin configured server-side — fall back to email if available
    if (user.email) {
      channel = CONTACT_TYPES.EMAIL;
    } else {
      throw new Error('Phone verification requires Firebase client-side phone auth or a configured SMS provider on the server.');
    }
  }

  // For email (or fallback), generate OTP and send via email
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp, 10);

  user.otp = hashedOtp;
  user.otpExpiry = buildOtpExpiry();
  user.otpAttempts = 0;
  user.otpLockedUntil = undefined;
  user.lastOtpSentAt = new Date();
  await user.save();

  if (channel === CONTACT_TYPES.EMAIL) {
    await sendOtpEmail(user.email, otp, context);
  } else {
    // Shouldn't reach here; defensive check
    throw new Error('Unable to deliver OTP: unsupported channel.');
  }
}

router.post('/signup', authLimiter, async (req, res) => {
  try {
    console.log('[AUTH] signup attempt');
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Prevent privilege escalation: signup always creates a regular user.
    // Admin accounts must be provisioned separately and authenticated with admin key.
    if (normalizedEmail === 'admin@glimmr.com') {
      console.warn('Signup attempt using reserved admin email');
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists. Please log in.' });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: 'user', // Always user on signup
      addresses: []
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Signup error:', error && error.message ? error.message : error);
    return res.status(500).json({ error: 'Unable to process signup request' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const identity = resolveIdentity(req.body);
    if (!identity) {
      return res.status(400).json({ error: 'Phone number or email is required' });
    }
    // Both email and phone are accepted as identity fields. Phone verification
    // is expected to be performed client-side via Firebase when configured.
    const { password, adminKey } = req.body;
    const user = await User.findOne({ [identity.field]: identity.value });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign up first.' });
    }

    // If password provided, try password-login
    if (password) {
      if (!user.password) {
        return res.status(400).json({ error: 'Password login not available for this account' });
      }

      const match = await bcrypt.compare(String(password), user.password);
      if (!match) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // If adminKey provided, verify for admin login
      if (adminKey) {
        if (user.role !== 'admin') {
          return res.status(403).json({ error: 'Admin access required' });
        }
        if (!user.adminKey || !(await bcrypt.compare(adminKey, user.adminKey))) {
          return res.status(401).json({ error: 'Invalid admin key' });
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email, phone: user.phone },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        message: 'Logged in successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          addresses: user.addresses
        }
      });
    }

    // Otherwise proceed with OTP flow (passwordless)
    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const seconds = Math.ceil((user.otpLockedUntil.getTime() - Date.now()) / 1000);
      return res.status(429).json({ error: `Too many attempts. Please wait ${seconds} seconds before requesting another OTP.` });
    }

    if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt.getTime() < OTP_RESEND_INTERVAL_MS) {
      const waitTime = Math.ceil((OTP_RESEND_INTERVAL_MS - (Date.now() - user.lastOtpSentAt.getTime())) / 1000);
      res.setHeader('Retry-After', waitTime);
      return res.status(429).json({ error: `OTP already sent. Please wait ${waitTime} seconds before requesting again.` });
    }

    try {
      await issueOtp(user, 'login', identity.channel);
      return res.json({ message: 'An OTP has been sent to your phone. Enter it to continue.' });
    } catch (otpError) {
      console.error('[AUTH] Failed to send login OTP:', otpError.message);
      return res.status(500).json({ error: 'Unable to deliver OTP at the moment. Please confirm your number or try again later.' });
    }
  } catch (error) {
    console.error('Login OTP error:', error);
    return res.status(500).json({ error: 'Unable to process login request' });
  }
});

router.post('/verify', verifyLimiter, async (req, res) => {
  try {
    const identity = resolveIdentity(req.body);
    const { otp } = req.body;

    if (!identity || !otp) {
      return res
        .status(400)
        .json({ error: 'Phone number and OTP are both required' });
    }

    const user = await User.findOne({ [identity.field]: identity.value });
    if (!user) {
      return res
        .status(404)
        .json({ error: 'User not found. Please sign up first.' });
    }

    if (!user.otp || !user.otpExpiry) {
      // If using client-side Firebase phone auth we may not have stored OTP locally.
      // Phone verification must be completed via Firebase SDK on the client and
      // then the client should POST the resulting ID token to `/auth/firebase-login`.
      if (identity.channel === CONTACT_TYPES.PHONE) {
        return res.status(400).json({ error: 'Phone verification is handled client-side via Firebase. Complete phone auth with Firebase SDK and POST the ID token to /auth/firebase-login.' });
      }

      return res.status(400).json({ error: 'No OTP request found. Please request a new OTP.' });
    }

    if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
      const seconds = Math.ceil(
        (user.otpLockedUntil.getTime() - Date.now()) / 1000
      );
      return res.status(429).json({
        error: `Too many attempts. Please wait ${seconds} seconds before trying again.`,
      });
    }

    // Phone verification is expected to be done client-side with Firebase.
    if (identity.channel === CONTACT_TYPES.PHONE) {
      return res.status(400).json({ error: 'Phone verification is handled client-side via Firebase. Please POST the ID token to /auth/firebase-login.' });
    } else {
      const isExpired = user.otpExpiry.getTime() < Date.now();
      const isMatch = await bcrypt.compare(otp, user.otp);

      if (isExpired || !isMatch) {
        user.otpAttempts += 1;

        if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
          user.otpLockedUntil = new Date(Date.now() + OTP_LOCK_DURATION_MS);
          user.otpAttempts = 0;
        }

        await user.save();

        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }
    }

    // mark specific contact as verified
    if (identity.field === 'email') {
      user.emailVerified = true;
    }
    if (identity.field === 'phone') {
      user.phoneVerified = true;
    }

    // overall verified if either contact verified
    user.isVerified = Boolean(user.emailVerified || user.phoneVerified);

    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    user.otpLockedUntil = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ error: 'Unable to verify OTP' });
  }
});

router.post('/resend', authLimiter, async (req, res) => {
  try {
    const identity = resolveIdentity(req.body);
    if (!identity) {
      return res.status(400).json({ error: 'Phone number or email is required' });
    }

    const user = await User.findOne({ [identity.field]: identity.value });
    if (!user) {
      return res
        .status(404)
        .json({ error: 'User not found. Please sign up first.' });
    }

    if (
      user.lastOtpSentAt &&
      Date.now() - user.lastOtpSentAt.getTime() < OTP_RESEND_INTERVAL_MS
    ) {
      const waitTime = Math.ceil(
        (OTP_RESEND_INTERVAL_MS -
          (Date.now() - user.lastOtpSentAt.getTime())) /
          1000
      );
      res.setHeader('Retry-After', waitTime);
      return res.status(429).json({
        error: `OTP already sent. Please wait ${waitTime} seconds before requesting again.`,
      });
    }

    try {
      await issueOtp(user, 'verification', identity.channel);
      return res.json({
        message: 'We\'re sending a new OTP. Please check your messages.',
      });
    } catch (otpError) {
      console.error('[AUTH] Failed to resend OTP:', otpError.message);
      return res.status(500).json({ error: 'Unable to deliver OTP at the moment. Please confirm your number or try again later.' });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ error: 'Unable to resend OTP' });
  }
});

const { addToken, isBlacklisted } = require('../middleware/tokenBlacklist');

// Return current user from token
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = auth.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // check blacklist
    if (isBlacklisted(token)) return res.status(401).json({ error: 'Token revoked' });

    const user = await User.findById(payload.id).select('-otp -passwordHash -__v');
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user });
  } catch (err) {
    console.error('GET /auth/me error:', err);
    return res.status(500).json({ error: 'Unable to fetch user' });
  }
});

// Firebase login endpoint
router.post('/firebase-login', authLimiter, async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required' });
    }

    // Verify Firebase ID token using the server-provided admin instance when available.
    let decodedToken;
    try {
      const firebaseAdminInstance = (req.app && req.app.locals && req.app.locals.firebaseAdmin) || admin;
      if (!firebaseAdminInstance || !firebaseAdminInstance.auth) {
        console.error('Firebase Admin not configured on server');
        return res.status(500).json({ error: 'Server does not have Firebase Admin configured' });
      }
      decodedToken = await firebaseAdminInstance.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Firebase token verification error:', error && error.message ? error.message : error);
      return res.status(401).json({ error: 'Invalid Firebase ID token' });
    }

    // Extract phone number from Firebase token
    const phone = decodedToken.phone_number;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number not found in Firebase token' });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ error: 'Invalid phone number format' });
    }

    // Check if user exists
    let user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      // Create new user if not exists
      user = new User({
        phone: normalizedPhone,
        contactMethod: CONTACT_TYPES.PHONE,
        phoneVerified: true,
        isVerified: true,
        createdAt: new Date(),
      });
      await user.save();
      console.log('[AUTH] New user created via Firebase:', normalizedPhone);
    } else {
      // Update existing user to mark phone as verified
      user.phoneVerified = true;
      user.isVerified = Boolean(user.emailVerified || user.phoneVerified);
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Logged in successfully via Firebase',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Firebase login error:', error);
    return res.status(500).json({ error: 'Unable to process Firebase login' });
  }
});

// NOTE: config endpoint consolidated below. Server exposes Firebase Admin
// state via `app.locals.firebaseEnabled` and `app.locals.firebaseAdmin`.

// Admin login with key verification
router.post('/admin-login', authLimiter, async (req, res) => {
  try {
    const { email, password, adminKey } = req.body;
    if (!email || !password || !adminKey) {
      return res.status(400).json({ error: 'Email, password and admin key are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    const pwMatch = await bcrypt.compare(String(password), user.password);
    if (!pwMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.adminKey || !(await bcrypt.compare(adminKey, user.adminKey))) {
      return res.status(401).json({ error: 'Invalid admin key' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Logout endpoint - blacklist token
router.post('/logout', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(400).json({ error: 'Missing Authorization header' });
    }
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // compute expiry from payload / default to 1 hour
      const expMs = payload.exp ? payload.exp * 1000 : Date.now() + 60 * 60 * 1000;
      addToken(token, expMs);
      return res.json({ message: 'Logged out' });
    } catch (err) {
      // still blacklist the token string for safety
      addToken(token, Date.now() + 60 * 60 * 1000);
      return res.json({ message: 'Logged out' });
    }
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Unable to logout' });
  }
});

// GET logout for convenience (e.g., if user navigates to /api/auth/logout)
router.get('/logout', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(200).json({ message: 'Logged out' }); // no token, just return ok
    }
    const token = auth.split(' ')[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const expMs = payload.exp ? payload.exp * 1000 : Date.now() + 60 * 60 * 1000;
      addToken(token, expMs);
      return res.json({ message: 'Logged out' });
    } catch (err) {
      addToken(token, Date.now() + 60 * 60 * 1000);
      return res.json({ message: 'Logged out' });
    }
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Unable to logout' });
  }
});

// Simple config endpoint the frontend can poll to decide UI behavior
router.get('/config', async (req, res) => {
  try {
    const firebaseEnabled = Boolean(req.app && req.app.locals && req.app.locals.firebaseEnabled);
    // Email OTP available when SMTP is configured (mailTransport not jsonTransport)
    const emailOtpEnabled = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    return res.json({ firebaseEnabled, emailOtpEnabled });
  } catch (err) {
    console.error('GET /auth/config error:', err);
    return res.status(500).json({ error: 'Unable to fetch auth config' });
  }
});

module.exports = router;

