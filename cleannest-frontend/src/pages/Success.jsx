import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Success() {
  const { bookings } = useApp();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  const latest = bookings[0];

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    if (!latest) navigate('/');
  }, []);

  if (!latest) return null;

  const methodLabels = { cash: '💵 Cash on Service', upi: '📱 UPI', card: '💳 Card' };

  return (
    <div className="page success-page">
      <div className={`success-container ${show ? 'visible' : ''}`}>
        <div className="success-icon-wrap">
          <div className="success-ring"></div>
          <div className="success-check">✓</div>
        </div>
        <h1>Booking Confirmed! 🎉</h1>
        <p className="success-sub">Your cleaning has been scheduled. We'll see you soon!</p>

        <div className="success-card">
          <div className="success-row">
            <span>Service</span>
            <span>{latest.icon} {latest.service}</span>
          </div>
          <div className="success-row">
            <span>Date & Time</span>
            <span>{latest.date} at {latest.time}</span>
          </div>
          <div className="success-row">
            <span>Address</span>
            <span>{latest.address}</span>
          </div>
          <div className="success-row">
            <span>Payment</span>
            <span>{methodLabels[latest.paymentMethod]}</span>
          </div>
          <div className="success-row total-row">
            <span>Amount Paid</span>
            <span>₹{latest.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard →
          </button>
          <button className="btn-secondary" onClick={() => navigate('/services')}>
            Book Another
          </button>
        </div>
      </div>
    </div>
  );
}
