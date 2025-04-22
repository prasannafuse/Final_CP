const express = require('express');
const router = express.Router();
const { 
  showRegisterForm, 
  registerUser, 
  showLoginForm, 
  loginUser, 
  logoutUser 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// @route   GET /auth/register
// @desc    Show register form
// @access  Public
router.get('/register', showRegisterForm);

// @route   POST /auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerUser);

// @route   GET /auth/login
// @desc    Show login form
// @access  Public
router.get('/login', showLoginForm);

// @route   POST /auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginUser);

// @route   GET /auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', protect, logoutUser);

module.exports = router; 