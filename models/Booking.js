const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  date: {
    type: Date,
    required: [true, 'Please select a date']
  },
  time: {
    type: String,
    required: [true, 'Please select a time']
  },
  address: {
    type: String,
    required: [true, 'Please add your address']
  },
  city: {
    type: String,
    required: [true, 'Please add your city']
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'confirmed', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  providerNotes: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema); 