const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check if token exists in cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    req.flash('error_msg', 'Please log in to access this resource');
    return res.redirect('/auth/login');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    req.flash('error_msg', 'Not authorized to access this resource');
    return res.redirect('/auth/login');
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      req.flash('error_msg', 'Not authorized to access this resource');
      return res.redirect('/');
    }
    next();
  };
}; 