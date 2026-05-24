const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userEmail: { type: String, required: true },
  userName:  { type: String, required: true },

  // Service details
  service:   { type: String, required: true },
  serviceId: { type: Number },
  icon:      { type: String, default: '🏠' },
  price:     { type: Number, required: true },
  duration:  { type: String },

  // Booking details
  date:    { type: String, required: true },
  time:    { type: String, required: true },
  address: { type: String, required: true },
  phone:   { type: String, required: true },

  // ─── Location coordinates (optional) ──────────────────────
  // Stored when user clicks "Use My Location" on the booking form.
  // These are the raw GPS coords from navigator.geolocation.
  // We don't store them from the frontend right now, but the
  // schema is ready so you can add it anytime.
  // e.g. latitude: 12.9716, longitude: 77.5946
  latitude:  { type: Number, default: null },
  longitude: { type: Number, default: null },
  // ──────────────────────────────────────────────────────────

  // Payment
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cash', 'razorpay'],
    default: 'cash',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },

  // Booking status
  status: {
    type: String,
    enum: ['Confirmed', 'Pending', 'Completed', 'Cancelled'],
    default: 'Confirmed',
  },

  // Email confirmation sent?
  emailSent: { type: Boolean, default: false },

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
