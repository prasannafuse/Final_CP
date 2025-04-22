const express = require('express');
const router = express.Router();
const { showHomePage } = require('../controllers/homeController');

// @route   GET /
// @desc    Show home page
// @access  Public
router.get('/', showHomePage);

module.exports = router; 