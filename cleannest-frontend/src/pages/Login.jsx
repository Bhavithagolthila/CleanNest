import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { login, register, bookingDetails, isLoggedIn } = useApp();
  const navigate = useNavigate();
  const [tab, setTab]               = useState('login');
  const [form, setForm]             = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]         = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading]       = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate(bookingDetails ? '/payment' : '/');
  }, [isLoggedIn]);

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
    setGlobalError('');
  };

  const validate = () => {
    const e = {};
    if (tab === 'register' && !form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (tab === 'register' && form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (tab === 'register' && form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setGlobalError('');
    try {
      const result = tab === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password, form.confirm);

      if (!result.success) {
        setGlobalError(result.error);
      } else {
        navigate(bookingDetails ? '/payment' : '/');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchTab = t => {
    setTab(t);
    setForm({ name: '', email: '', password: '', confirm: '' });
    setErrors({});
    setGlobalError('');
    setShowPw(false);
    setShowConfirm(false);
  };

  return (
    <div className="page auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">✦</div>
          <h2>{tab === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{tab === 'login' ? 'Login to continue' : 'Register to get started'}</p>
        </div>

        {bookingDetails && (
          <div className="demo-hint">
            🔒 Please login or register to complete your booking.
          </div>
        )}

        <div className="auth-tabs">
          <button type="button" className={tab === 'login'    ? 'tab active' : 'tab'} onClick={() => switchTab('login')}>Login</button>
          <button type="button" className={tab === 'register' ? 'tab active' : 'tab'} onClick={() => switchTab('register')}>Register</button>
        </div>

        {globalError && (
          <div className="alert-error">
            ⚠ {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {tab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" autoComplete="email" />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="pass-wrap">
              <input
                name="password" type={showPw ? 'text' : 'password'} value={form.password}
                onChange={handleChange}
                placeholder={tab === 'register' ? 'Min 8 characters' : 'Enter password'}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" className="show-pass" onClick={() => setShowPw(p => !p)}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className="error">{errors.password}</span>}
            {tab === 'register' && !errors.password && (
              <span className="field-hint">Must be at least 8 characters</span>
            )}
          </div>
          {tab === 'register' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="pass-wrap">
                <input name="confirm" type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={handleChange} placeholder="Re-enter password" autoComplete="new-password" />
                <button type="button" className="show-pass" onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
              {errors.confirm && <span className="error">{errors.confirm}</span>}
            </div>
          )}
          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? 'Please wait...' : (tab === 'login' ? 'Login →' : 'Create Account →')}
          </button>
        </form>

        <p className="auth-switch">
          {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" className="link-btn" onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}>
            {tab === 'login' ? 'Register here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
}
