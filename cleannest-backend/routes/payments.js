const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const { protect } = require('../middleware/auth');

// ─────────────────────────────────────
// Init Razorpay — only if REAL keys exist
// ─────────────────────────────────────
const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  
  if (
    !keyId ||
    !keySecret ||
    keyId.includes('REPLACE') ||
    keyId === 'rzp_test_dummy' ||
    keyId.length < 20  // real keys are longer than this
  ) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// ─────────────────────────────────────
// POST /api/payments/create-order
// ─────────────────────────────────────
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    // ✅ FIX: Validate amount
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount.' });
    }

    const razorpay = getRazorpay();

    if (!razorpay) {
      // ⚠️ No valid keys — return a dummy order (dev/demo mode)
      console.warn('⚠️  Razorpay keys not set or invalid. Running in DUMMY mode.');
      return res.json({
        success: true,
        isDummy: true,
        order: {
          id: 'order_dummy_' + Date.now(),
          amount: Math.round(amount * 100),
          currency: 'INR',
        },
        key: 'rzp_test_dummy',
      });
    }

    // ✅ Real Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise — must be integer
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    console.log('✅ Razorpay order created:', order.id);

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    console.error('Razorpay create-order error:', err);

    // ✅ FIX: Return the actual Razorpay error message so frontend can show it
    const msg = err?.error?.description || err?.message || 'Could not create payment order.';
    res.status(500).json({ success: false, message: msg });
  }
});

// ─────────────────────────────────────
// POST /api/payments/verify
// ─────────────────────────────────────
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    // ✅ FIX: Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment details.' });
    }

    // Dummy order — skip verification
    if (razorpay_order_id.startsWith('order_dummy_')) {
      if (bookingId) {
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: 'paid',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: 'pay_dummy_' + Date.now(),
        });
      }
      return res.json({ success: true, message: 'Payment verified (dummy mode).' });
    }

    // ✅ Real signature verification
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Signature mismatch!');
      return res.status(400).json({ success: false, message: 'Payment verification failed. Signature mismatch.' });
    }

    // ✅ Update booking to paid
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: 'paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });
    }

    console.log('✅ Payment verified:', razorpay_payment_id);
    res.json({ success: true, message: 'Payment verified successfully!' });

  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ success: false, message: 'Payment verification error.' });
  }
});

module.exports = router;