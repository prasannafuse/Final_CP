const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parser
app.use(cookieParser());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Flash messages
app.use(flash());

// Set user from JWT for all routes
app.use(async (req, res, next) => {
  if (req.cookies.token) {
    try {
      // Verify token
      const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
      // Get user from token
      req.user = await User.findById(decoded.id);
    } catch (err) {
      // Invalid token - don't set user
      console.error('Token verification failed:', err.message);
    }
  }
  next();
});

// Global variables
app.use((req, res, next) => {
  // Get success_msg from flash and then clear it
  res.locals.success_msg = req.flash('success_msg');
  
  // Get error_msg from flash and then clear it
  res.locals.error_msg = req.flash('error_msg');
  
  // Get error from flash and then clear it
  res.locals.error = req.flash('error');
  
  // Set user from request
  res.locals.user = req.user || null;
  
  // Console logs for debugging (remove in production)
  if (res.locals.success_msg.length > 0) {
    console.log('Success message:', res.locals.success_msg);
  }
  if (res.locals.error_msg.length > 0) {
    console.log('Error message:', res.locals.error_msg);
  }
  if (res.locals.error.length > 0) {
    console.log('Error:', res.locals.error);
  }
  
  next();
});

// Import Routes
const authRoutes = require('./routes/auth-routes');
const homeRoutes = require('./routes/home');
const servicesRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const providerRoutes = require('./routes/provider');

// Mount Routes
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/services', servicesRoutes);
app.use('/bookings', bookingRoutes);
app.use('/contact', contactRoutes);
app.use('/admin', adminRoutes);
app.use('/provider', providerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('pages/404', { 
    title: 'Page Not Found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('pages/500', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 