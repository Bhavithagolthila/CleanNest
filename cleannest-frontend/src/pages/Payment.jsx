import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

// ─── API URL ─────────────────────────────────────────────────────────────────
// Same logic as AppContext — reads from env, defaults to localhost for dev
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// ─────────────────────────────────────────────────────────────────────────────

const paymentOptions = [
  { id: 'cash', label: 'Cash on Service', icon: '💵', desc: 'Pay when the cleaning is done' },
  { id: 'upi',  label: 'UPI',             icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay' },
];

export default function Payment() {
  const {
    selectedService,
    bookingDetails,
    paymentMethod,
    setPaymentMethod,
    addBooking,
    user,
  } = useApp();

  const navigate = useNavigate();

  // 'idle' | 'creating-order' | 'opening-razorpay' | 'saving-booking' | 'done'
  const [loading, setLoading]       = useState(false);
  const [statusMsg, setStatusMsg]   = useState('');

  // No booking found
  if (!selectedService || !bookingDetails) {
    return (
      <div className="page center-page">
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h2>No Booking Found</h2>
          <p>Please start from the services page.</p>
          <button className="btn-primary" onClick={() => navigate('/services')}>Browse Services</button>
        </div>
      </div>
    );
  }

  // Price calculation
  const gst   = Math.round(selectedService.price * 0.18);
  const total = selectedService.price + gst;

  // ─── Helper: make authenticated fetch with timeout ────────────────────────
  // WHY TIMEOUT? Backend on Render (free tier) sleeps when idle.
  // Without a timeout the fetch hangs forever showing "Processing...".
  // 20 seconds is generous for a woken-up Render server.
  const authFetch = (path, body) => {
    const token = localStorage.getItem('cleannest_token');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000); // 20s timeout

    return fetch(`${API}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(res => { clearTimeout(timer); return res.json(); })
      .catch(err => {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          throw new Error('Request timed out. Make sure your backend is running on localhost:5000.');
        }
        throw err;
      });
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleConfirm = async () => {
    setLoading(true);
    setStatusMsg('');

    try {
      // ── CASH — no Razorpay needed ──────────────────────────────────────────
      if (paymentMethod === 'cash') {
        setStatusMsg('Confirming your booking...');
        await addBooking({
          service:       selectedService.name,
          serviceId:     selectedService.id,
          icon:          selectedService.icon,
          price:         total,
          duration:      selectedService.duration,
          date:          bookingDetails.date,
          time:          bookingDetails.time,
          address:       bookingDetails.address,
          phone:         bookingDetails.phone,
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          status:        'Confirmed',
        });
        navigate('/success');
        return;
      }

      // ── UPI / CARD — Razorpay flow ─────────────────────────────────────────
      // STEP 1: Create Razorpay order on backend
      setStatusMsg('Creating payment order...');
      const orderData = await authFetch('/payments/create-order', { amount: total });

      if (!orderData.success) {
        throw new Error(orderData.message || 'Could not create payment order.');
      }

      // STEP 2: Open Razorpay popup
      // setLoading(false) here so button doesn't stay frozen if user closes popup
      setLoading(false);
      setStatusMsg('');

      const options = {
        key:       orderData.key,
        amount:    orderData.order.amount,
        currency:  orderData.order.currency,
        order_id:  orderData.order.id,
        name:      'CleanNest',
        description: 'Cleaning Service Payment',

        // ── Called by Razorpay after SUCCESSFUL payment ──────────────────────
        handler: async function (response) {
          setLoading(true);
          setStatusMsg('Saving your booking...');
          try {
            // Create booking in our DB
            const booking = await addBooking({
              service:          selectedService.name,
              serviceId:        selectedService.id,
              icon:             selectedService.icon,
              price:            total,
              duration:         selectedService.duration,
              date:             bookingDetails.date,
              time:             bookingDetails.time,
              address:          bookingDetails.address,
              phone:            bookingDetails.phone,
              paymentMethod,
              paymentStatus:    'pending',
              status:           'Confirmed',
              razorpayOrderId:  response.razorpay_order_id,
            });

            // Verify payment signature on backend
            setStatusMsg('Verifying payment...');
            await authFetch('/payments/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              bookingId:           booking?._id,
            });

            navigate('/success');
          } catch (err) {
            console.error('Post-payment error:', err);
            // Payment was successful on Razorpay — navigate anyway, don't block user
            alert('Payment received! Booking confirmation may be delayed. Check your dashboard.');
            navigate('/success');
          }
        },

        prefill: {
          name:    user?.name    || '',
          email:   user?.email   || '',
          contact: bookingDetails?.phone || user?.phone || '',
        },

        theme: { color: '#2563eb' },

        modal: {
          // User closed the Razorpay popup without paying
          ondismiss: function () {
            setLoading(false);
            setStatusMsg('');
          },
        },
      };

      const razor = new window.Razorpay(options);

      razor.on('payment.failed', function (response) {
        console.error('Razorpay payment failed:', response.error);
        alert('Payment failed: ' + (response.error?.description || 'Please try again.'));
        setLoading(false);
        setStatusMsg('');
      });

      razor.open();

    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      setStatusMsg('');
      alert('Error: ' + error.message);
    }
  };

  // ── Button label ─────────────────────────────────────────────────────────
  const btnLabel = () => {
    if (!loading) {
      return paymentMethod === 'cash'
        ? 'Confirm Booking →'
        : `Confirm & Pay ₹${total.toLocaleString()} →`;
    }
    return statusMsg || 'Processing...';
  };

  return (
    <div className="page payment-page">
      <div className="page-header">
        <h1>Payment</h1>
        <p>Review your order and choose payment method</p>
      </div>

      <div className="payment-layout">

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-service">
            <span className="ord-icon">{selectedService.icon}</span>
            <div>
              <div className="ord-name">{selectedService.name}</div>
              <div className="ord-meta">{bookingDetails.date} at {bookingDetails.time}</div>
              <div className="ord-addr">📍 {bookingDetails.address}</div>
            </div>
          </div>
          <div className="price-breakdown">
            <div className="price-row"><span>Service fee</span><span>₹{selectedService.price.toLocaleString()}</span></div>
            <div className="price-row"><span>GST (18%)</span><span>₹{gst}</span></div>
            <div className="price-row total-row"><span>Total</span><span>₹{total.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="payment-options">
          <h3>Choose Payment Method</h3>

          {paymentOptions.map((opt) => (
            <label
              key={opt.id}
              className={`payment-option ${paymentMethod === opt.id ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="payment"
                value={opt.id}
                checked={paymentMethod === opt.id}
                onChange={() => setPaymentMethod(opt.id)}
              />
              <div className="opt-icon">{opt.icon}</div>
              <div className="opt-content">
                <div className="opt-label">{opt.label}</div>
                <div className="opt-desc">{opt.desc}</div>
              </div>
              <div className="opt-check">{paymentMethod === opt.id ? '✓' : ''}</div>
            </label>
          ))}

          <button
            className="btn-primary btn-full"
            onClick={handleConfirm}
            disabled={loading}
          >
            {btnLabel()}
          </button>

          {/* Show what step is happening so user isn't confused */}
          {loading && statusMsg && (
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
              ⏳ {statusMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
