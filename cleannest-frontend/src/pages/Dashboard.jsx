import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const methodLabels = { cash: '💵 Cash on Arrival', upi: '📱 UPI', card: '💳 Card', razorpay: '💳 Online' };
const statusColors = {
  Confirmed: { bg: '#dcfce7', color: '#16a34a' },
  Pending:   { bg: '#fef9c3', color: '#ca8a04' },
  Cancelled: { bg: '#fee2e2', color: '#dc2626' },
  Completed: { bg: '#dbeafe', color: '#2563eb' },
};

export default function Dashboard() {
  const { bookings, loadingBookings, cancelBooking, user } = useApp();
  const navigate = useNavigate();
  const [refundMsg, setRefundMsg] = useState('');

  const handleCancel = async (id, paymentMethod) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const result = await cancelBooking(id);
      const paidOnline = paymentMethod && paymentMethod !== 'cash';
      if (paidOnline) {
        setRefundMsg('✅ Booking cancelled! Your refund will be processed in 4–5 business days to your original payment method.');
      } else {
        setRefundMsg('✅ Booking cancelled successfully.');
      }
      setTimeout(() => setRefundMsg(''), 8000);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <h1>My Dashboard</h1>
        <p>Welcome back, <strong>{user?.name}</strong>! Here are your bookings.</p>
      </div>

      {/* Refund / Cancel message banner */}
      {refundMsg && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #86efac',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '1.5rem',
          color: '#166534',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>💰</span>
          <span>{refundMsg}</span>
        </div>
      )}

      {loadingBookings ? (
        <div className="empty-state"><p>Loading bookings...</p></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2>No Bookings Yet</h2>
          <p>You haven't made any bookings. Start your first one!</p>
          <button className="btn-primary" onClick={() => navigate('/services')}>Book a Service</button>
        </div>
      ) : (
        <div className="bookings-list">
          <div className="bookings-count">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</div>
          {bookings.map((b) => {
            const sc = statusColors[b.status] || statusColors.Confirmed;
            return (
              <div className="booking-card" key={b._id}>
                <div className="bcard-left">
                  <div className="bcard-icon">{b.icon}</div>
                  <div className="bcard-info">
                    <div className="bcard-name">{b.service}</div>
                    <div className="bcard-date">📅 {b.date} at {b.time}</div>
                    <div className="bcard-addr">📍 {b.address}</div>
                    <div className="bcard-method">{methodLabels[b.paymentMethod] || b.paymentMethod}</div>
                    {/* Show refund badge on cancelled online-paid bookings */}
                    {b.status === 'Cancelled' && b.paymentMethod !== 'cash' && b.paymentStatus === 'refunded' && (
                      <div style={{
                        marginTop: '6px',
                        fontSize: '0.82rem',
                        color: '#b45309',
                        background: '#fef3c7',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        display: 'inline-block',
                      }}>
                        💰 Refund in progress (4–5 business days)
                      </div>
                    )}
                  </div>
                </div>
                <div className="bcard-right">
                  <div className="bcard-status" style={{ background: sc.bg, color: sc.color }}>
                    {b.status}
                  </div>
                  <div className="bcard-price">₹{b.price?.toLocaleString()}</div>
                  {/* Cancel only for Confirmed bookings */}
                  {b.status === 'Confirmed' && (
                    <button
                      className="btn-cancel-booking"
                      onClick={() => handleCancel(b._id, b.paymentMethod)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button className="btn-primary" onClick={() => navigate('/services')}>+ Book Another Service</button>
      </div>
    </div>
  );
}
