// Seed script: populates Trainers and demo Members for testing.
// Run once:  node seed.js   (safe to re-run - clears both collections first)
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Member = require('./models/Member');
const Trainer = require('./models/Trainer');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Member.deleteMany({});
    await Trainer.deleteMany({});

    // Passwords are plain here; the pre-validate hook hashes them automatically.
    await Member.create([
      { name: 'Heet Mehta', email: 'heet@fitzone.com', password: 'fitzone123', phone: '9876543210', membershipType: 'premium', role: 'member' },
      { name: 'Admin User', email: 'admin@fitzone.com', password: 'admin12345', phone: '9999999999', membershipType: 'platinum', role: 'admin' }
    ]);

    await Trainer.create([
      { name: 'Rahul Shah', specialization: 'Weight Training', available: true },
      { name: 'Priya Patel', specialization: 'Yoga', available: true },
      { name: 'Amit Kumar', specialization: 'Cardio', available: false },
      { name: 'Sneha Desai', specialization: 'CrossFit', available: true },
      { name: 'Vikram Singh', specialization: 'Yoga', available: false }
    ]);

    console.log('Seeded: 2 members (heet@fitzone.com / fitzone123, admin@fitzone.com / admin12345), 5 trainers');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
}

seed();