const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Show register form
// @route   GET /auth/register
// @access  Public
exports.showRegisterForm = (req, res) => {
  res.render('pages/auth/register', {
    title: 'Register'
  });
};

// @desc    Register user
// @route   POST /auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, password2 } = req.body;

    // Validation
    const errors = [];
    if (!name || !email || !phone || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }

    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
      errors.push({ msg: 'Password should be at least 6 characters' });
    }

    // Check if validation errors
    if (errors.length > 0) {
      return res.render('pages/auth/register', {
        title: 'Register',
        errors,
        name,
        email,
        phone
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('pages/auth/register', {
        title: 'Register',
        errors,
        name,
        email,
        phone
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      phone,
      password
    });

    // Create token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/auth/register');
  }
};

// @desc    Show login form
// @route   GET /auth/login
// @access  Public
exports.showLoginForm = (req, res) => {
  res.render('pages/auth/login', {
    title: 'Login'
  });
};

// @desc    Login user
// @route   POST /auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    const errors = [];
    if (!email || !password) {
      errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
      return res.render('pages/auth/login', {
        title: 'Login',
        errors,
        email
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      errors.push({ msg: 'Invalid credentials' });
      return res.render('pages/auth/login', {
        title: 'Login',
        errors,
        email
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      errors.push({ msg: 'Invalid credentials' });
      return res.render('pages/auth/login', {
        title: 'Login',
        errors,
        email
      });
    }

    // Create token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Successful login - redirect based on role
    let redirectUrl = '/';
    if (user.role === 'admin') {
      redirectUrl = '/admin/dashboard';
      req.flash('success_msg', 'Welcome back, Admin!');
    } else if (user.role === 'provider') {
      redirectUrl = '/provider/dashboard';
      req.flash('success_msg', 'Welcome back, Provider!');
    }
    
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/auth/login');
  }
};

// @desc    Logout user
// @route   GET /auth/logout
// @access  Private
exports.logoutUser = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  req.flash('success_msg', 'You have been logged out');
  res.redirect('/auth/login');
}; 