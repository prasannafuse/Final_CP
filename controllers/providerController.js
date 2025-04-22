const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Show provider dashboard
// @route   GET /provider/dashboard
// @access  Private/Provider
exports.showDashboard = async (req, res) => {
  try {
    // Get all bookings assigned to this provider
    const allJobs = await Booking.find({ provider: req.user.id })
      .populate('service')
      .populate('user', 'name email phone')
      .sort({ date: 1 });

    // Separate bookings by status
    const pendingJobs = allJobs.filter(job => job.status === 'assigned');
    const confirmedJobs = allJobs.filter(job => job.status === 'confirmed');
    const completedJobs = allJobs.filter(job => job.status === 'completed');

    // Get jobs scheduled for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayJobs = allJobs.filter(job => {
      const jobDate = new Date(job.date);
      jobDate.setHours(0, 0, 0, 0);
      return jobDate.getTime() === today.getTime();
    });

    // Calculate average rating if there are any completed jobs with ratings
    const ratedJobs = completedJobs.filter(job => job.rating);
    let averageRating = 0;
    if (ratedJobs.length > 0) {
      const totalRating = ratedJobs.reduce((sum, job) => sum + job.rating, 0);
      averageRating = totalRating / ratedJobs.length;
    }

    res.render('pages/provider/dashboard', {
      title: 'Provider Dashboard',
      allJobs,
      pendingJobs,
      confirmedJobs,
      completedJobs,
      todayJobs,
      ratedJobs: ratedJobs.length,
      averageRating: averageRating.toFixed(1)
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/');
  }
};

// @desc    Accept job
// @route   POST /provider/jobs/accept/:id
// @access  Private/Provider
exports.acceptJob = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/provider/dashboard');
    }

    // Check if booking is assigned to this provider
    if (booking.provider.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/provider/dashboard');
    }

    // Update booking status
    booking.status = 'confirmed';
    await booking.save();

    req.flash('success_msg', 'Job accepted successfully');
    res.redirect('/provider/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/provider/dashboard');
  }
};

// @desc    Reject job
// @route   POST /provider/jobs/reject/:id
// @access  Private/Provider
exports.rejectJob = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/provider/dashboard');
    }

    // Check if booking is assigned to this provider
    if (booking.provider.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/provider/dashboard');
    }

    // Update booking status and remove provider
    booking.status = 'pending';
    booking.provider = null;
    await booking.save();

    req.flash('success_msg', 'Job rejected successfully');
    res.redirect('/provider/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/provider/dashboard');
  }
};

// @desc    Complete job
// @route   POST /provider/jobs/complete/:id
// @access  Private/Provider
exports.completeJob = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/provider/dashboard');
    }

    // Check if booking is assigned to this provider
    if (booking.provider.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/provider/dashboard');
    }

    // Update booking status
    booking.status = 'completed';
    booking.completedAt = Date.now(); // Set completion date
    await booking.save();

    req.flash('success_msg', 'Job marked as completed. Waiting for customer feedback.');
    res.redirect('/provider/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/provider/dashboard');
  }
};

// @desc    Update job notes
// @route   POST /provider/jobs/update-notes/:id
// @access  Private/Provider
exports.updateJobNotes = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      req.flash('error_msg', 'Booking not found');
      return res.redirect('/provider/dashboard');
    }

    // Check if booking is assigned to this provider
    if (booking.provider.toString() !== req.user.id) {
      req.flash('error_msg', 'Not authorized');
      return res.redirect('/provider/dashboard');
    }

    // Update provider notes
    booking.providerNotes = req.body.providerNotes;
    await booking.save();

    req.flash('success_msg', 'Notes updated successfully');
    res.redirect('/provider/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/provider/dashboard');
  }
};

// @desc    Update provider availability
// @route   POST /provider/update-availability
// @access  Private/Provider
exports.updateAvailability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.isAvailable = req.body.isAvailable;
    await user.save();

    return res.status(200).json({ success: true, isAvailable: user.isAvailable });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
}; 