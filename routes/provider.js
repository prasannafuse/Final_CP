const express = require('express');
const router = express.Router();
const {
  showDashboard,
  acceptJob,
  rejectJob,
  completeJob,
  updateJobNotes,
  updateAvailability
} = require('../controllers/providerController');
const { protect, authorize } = require('../middleware/auth');

// All routes in this file are protected and require provider role
router.use(protect);
router.use(authorize('provider', 'admin'));

// @route   GET /provider/dashboard
// @desc    Show provider dashboard
// @access  Private/Provider
router.get('/dashboard', showDashboard);

// @route   POST /provider/jobs/accept/:id
// @desc    Accept job
// @access  Private/Provider
router.post('/jobs/accept/:id', acceptJob);

// @route   POST /provider/jobs/reject/:id
// @desc    Reject job
// @access  Private/Provider
router.post('/jobs/reject/:id', rejectJob);

// @route   POST /provider/jobs/complete/:id
// @desc    Complete job
// @access  Private/Provider
router.post('/jobs/complete/:id', completeJob);

// @route   POST /provider/jobs/update-notes/:id
// @desc    Update job notes
// @access  Private/Provider
router.post('/jobs/update-notes/:id', updateJobNotes);

// @route   POST /provider/update-availability
// @desc    Update provider availability
// @access  Private/Provider
router.post('/update-availability', updateAvailability);

module.exports = router; 