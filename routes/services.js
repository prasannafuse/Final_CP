const express = require('express');
const router = express.Router();
const {
  getServices,
  getService
} = require('../controllers/servicesController');

// @route   GET /services
// @desc    Show all services
// @access  Public
router.get('/', getServices);

// @route   GET /services/:id
// @desc    Show single service
// @access  Public
router.get('/:id', getService);

module.exports = router; 