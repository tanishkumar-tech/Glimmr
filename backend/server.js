const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const recommendRoutes = require('./routes/recommend');
const priceRoutes = require('./routes/prices');

dotenv.config();

const app = express();
console.log('Starting Glimmr backend...');
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});
// Serve uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));


async function connectDB() {
  try {
    
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glimmr';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
      
      if (process.env.AUTO_DROP_LEGACY_INDEX === 'true') {
        try {
          const coll = mongoose.connection.db.collection('users');
          const indexes = await coll.indexes();
          const hasMobileIndex = indexes.some((idx) => idx.name === 'mobile_1');
          if (hasMobileIndex) {
            console.warn('Dropping legacy index `mobile_1` to avoid duplicate null constraint on phone');
            try {
              await coll.dropIndex('mobile_1');
              console.log('Dropped legacy index mobile_1');
            } catch (err) {
              console.warn('Failed to drop mobile_1 index:', err && err.message ? err.message : err);
            }
          }
        } catch (err) {
          console.warn('Index cleanup skipped or failed:', err && err.message ? err.message : err);
        }
      }
      // Optionally fix email/phone indexes that are non-sparse unique and cause duplicate-null errors
      if (process.env.AUTO_FIX_EMAIL_INDEX === 'true') {
        try {
          const coll = mongoose.connection.db.collection('users');
          const indexes = await coll.indexes();
          // Find any index that targets the `email` field and is unique without a partial filter
          const emailIndexes = indexes.filter((idx) => {
            try {
              const key = idx.key || {};
              return Object.prototype.hasOwnProperty.call(key, 'email');
            } catch (e) {
              return false;
            }
          });

          for (const idx of emailIndexes) {
            const isUnique = !!idx.unique;
            const hasPartial = !!idx.partialFilterExpression || !!idx.sparse;
            if (isUnique && !hasPartial) {
              try {
                console.warn(`Dropping problematic email index: ${idx.name}`);
                await coll.dropIndex(idx.name);
              } catch (err) {
                console.warn(`Failed to drop index ${idx.name}:`, err && err.message ? err.message : err);
              }
            }
          }

          // Create a safe partial unique index for email to allow multiple nulls
          try {
            await coll.createIndex({ email: 1 }, { name: 'email_partial_unique', unique: true, partialFilterExpression: { email: { $type: 'string' } } });
            console.log('Ensured partial unique index `email_partial_unique` exists on email');
          } catch (err) {
            console.warn('Failed to ensure partial unique email index:', err && err.message ? err.message : err);
          }
          // Also ensure username unique index handles nulls
          try {
            const usernameIndexes = indexes.filter((idx) => {
              try { return Object.prototype.hasOwnProperty.call(idx.key || {}, 'username'); } catch (e) { return false; }
            });

            for (const idx of usernameIndexes) {
              if (idx.unique && !idx.partialFilterExpression && !idx.sparse) {
                try {
                  console.warn(`Dropping problematic username index: ${idx.name}`);
                  await coll.dropIndex(idx.name);
                } catch (err) {
                  console.warn(`Failed to drop index ${idx.name}:`, err && err.message ? err.message : err);
                }
              }
            }

            await coll.createIndex({ username: 1 }, { name: 'username_partial_unique', unique: true, partialFilterExpression: { username: { $type: 'string' } } });
            console.log('Ensured partial unique index `username_partial_unique` exists on username');
          } catch (err) {
            console.warn('Failed to ensure partial unique username index:', err && err.message ? err.message : err);
          }
        } catch (err) {
          console.warn('Email index fix skipped or failed:', err && err.message ? err.message : err);
        }
      }
    // connected successfully
    return;
  } catch (err) {
    // If connection failed, attempt a resilient in-memory server so app still runs
    console.error('MongoDB connection failed. Falling back to in-memory server. Error:', err && err.message ? err.message : err);
    try {
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log('MongoDB Memory Server connected');
      return;
    } catch (memErr) {
      console.error('Failed to start in-memory MongoDB also:', memErr && memErr.message ? memErr.message : memErr);
      throw memErr;
    }
  }
}

connectDB().then(() => {
  (async () => {
    try {
      // Automatic seeding is disabled by default to avoid unexpected process exits
      // when running under development servers. Enable by setting
      // ENABLE_AUTO_SEED=true in the environment if you want seeding to run.
      if (process.env.ENABLE_AUTO_SEED === 'true') {
        try {
          const { ensureSeed } = require('./seed/seedProductsSafe');
          // Ensure at least 50 products per category
          await ensureSeed(50);
        } catch (seedErr) {
          console.warn('Seeding step failed or not available:', seedErr && seedErr.message ? seedErr.message : seedErr);
        }
      } else {
        console.log('Automatic seeding is disabled. Set ENABLE_AUTO_SEED=true to enable.');
      }

      // Create or update admin user
      try {
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        const adminKey = 'GLIMMR-ADMIN-DEFAULT';
        const hashedAdminKey = await bcrypt.hash(adminKey, 10);
        const existingAdmin = await User.findOneAndUpdate(
          { email: 'admin@glimmr.com' },
          {
            name: 'Admin User',
            email: 'admin@glimmr.com',
            password: hashedPassword,
            phone: '9999999999',
            role: 'admin',
            adminKey: hashedAdminKey,
            addresses: []
          },
          { upsert: true, new: true }
        );
        console.log('Admin user ensured successfully');
        console.log('Admin Email: admin@glimmr.com');
        console.log('Admin Password: admin123');
        console.log('Admin Key: GLIMMR-ADMIN-DEFAULT');
      } catch (adminErr) {
        console.warn('Admin user creation/update failed:', adminErr && adminErr.message ? adminErr.message : adminErr);
      }
    } catch (err) {
      console.warn('Post-connect tasks failed:', err && err.message ? err.message : err);
    }
  })();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/prices', priceRoutes);

// Health endpoint
app.get('/api/health', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// Generic error handler (returns JSON) — helps avoid HTML error pages breaking API clients
app.use((err, req, res, next) => {
  console.error('Unhandled Express error:', err && err.stack ? err.stack : err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Start the server via a native http server so we can handle EADDRINUSE gracefully
const http = require('http');

async function startServer(preferredPort) {
  let port = Number(preferredPort) || 5001;
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const server = http.createServer(app);

        server.on('error', (err) => {
          reject(err);
        });

        server.on('listening', () => {
          app.locals.server = server;
          console.log(`Server running on port ${port}`);
          resolve();
        });

        server.listen(port);
      });
      // started successfully
      return;
    } catch (err) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use, attempting port ${port + 1}...`);
        port = port + 1;
        continue;
      }
      console.error('Failed to start server:', err && err.message ? err.message : err);
      process.exit(1);
    }
  }

  console.error(`Unable to bind to a free port after ${maxAttempts} attempts. Exiting.`);
  process.exit(1);
}

// Global handlers to avoid uncaught exceptions taking down nodemon without logs
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason && reason.stack ? reason.stack : reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

startServer(PORT);
