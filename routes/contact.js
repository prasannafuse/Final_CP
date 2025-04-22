const express = require('express');
const router = express.Router();
const {
  showContactForm,
  submitContactForm
} = require('../controllers/contactController');

// @route   GET /contact
// @desc    Show contact form
// @access  Public
router.get('/', showContactForm);

// @route   POST /contact
// @desc    Submit contact form
// @access  Public
router.post('/', submitContactForm);

module.exports = router; 