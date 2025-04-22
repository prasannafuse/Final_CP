const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Show booking form
// @route   GET /bookings/create/:serviceId
// @access  Private
exports.showBookingForm = async (req, res) => {
  try {
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      req.flash('error_msg', 'Service not found');
      return res.redirect('/services');
    }

    res.render('pages/booking/create', {
      title: `Book ${service.name}`,
      service
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Service not found');
    res.redirect('/services');
  }
};

// @desc    Create booking
// @route   POST /bookings/create/:serviceId
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { date, time, address, city, notes } = req.body;
    const service = await Service.findById(req.params.serviceId);

    if (!service) {
      req.flash('error_msg', 'Service not found');
      return res.redirect('/services');
    }

    // Validation
    const errors = [];
    if (!date || !time || !address || !city) {
      errors.push({ msg: 'Please fill in all required fields' });
    }

    if (errors.length > 0) {
      return res.render('pages/booking/create', {
        title: `Book ${service.name}`,
        service,
        errors,
        date,
        time,
        address,
        city,
        notes
      });
    }

    // Create booking
    await Booking.create({
      user: req.user.id,
      service: service._id,
      date,
      time,
      address,
      city,
      notes
    });

    req.flash('success_msg', 'Booking created successfully');
    res.redirect('/bookings/my-bookings');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/services');
  }
};

// @desc    Show user bookings
// @route   GET /bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('service')
      .populate('provider')
      .sort({ createdAt: -1 });

    res.render('pages/booking/my-bookings', {
      title: 'My Bookings',
      bookings
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// @desc    Cancel booking
// @route   POST /bookings/cancel/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/bookings/my-bookings');
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/bookings/my-bookings');
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    req.flash('success_msg', 'Booking cancelled successfully');
    res.redirect('/bookings/my-bookings');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/bookings/my-bookings');
  }
};

// @desc    Complete booking and provide feedback
// @route   POST /bookings/complete/:id
// @access  Private
exports.completeBooking = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/bookings/my-bookings');
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/bookings/my-bookings');
    }

    // Check if booking is in confirmed status
    if (booking.status !== 'confirmed') {
      req.flash('error_msg', 'Only confirmed bookings can be marked as completed');
      return res.redirect('/bookings/my-bookings');
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      req.flash('error_msg', 'Please provide a valid rating (1-5)');
      return res.redirect('/bookings/my-bookings');
    }

    // Update booking status and add feedback
    booking.status = 'completed';
    booking.rating = rating;
    booking.feedback = feedback;
    booking.completedAt = Date.now();
    
    await booking.save();

    // Log the completion
    console.log(`Booking ${booking._id} marked as completed by user. Rating: ${rating}/5`);

    req.flash('success_msg', 'Thank you! The service has been marked as completed and your feedback has been submitted.');
    res.redirect('/bookings/my-bookings');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/bookings/my-bookings');
  }
}; 