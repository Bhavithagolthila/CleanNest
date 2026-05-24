const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  price:    { type: Number, required: true, min: 0 },
  icon:     { type: String, default: '🏠' },
  desc:     { type: String, required: true, trim: true },
  duration: { type: String, required: true, trim: true },
  popular:  { type: Boolean, default: false },
  active:   { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
