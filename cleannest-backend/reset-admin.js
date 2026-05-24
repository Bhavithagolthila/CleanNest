/**
 * Run this script to reset/recreate the admin account:
 * node reset-admin.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function resetAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteOne({ email: 'admin@cleannest.in' });
  
  await User.create({
    name: 'Admin',
    email: 'admin@cleannest.in',
    password: 'Admin@123',
    role: 'admin',
  });

  console.log('✅ Admin account created:');
  console.log('   Email:    admin@cleannest.in');
  console.log('   Password: Admin@123');
  
  await mongoose.disconnect();
  process.exit(0);
}

resetAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});
