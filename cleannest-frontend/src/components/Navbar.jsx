import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { isLoggedIn, user, logout } = useApp();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [dropOpen,    setDropOpen]    = useState(false);
  const dropRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
    setDropOpen(false);
  };

  const isActive = (path) => location.pathname === path;
  const close    = () => { setMenuOpen(false); setDropOpen(false); };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={close}>
          <span className="logo-icon">✦</span>
          <span>CleanNest</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/"         className={isActive('/')         ? 'active' : ''} onClick={close}>Home</Link>
          <Link to="/services" className={isActive('/services') ? 'active' : ''} onClick={close}>Services</Link>
          <Link to="/about"    className={isActive('/about')    ? 'active' : ''} onClick={close}>About</Link>
          <Link to="/contact"  className={isActive('/contact')  ? 'active' : ''} onClick={close}>Contact</Link>

          {isLoggedIn && (
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''} onClick={close}>Dashboard</Link>
          )}

          {isLoggedIn ? (
            // ── User dropdown ──────────────────────────────────
            <div className="nav-user-wrap" ref={dropRef}>
              <button
                className="nav-user-btn"
                onClick={() => setDropOpen(p => !p)}
                aria-label="User menu"
              >
                <span className="user-avatar-sm">{user?.name?.[0]?.toUpperCase()}</span>
                <span className="user-greeting">Hi, {user?.name?.split(' ')[0]}</span>
                <span className="dropdown-arrow">{dropOpen ? '▲' : '▼'}</span>
              </button>

              {dropOpen && (
                <div className="nav-dropdown">
                  <div className="dropdown-header">
                    <div className="dh-name">{user?.name}</div>
                    <div className="dh-email">{user?.email}</div>
                  </div>
                  <Link to="/profile" className="dropdown-item" onClick={close}>
                    👤 My Profile
                  </Link>
                  <Link to="/dashboard" className="dropdown-item" onClick={close}>
                    📋 My Bookings
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-nav-login" onClick={close}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
