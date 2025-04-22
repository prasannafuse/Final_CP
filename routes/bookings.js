const express = require('express');
const router = express.Router();
const {
  showBookingForm,
  createBooking,
  getMyBookings,
  cancelBooking,
  completeBooking
} = require('../controllers/bookings');
const { protect } = require('../middleware/auth');

// @route   GET /booking/create/:serviceId
// @desc    Show booking form
// @access  Private
router.get('/create/:serviceId', protect, showBookingForm);

// @route   POST /booking/create/:serviceId
// @desc    Create booking
// @access  Private
router.post('/create/:serviceId', protect, createBooking);

// @route   GET /booking/my-bookings
// @desc    Show user bookings
// @access  Private
router.get('/my-bookings', protect, getMyBookings);

// @route   POST /booking/cancel/:id
// @desc    Cancel booking
// @access  Private
router.post('/cancel/:id', protect, cancelBooking);

// @route   POST /booking/complete/:id
// @desc    Complete booking and provide feedback
// @access  Private
router.post('/complete/:id', protect, completeBooking);

module.exports = router; 