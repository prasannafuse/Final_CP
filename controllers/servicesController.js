const Service = require('../models/Service');

// @desc    Show all services
// @route   GET /services
// @access  Public
exports.getServices = async (req, res) => {
  try {
    // Get all services
    const services = await Service.find();

    res.render('pages/services/index', {
      title: 'Our Services',
      services
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('pages/500', {
      error: err
    });
  }
};

// @desc    Show single service
// @route   GET /services/:id
// @access  Public
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      req.flash('error_msg', 'Service not found');
      return res.redirect('/services');
    }

    res.render('pages/services/show', {
      title: service.name,
      service
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Service not found');
    res.redirect('/services');
  }
}; 