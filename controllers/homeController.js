const Service = require('../models/Service');

// @desc    Show home page
// @route   GET /
// @access  Public
exports.showHomePage = async (req, res) => {
  try {
    // Get all services
    const services = await Service.find().limit(6);

    res.render('pages/home', {
      title: 'Home Service Management',
      services
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/500', {
      error: err
    });
  }
}; 