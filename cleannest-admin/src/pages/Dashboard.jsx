import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminFetch } from '../context/AdminContext';

const STATUS_COLOR = {
  Confirmed: 'badge-confirmed',
  Pending: 'badge-pending',
  Completed: 'badge-completed',
  Cancelled: 'badge-cancelled',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, bookingsRes, usersRes] = await Promise.all([
          adminFetch('/admin/stats'),
          adminFetch('/admin/bookings?limit=5'),
          adminFetch('/admin/users'),
        ]);
        if (statsRes.ok) setStats(statsRes.data.stats);
        if (bookingsRes.ok) setRecentBookings(bookingsRes.data.bookings || []);
        if (usersRes.ok) setRecentUsers((usersRes.data.users || []).slice(0, 5));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="loader"></div>
      <p>Loading dashboard...</p>
    </div>
  );

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats?.totalBookings ?? '—',
      icon: '📋',
      color: 'card-blue',
      sub: 'All time',
    },
    {
      label: 'Total Revenue',
      value: stats ? `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}` : '—',
      icon: '💰',
      color: 'card-green',
      sub: 'Excl. cancelled',
    },
    {
      label: 'Active Users',
      value: stats?.totalUsers ?? '—',
      icon: '👥',
      color: 'card-purple',
      sub: 'Registered customers',
    },
    {
      label: 'Confirmed',
      value: stats?.byStatus?.Confirmed?.count ?? 0,
      icon: '✅',
      color: 'card-teal',
      sub: 'Upcoming bookings',
    },
    {
      label: 'Completed',
      value: stats?.byStatus?.Completed?.count ?? 0,
      icon: '🏆',
      color: 'card-amber',
      sub: 'Successfully done',
    },
    {
      label: 'Cancelled',
      value: stats?.byStatus?.Cancelled?.count ?? 0,
      icon: '❌',
      color: 'card-red',
      sub: 'Cancelled orders',
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Welcome back — here's what's happening today.</p>
        </div>
        <div className="page-date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map(card => (
          <div key={card.label} className={`stat-card ${card.color}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
            <div className="stat-sub">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        {/* Recent Bookings */}
        <div className="dash-section">
          <div className="section-header">
            <h2>Recent Bookings</h2>
            <button className="view-all-btn" onClick={() => navigate('/bookings')}>View all →</button>
          </div>
          <div className="dash-table-wrap">
            {recentBookings.length === 0 ? (
              <div className="empty-small">No bookings yet</div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b._id}>
                      <td>
                        <div className="cell-name">{b.userName}</div>
                        <div className="cell-sub">{b.userEmail}</div>
                      </td>
                      <td>{b.icon} {b.service}</td>
                      <td>
                        <div>{b.date}</div>
                        <div className="cell-sub">{b.time}</div>
                      </td>
                      <td className="cell-amount">₹{b.price?.toLocaleString('en-IN')}</td>
                      <td><span className={`badge ${STATUS_COLOR[b.status]}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="dash-section">
          <div className="section-header">
            <h2>Recent Users</h2>
            <button className="view-all-btn" onClick={() => navigate('/users')}>View all →</button>
          </div>
          <div className="dash-table-wrap">
            {recentUsers.length === 0 ? (
              <div className="empty-small">No users yet</div>
            ) : (
              <div className="user-list">
                {recentUsers.map(u => (
                  <div key={u._id} className="user-row">
                    <div className="user-avatar-sm">{u.name?.[0]?.toUpperCase()}</div>
                    <div className="user-info">
                      <div className="user-name">{u.name}</div>
                      <div className="user-email">{u.email}</div>
                    </div>
                    <div className="user-meta">
                      <div className="user-bookings">{u.totalBookings} bookings</div>
                      <div className="user-spent">₹{(u.totalSpent || 0).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
