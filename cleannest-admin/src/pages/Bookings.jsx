import React, { useState, useEffect, useCallback } from 'react';
import { adminFetch } from '../context/AdminContext';

const STATUS_COLOR = {
  Confirmed: 'badge-confirmed',
  Pending: 'badge-pending',
  Completed: 'badge-completed',
  Cancelled: 'badge-cancelled',
};
const METHOD_LABELS = { cash: '💵 Cash', upi: '📱 UPI', card: '💳 Card', razorpay: '💳 Razorpay' };
const FILTER_OPTIONS = ['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'];

// What options admin can pick based on current status
const ALLOWED_NEXT = {
  Confirmed: ['Confirmed', 'Completed'],   // admin can mark as Completed
  Pending:   ['Pending', 'Confirmed', 'Cancelled'], // admin can confirm or cancel
  Completed: ['Completed'],                // done, no change
  Cancelled: ['Cancelled'],               // user cancelled, no change
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filter !== 'All') params.set('status', filter);
      if (search) params.set('search', search);
      const { ok, data } = await adminFetch(`/admin/bookings?${params}`);
      if (ok) {
        setBookings(data.bookings || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } else {
        setError(data.message || 'Could not load bookings.');
      }
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusChange = async (b, newStatus) => {
    if (newStatus === b.status) return;

    setUpdating(b._id);
    try {
      const { ok, data } = await adminFetch(`/admin/bookings/${b._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      if (ok) {
        setBookings(prev => prev.map(bk => bk._id === b._id ? { ...bk, status: newStatus } : bk));
      } else {
        alert(data.message || 'Could not update status.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-sub">{total} total bookings in database</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-tabs">
          {FILTER_OPTIONS.map(s => (
            <button
              key={s}
              className={`filter-tab ${filter === s ? 'tab-active' : ''}`}
              onClick={() => { setFilter(s); setPage(1); }}
            >
              {s}
            </button>
          ))}
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            placeholder="Search name, email, service, address..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button type="submit" className="search-btn">Search</button>
          {search && (
            <button type="button" className="clear-btn" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}>✕ Clear</button>
          )}
        </form>
      </div>

      {error && <div className="alert-error">⚠ {error}</div>}

      {loading ? (
        <div className="page-loading"><div className="loader"></div><p>Loading bookings...</p></div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No bookings found</h3>
          <p>Try changing the filter or search term.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Address</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th>Pay Status</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b, i) => {
                  const nextOptions = ALLOWED_NEXT[b.status] || [b.status];
                  const isLocked = nextOptions.length === 1; // Completed or Cancelled — no change allowed

                  return (
                    <React.Fragment key={b._id}>
                      <tr
                        className={`table-row ${expandedId === b._id ? 'row-expanded' : ''}`}
                        onClick={() => setExpandedId(expandedId === b._id ? null : b._id)}
                      >
                        <td className="td-num">{(page - 1) * 15 + i + 1}</td>
                        <td>
                          <div className="cell-name">{b.userName}</div>
                          <div className="cell-sub">{b.userEmail}</div>
                        </td>
                        <td>
                          <span className="service-badge">{b.icon} {b.service}</span>
                        </td>
                        <td>
                          <div className="cell-date">{b.date}</div>
                          <div className="cell-sub">{b.time}</div>
                        </td>
                        <td className="td-addr">{b.address}</td>
                        <td>{METHOD_LABELS[b.paymentMethod] || b.paymentMethod}</td>
                        <td className="td-amount">₹{b.price?.toLocaleString('en-IN')}</td>
                        <td>
                          <span className={`badge ${
                            b.paymentStatus === 'paid' ? 'badge-completed' :
                            b.paymentStatus === 'refunded' ? 'badge-pending' :
                            b.paymentStatus === 'failed' ? 'badge-cancelled' : 'badge-pending'
                          }`}>
                            {b.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${STATUS_COLOR[b.status]}`}>{b.status}</span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          {isLocked ? (
                            // Completed or Cancelled — show locked text, no dropdown
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                              {b.status === 'Completed' ? '✅ Done' : '🚫 Cancelled'}
                            </span>
                          ) : (
                            // Confirmed or Pending — show dropdown with valid options only
                            <>
                              <select
                                className="status-select"
                                value={b.status}
                                disabled={updating === b._id}
                                onChange={e => handleStatusChange(b, e.target.value)}
                              >
                                {nextOptions.map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              {updating === b._id && <span className="updating-spinner">⏳</span>}
                            </>
                          )}
                        </td>
                      </tr>

                      {expandedId === b._id && (
                        <tr className="expanded-row">
                          <td colSpan={10}>
                            <div className="expanded-content">
                              <div className="exp-grid">
                                <div><span className="exp-label">Phone</span><span>{b.phone}</span></div>
                                <div><span className="exp-label">Duration</span><span>{b.duration || '—'}</span></div>
                                <div><span className="exp-label">Email Sent</span><span>{b.emailSent ? '✅ Yes' : '❌ No'}</span></div>
                                <div><span className="exp-label">Booking ID</span><span className="exp-id">{b._id}</span></div>
                                {b.razorpayPaymentId && <div><span className="exp-label">Razorpay ID</span><span className="exp-id">{b.razorpayPaymentId}</span></div>}
                                <div><span className="exp-label">Created</span><span>{new Date(b.createdAt).toLocaleString('en-IN')}</span></div>
                                {b.paymentStatus === 'refunded' && (
                                  <div><span className="exp-label">Refund</span><span style={{ color: '#b45309' }}>🔄 Refund initiated (4–5 business days)</span></div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="page-btn">← Prev</button>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'page-active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="page-btn">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
