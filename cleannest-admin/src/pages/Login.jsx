import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';

export default function Login() {
  const { login, loginError, loginLoading } = useAdmin();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-brand">
          <div className="login-logo">CN</div>
          <div className="login-brand-text">CleanNest</div>
        </div>
        <div className="login-tagline">
          <h1>Admin<br />Dashboard</h1>
          <p>Manage bookings, track revenue, and oversee all customer activity from one place.</p>
        </div>
        <div className="login-stats-row">
          <div className="login-stat">
            <div className="ls-num">100%</div>
            <div className="ls-label">MongoDB Live</div>
          </div>
          <div className="login-stat">
            <div className="ls-num">∞</div>
            <div className="ls-label">Bookings Tracked</div>
          </div>
          <div className="login-stat">
            <div className="ls-num">✓</div>
            <div className="ls-label">Razorpay Linked</div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <h2>Sign in</h2>
            <p>Admin access only</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="field-group">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@cleannest.in"
                required
                autoFocus
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <div className="pass-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="show-pass" onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="login-error">⚠ {loginError}</div>
            )}

            <button type="submit" className="login-btn" disabled={loginLoading}>
              {loginLoading ? (
                <span className="spinner-inline">Signing in...</span>
              ) : 'Sign in →'}
            </button>
          </form>

          <div className="login-hint">
            Default credentials: <strong>admin@cleannest.in</strong> / <strong>admin123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
