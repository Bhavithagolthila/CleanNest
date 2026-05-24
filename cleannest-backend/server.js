const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ─────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────
app.use(helmet());

// Rate limiting — max 100 requests per 15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
}));

// CORS — allow frontend and admin panel
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:3000',
      'http://localhost:4173',
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, true); // allow all origins in dev
  },
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────
// Routes
// ─────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/services', require('./routes/services'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CleanNest API is running! 🏠',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong.',
  });
});

// ─────────────────────────────────────
// Connect to MongoDB + Start Server
// ─────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Default services to seed on first startup
const DEFAULT_SERVICES = [
  { name: 'Full Home Cleaning',       price: 999,  icon: '🏠', desc: 'Complete top-to-bottom cleaning of your entire home.',                      duration: '3-4 hrs', popular: true,  order: 1 },
  { name: 'Bathroom Deep Cleaning',   price: 799,  icon: '🚿', desc: 'Thorough scrubbing, sanitization, and disinfection.',                       duration: '1-2 hrs', popular: false, order: 2 },
  { name: 'Kitchen Cleaning',         price: 899,  icon: '🍳', desc: 'Degreasing, scrubbing and deep cleaning of kitchen.',                       duration: '2-3 hrs', popular: false, order: 3 },
  { name: 'Sofa Cleaning',            price: 699,  icon: '🛋️', desc: 'Steam cleaning and stain removal for all sofa types.',                      duration: '1-2 hrs', popular: false, order: 4 },
  { name: 'Window Cleaning',          price: 399,  icon: '🪟', desc: 'Streak-free window cleaning inside and outside.',                           duration: '1 hr',    popular: false, order: 5 },
  { name: 'Full Home Deep Cleaning',  price: 1999, icon: '✨', desc: 'Intensive deep cleaning including hard-to-reach areas.',                    duration: '6-8 hrs', popular: true,  order: 6 },
  { name: 'Mattress Cleaning',        price: 599,  icon: '🛏️', desc: 'UV treatment and sanitization for hygienic sleep.',                         duration: '1-2 hrs', popular: false, order: 7 },
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected:', process.env.MONGO_URI);

    const User = require('./models/User');
    const Service = require('./models/Service');

    // Auto-create admin account on first startup
    const adminExists = await User.findOne({ email: 'admin@cleannest.in', role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@cleannest.in',
        password: 'admin@123',  // plain text — hashed by pre('save') hook
        role: 'admin',
      });
      console.log('✅ Admin account created → admin@cleannest.in / Admin@123');
    }

    // Seed default services if none exist
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(DEFAULT_SERVICES);
      console.log('✅ Default services seeded (7 services)');
    }

    app.listen(PORT, () => {
      console.log('');
      console.log('🚀 CleanNest Backend running!');
      console.log(`   Local:  http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('Admin credentials: admin@cleannest.in / Admin@123');
      console.log('');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Make sure MongoDB is running: mongod');
    process.exit(1);
  });
