const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');
const { sendBookingConfirmation } = require('../controllers/emailService');

// POST /api/bookings
router.post('/', protect, async (req, res) => {
  try {
    const {
      service, serviceId, icon, price, duration,
      date, time, address, phone,
      paymentMethod,
    } = req.body;

    if (!service || !price || !date || !time || !address || !phone) {
      return res.status(400).json({ success: false, message: 'All booking fields are required.' });
    }

    const booking = await Booking.create({
      user: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      service, serviceId, icon, price, duration,
      date, time, address, phone,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
      status: 'Confirmed',
    });

    const emailSent = await sendBookingConfirmation(booking, req.user.email, req.user.name);
    if (emailSent) {
      await Booking.findByIdAndUpdate(booking._id, { emailSent: true });
    }

    res.status(201).json({ success: true, message: 'Booking confirmed!', booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Could not create booking. Try again.' });
  }
});

// GET /api/bookings/my
router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch bookings.' });
  }
});

// PATCH /api/bookings/:id/cancel
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }
    if (booking.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Completed bookings cannot be cancelled.' });
    }

    booking.status = 'Cancelled';

    // If user paid online, mark as refunded
    const paidOnline = booking.paymentStatus === 'paid' && booking.paymentMethod !== 'cash';
    if (paidOnline) {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled.',
      refundApplicable: paidOnline,
      booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not cancel booking.' });
  }
});

module.exports = router;
