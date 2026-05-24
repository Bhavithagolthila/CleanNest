import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../context/AdminContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [userBookings, setUserBookings] = useState({});
  const [loadingBookings, setLoadingBookings] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const { ok, data } = await adminFetch(`/admin/users?${params}`);
      if (ok) setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const toggleExpand = async (userId) => {
    if (expandedId === userId) { setExpandedId(null); return; }
    setExpandedId(userId);
    if (!userBookings[userId]) {
      setLoadingBookings(userId);
      try {
        const { ok, data } = await adminFetch(`/admin/users/${userId}/bookings`);
        if (ok) setUserBookings(prev => ({ ...prev, [userId]: data.bookings || [] }));
      } catch {}
      finally { setLoadingBookings(null); }
    }
  };

  const STATUS_COLOR = {
    Confirmed: 'badge-confirmed',
    Pending: 'badge-pending',
    Completed: 'badge-completed',
    Cancelled: 'badge-cancelled',
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-sub">{users.length} registered customers</p>
        </div>
      </div>

      {/* Search */}
      <div className="filter-bar">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button type="submit" className="search-btn">Search</button>
          {search && (
            <button type="button" className="clear-btn" onClick={() => { setSearch(''); setSearchInput(''); }}>✕ Clear</button>
          )}
        </form>
      </div>

      {loading ? (
        <div className="page-loading"><div className="loader"></div><p>Loading users...</p></div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div className="user-cards">
          {users.map((u, i) => (
            <div key={u._id} className="user-card">
              <div
                className="user-card-header"
                onClick={() => toggleExpand(u._id)}
              >
                <div className="user-card-left">
                  <div className="user-avatar">{u.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="uc-name">{u.name}</div>
                    <div className="uc-email">{u.email}</div>
                    {u.phone && <div className="uc-phone">📞 {u.phone}</div>}
                  </div>
                </div>
                <div className="user-card-stats">
                  <div className="uc-stat">
                    <div className="uc-stat-val">{u.totalBookings}</div>
                    <div className="uc-stat-label">Bookings</div>
                  </div>
                  <div className="uc-stat">
                    <div className="uc-stat-val">₹{(u.totalSpent || 0).toLocaleString('en-IN')}</div>
                    <div className="uc-stat-label">Total Spent</div>
                  </div>
                  <div className="uc-stat">
                    <div className="uc-stat-val">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                    <div className="uc-stat-label">Joined</div>
                  </div>
                  <div className="expand-arrow">{expandedId === u._id ? '▲' : '▼'}</div>
                </div>
              </div>

              {/* Status breakdown chips */}
              {u.byStatus && Object.keys(u.byStatus).length > 0 && (
                <div className="status-chips">
                  {Object.entries(u.byStatus).map(([status, count]) => (
                    <span key={status} className={`chip ${STATUS_COLOR[status]}`}>{status}: {count}</span>
                  ))}
                </div>
              )}

              {/* Expanded: user's bookings */}
              {expandedId === u._id && (
                <div className="user-bookings-expand">
                  {loadingBookings === u._id ? (
                    <div className="empty-small">Loading bookings...</div>
                  ) : !userBookings[u._id] || userBookings[u._id].length === 0 ? (
                    <div className="empty-small">No bookings yet.</div>
                  ) : (
                    <table className="data-table mini-table">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Amount</th>
                          <th>Payment</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userBookings[u._id].map(b => (
                          <tr key={b._id}>
                            <td>{b.icon} {b.service}</td>
                            <td>{b.date}</td>
                            <td>{b.time}</td>
                            <td className="td-amount">₹{b.price?.toLocaleString('en-IN')}</td>
                            <td>{b.paymentMethod}</td>
                            <td><span className={`badge ${STATUS_COLOR[b.status]}`}>{b.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
