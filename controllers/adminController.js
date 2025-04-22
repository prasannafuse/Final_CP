const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');

// Admin dashboard
exports.dashboard = async (req, res) => {
  try {
    // Retrieve bookings and ensure they all have populated fields
    const bookings = await Booking.find()
      .populate('user')
      .populate('service')
      .populate('provider')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Filter out any bookings with missing service data to prevent null reference errors
    const validBookings = bookings.filter(booking => booking.service && booking.user);
    
    // Count pending bookings
    const pendingBookingsCount = await Booking.countDocuments({ status: 'pending' });
    
    // Count service providers
    const providersCount = await User.countDocuments({ role: 'provider' });
    
    // Count total customers
    const customersCount = await User.countDocuments({ role: 'user' });
    
    // Count total completed bookings
    const completedBookingsCount = await Booking.countDocuments({ status: 'completed' });
    
    res.render('pages/admin/dashboard', {
      title: 'Admin Dashboard',
      bookings: validBookings,
      pendingBookingsCount,
      providersCount,
      customersCount,
      completedBookingsCount
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// Show all bookings
exports.getAllBookings = async (req, res) => {
  try {
    // Create filter object
    const filter = {};
    let filterDescription = '';
    
    // Check if filtering by user ID
    if (req.query.user) {
      filter.user = req.query.user;
      const customer = await User.findById(req.query.user);
      if (customer) {
        filterDescription = `for customer ${customer.name}`;
      }
    }
    
    // Apply any status filter
    if (req.query.status) {
      filter.status = req.query.status;
      filterDescription += filterDescription ? ` with status ${req.query.status}` : `with status ${req.query.status}`;
    }
    
    const bookings = await Booking.find(filter)
      .populate('user')
      .populate('service')
      .populate('provider')
      .sort({ createdAt: -1 });
    
    // Filter out bookings with missing relationships to prevent null reference errors
    const validBookings = bookings.filter(booking => booking.service && booking.user);
    
    res.render('pages/admin/bookings', {
      title: `Bookings ${filterDescription}`,
      bookings: validBookings,
      filter: req.query
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin');
  }
};

// Show booking assignment page
exports.showAssignBooking = async (req, res) => {
  try {
    // Get booking details
    const booking = await Booking.findById(req.params.id)
      .populate('user')
      .populate('service')
      .populate('provider');
    
    if (!booking) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/admin/bookings');
    }
    
    // Get available providers based on service type
    const serviceCategory = booking.service.name.toLowerCase();
    
    // Get all providers first (for debugging)
    const allProviders = await User.find({ role: 'provider' });
    console.log(`Found ${allProviders.length} total providers`);
    
    // Relaxed query to show more providers
    const providers = await User.find({ 
      role: 'provider'
      // Removed isAvailable filter to show all providers
      // Relaxed service category matching to show all providers for now
    });
    
    console.log(`Showing ${providers.length} providers for assignment`);
    
    res.render('pages/admin/assign-booking', {
      title: 'Assign Booking',
      booking,
      providers
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/bookings');
  }
};

// Assign booking to provider
exports.assignBooking = async (req, res) => {
  try {
    const { providerId } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/admin/bookings');
    }

    // Get provider details
    const provider = await User.findById(providerId);
    if (!provider) {
      req.flash('error_msg', 'Provider not found');
      return res.redirect('/admin/bookings');
    }
    
    // Update booking with provider and status
    booking.provider = providerId;
    booking.status = 'assigned';
    await booking.save();
    
    // Log assignment for tracking
    console.log(`Booking ${booking._id} assigned to provider ${provider.name} (${provider.email})`);
    
    req.flash('success_msg', `Booking successfully assigned to ${provider.name}. The customer can now contact the provider directly.`);
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/bookings');
  }
};

// Show all service providers
exports.getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }).sort({ createdAt: -1 });
    
    // Get current job counts for each provider
    const providersWithJobs = await Promise.all(
      providers.map(async (provider) => {
        const currentJobs = await Booking.countDocuments({
          provider: provider._id,
          status: { $in: ['assigned', 'in-progress'] }
        });
        
        return {
          ...provider._doc,
          currentJobs
        };
      })
    );
    
    res.render('pages/admin/providers', {
      title: 'Service Providers',
      providers: providersWithJobs
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin');
  }
};

// Show add provider form
exports.showAddProvider = async (req, res) => {
  try {
    const services = await Service.find().select('name');
    const serviceCategories = services.map(service => service.name.toLowerCase());
    
    res.render('pages/admin/add-provider', {
      title: 'Add Service Provider',
      serviceCategories
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/providers');
  }
};

// Add new provider
exports.addProvider = async (req, res) => {
  try {
    const { name, email, phone, password, serviceCategories, active } = req.body;
    
    // Check if provider exists
    let provider = await User.findOne({ email });
    if (provider) {
      req.flash('error_msg', 'Email is already registered');
      return res.redirect('/admin/providers/add');
    }
    
    console.log('Creating provider with service categories:', serviceCategories);
    
    // Create provider with explicit defaults
    provider = await User.create({
      name,
      email,
      phone,
      password,
      role: 'provider',
      isAvailable: active === 'true', // Convert form value to boolean
      serviceCategories: Array.isArray(serviceCategories) ? serviceCategories : (serviceCategories ? [serviceCategories] : [])
    });
    
    console.log('Created provider:', provider.name, 'Available:', provider.isAvailable, 'Categories:', provider.serviceCategories);
    
    req.flash('success_msg', 'Service provider added successfully');
    res.redirect('/admin/providers');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/providers');
  }
};

// Show all customers
exports.getAllCustomers = async (req, res) => {
  try {
    // Get all users with role 'user'
    const customers = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    
    // For each customer, get their booking count
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const bookingCount = await Booking.countDocuments({ user: customer._id });
        const completedBookingCount = await Booking.countDocuments({ 
          user: customer._id,
          status: 'completed'
        });
        
        return {
          ...customer._doc,
          bookingCount,
          completedBookingCount
        };
      })
    );
    
    res.render('pages/admin/customers', {
      title: 'Customer Management',
      customers: customersWithStats
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin');
  }
};

// Get provider by ID
exports.getProviderById = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    
    if (!provider || provider.role !== 'provider') {
      req.flash('error_msg', 'Service provider not found');
      return res.redirect('/admin/providers');
    }
    
    // Get the count of current jobs assigned to this provider
    const currentJobsCount = await Booking.countDocuments({
      provider: provider._id,
      status: { $in: ['assigned', 'in-progress'] }
    });
    
    // Get booking history for this provider
    const bookings = await Booking.find({
      provider: provider._id
    })
    .populate('user')
    .populate('service')
    .sort({ createdAt: -1 })
    .limit(10);
    
    res.render('pages/admin/view-provider', {
      title: `Provider: ${provider.name}`,
      provider,
      currentJobsCount,
      bookings
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/providers');
  }
};

// Show edit provider form
exports.showEditProvider = async (req, res) => {
  try {
    const provider = await User.findById(req.params.id);
    
    if (!provider || provider.role !== 'provider') {
      req.flash('error_msg', 'Service provider not found');
      return res.redirect('/admin/providers');
    }
    
    const services = await Service.find().select('name');
    const serviceCategories = services.map(service => service.name.toLowerCase());
    
    res.render('pages/admin/edit-provider', {
      title: `Edit Provider: ${provider.name}`,
      provider,
      serviceCategories
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/providers');
  }
};

// Update provider
exports.updateProvider = async (req, res) => {
  try {
    const { name, email, phone, password, serviceCategories, active } = req.body;
    const providerId = req.params.id;
    
    // Find provider
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      req.flash('error_msg', 'Service provider not found');
      return res.redirect('/admin/providers');
    }
    
    // Check if email is already taken (by someone else)
    if (email !== provider.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        req.flash('error_msg', 'Email is already registered to another account');
        return res.redirect(`/admin/providers/edit/${providerId}`);
      }
    }
    
    // Update basic information
    provider.name = name;
    provider.email = email;
    provider.phone = phone;
    provider.isAvailable = active === 'true';
    
    // Update service categories
    provider.serviceCategories = Array.isArray(serviceCategories) 
      ? serviceCategories 
      : (serviceCategories ? [serviceCategories] : []);
    
    // Update password if provided
    if (password && password.length >= 6) {
      provider.password = password;
    }
    
    await provider.save();
    
    req.flash('success_msg', 'Service provider updated successfully');
    res.redirect('/admin/providers');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/providers');
  }
};

// Delete provider
exports.deleteProvider = async (req, res) => {
  try {
    const providerId = req.params.id;
    
    // Find provider
    const provider = await User.findById(providerId);
    if (!provider || provider.role !== 'provider') {
      req.flash('error_msg', 'Service provider not found');
      return res.redirect('/admin/providers');
    }
    
    // Check if provider has assigned bookings
    const assignedBookings = await Booking.countDocuments({
      provider: providerId,
      status: { $in: ['assigned', 'in-progress'] }
    });
    
    if (assignedBookings > 0) {
      // Remove provider from all bookings and set them back to pending
      await Booking.updateMany(
        { provider: providerId, status: { $in: ['assigned', 'in-progress'] } },
        { $set: { status: 'pending', provider: null } }
      );
      
      console.log(`Reset ${assignedBookings} bookings to pending status`);
    }
    
    // Delete the provider
    await User.findByIdAndDelete(providerId);
    
    req.flash('success_msg', `Provider "${provider.name}" has been deleted successfully. Any assigned bookings were reset to pending status.`);
    res.redirect('/admin/providers');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/admin/providers');
  }
}; 