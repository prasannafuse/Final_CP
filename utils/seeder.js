const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Service = require('../models/Service');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected for seeding'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Sample services data
const services = [
  {
    name: 'Plumbing',
    description: 'Professional plumbing services including pipe installation, repairs, drain cleaning, fixing leaks, and bathroom fixture installation.',
    price: 599,
    image: '/images/plumbing.jpg'
  },
  {
    name: 'Electrical',
    description: 'Complete electrical services for your home including installation, repairs, wiring, lighting fixtures, and electrical panel upgrades.',
    price: 699,
    image: '/images/electrical.jpg'
  },
  {
    name: 'Carpentry',
    description: 'Expert carpentry services for furniture repairs, custom woodwork, door installation, cabinet making, and structural repairs.',
    price: 499,
    image: '/images/carpentry.jpg'
  },
  {
    name: 'Painting',
    description: 'Professional painting services for interior and exterior walls, ceilings, trim, doors, and furniture with premium quality paints.',
    price: 449,
    image: '/images/painting.jpg'
  },
  {
    name: 'Cleaning',
    description: 'Comprehensive cleaning services for homes and offices including deep cleaning, regular maintenance, carpet cleaning, and window washing.',
    price: 349,
    image: '/images/cleaning.jpg'
  },
  {
    name: 'Gardening',
    description: 'Complete gardening services including lawn care, plant installation, pruning, weeding, and garden design to beautify your outdoor space.',
    price: 399,
    image: '/images/gardening.jpg'
  }
];

// Sample admin user
const admin = {
  name: 'Admin User',
  email: 'admin@example.com',
  phone: '1234567890',
  password: 'admin123',
  role: 'admin'
};

// Import data
const importData = async () => {
  try {
    // Clean existing data
    await Service.deleteMany();
    await User.deleteMany();

    // Insert services
    await Service.insertMany(services);
    
    // Create admin user
    await User.create(admin);

    console.log('Data imported successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run import
importData(); 