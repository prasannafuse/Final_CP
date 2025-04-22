const express = require('express');
const router = express.Router();
const { 
  dashboard, 
  getAllBookings, 
  showAssignBooking, 
  assignBooking,
  getAllProviders,
  showAddProvider,
  addProvider,
  getAllCustomers,
  getProviderById,
  showEditProvider,
  updateProvider,
  deleteProvider
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes in this file are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// @route   GET /admin
// @desc    Admin Dashboard
// @access  Private/Admin
router.get('/', dashboard);

// Bookings routes
router.get('/bookings', getAllBookings);
router.get('/bookings/assign/:id', showAssignBooking);
router.post('/bookings/assign/:id', assignBooking);

// Providers routes
router.get('/providers', getAllProviders);
router.get('/providers/add', showAddProvider);
router.post('/providers/add', addProvider);
router.get('/providers/view/:id', getProviderById);
router.get('/providers/edit/:id', showEditProvider);
router.post('/providers/edit/:id', updateProvider);
router.post('/providers/delete/:id', deleteProvider);

// Customers routes
router.get('/customers', getAllCustomers);

module.exports = router; 