import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

const NAV = [
  { to: '/',         label: 'Dashboard', icon: '▦' },
  { to: '/bookings', label: 'Bookings',  icon: '📋' },
  { to: '/users',    label: 'Users',     icon: '👥' },
  { to: '/services', label: 'Services',  icon: '🧹' },
];

export default function Sidebar() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">CN</div>
        <div>
          <div className="brand-name">CleanNest</div>
          <div className="brand-sub">Admin Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="admin-info">
          <div className="admin-avatar">{admin?.name?.[0]?.toUpperCase() || 'A'}</div>
          <div>
            <div className="admin-name">{admin?.name}</div>
            <div className="admin-email">{admin?.email}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          ⎋ Logout
        </button>
      </div>
    </aside>
  );
}
