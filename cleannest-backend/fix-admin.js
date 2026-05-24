// ============================================================
// fix-admin.js — Emergency fix if login still doesn't work
// Usage: node fix-admin.js
// ============================================================
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');

  // Delete and recreate cleanly
  await User.deleteOne({ email: 'admin@cleannest.in' });
  
  // Let the model hash the password via pre('save') hook
  await User.create({
    name: 'Admin',
    email: 'admin@cleannest.in',
    password: 'admin123',
    role: 'admin',
  });

  console.log('✅ Admin fixed! Login with: admin@cleannest.in / admin123');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
