const Contact = require('../models/Contact');

// @desc    Show contact form
// @route   GET /contact
// @access  Public
exports.showContactForm = (req, res) => {
  res.render('pages/contact', {
    title: 'Contact Us'
  });
};

// @desc    Submit contact form
// @route   POST /contact
// @access  Public
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    const errors = [];
    if (!name || !email || !message) {
      errors.push({ msg: 'Please fill in all fields' });
    }

    if (errors.length > 0) {
      return res.render('pages/contact', {
        title: 'Contact Us',
        errors,
        name,
        email,
        message
      });
    }

    // Save contact message
    await Contact.create({
      name,
      email,
      message
    });

    req.flash('success_msg', 'Your message has been sent. We will get back to you soon.');
    res.redirect('/contact');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Server Error');
    res.redirect('/contact');
  }
}; 