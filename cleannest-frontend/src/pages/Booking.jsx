import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Booking() {
  const { selectedService, setBookingDetails, isLoggedIn } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', address: '', phone: '', date: '', time: '' });
  const [errors, setErrors] = useState({});

  // idle | loading | success | denied | unavailable | timeout | notsupported | apifail
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError]   = useState('');

  if (!selectedService) {
    return (
      <div className="page center-page">
        <div className="empty-state">
          <div className="empty-icon">🧹</div>
          <h2>No Service Selected</h2>
          <p>Please choose a service first.</p>
          <button className="btn-primary" onClick={() => navigate('/services')}>Browse Services</button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  // ─── LOCATION FEATURE ────────────────────────────────────────────
  //
  // HOW IT WORKS (for interviews):
  //
  //  1. navigator.geolocation.getCurrentPosition()
  //     Built into every modern browser. No npm install needed.
  //     Browser shows a popup: "Allow CleanNest to access your location?"
  //     → Allow  : gives us { latitude, longitude }
  //     → Block  : error.code = 1 (PERMISSION_DENIED)
  //
  //  2. Nominatim Reverse Geocoding (free, no API key)
  //     We send latitude + longitude to OpenStreetMap's free API.
  //     It returns structured address fields like road, suburb, city, postcode, state.
  //     We build a clean readable address from those fields.
  //     URL: https://nominatim.openstreetmap.org/reverse?lat=...&lon=...&format=json
  //
  //  3. We fill the address textarea with that clean string.
  //     User can still edit it if something is wrong.
  //
  // WHY NOT display_name?
  //   Nominatim's display_name is extremely long and messy —
  //   it includes building numbers, municipality codes, country etc.
  //   We manually pick only: road, suburb, city, state, postcode.
  //
  // ERROR CODES from getCurrentPosition:
  //   error.code 1 = PERMISSION_DENIED  → user clicked Block
  //   error.code 2 = POSITION_UNAVAILABLE → device GPS is off / no signal
  //   error.code 3 = TIMEOUT             → took too long to respond
  //
  // NOTE: On localhost (HTTP) this works fine.
  //       On a live server it needs HTTPS (browsers block location on HTTP).
  // ─────────────────────────────────────────────────────────────────

  const handleUseMyLocation = () => {
    // Browser doesn't support geolocation at all (very old browser)
    if (!navigator.geolocation) {
      setLocationStatus('notsupported');
      setLocationError('Your browser does not support location. Please type your address manually.');
      return;
    }

    setLocationStatus('loading');
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      // ── SUCCESS callback ──────────────────────────────────────
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode: coordinates → structured address
          // Nominatim is free, open-source, no API key needed
          // User-Agent header is REQUIRED by Nominatim — without it, requests get blocked
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'Accept-Language': 'en',
                'User-Agent': 'CleanNest/1.0 (contact@cleannest.in)',
              }
            }
          );

          if (!res.ok) {
            throw new Error(`Nominatim HTTP ${res.status}`);
          }

          const data = await res.json();

          if (data && data.address) {
            // BUG FIX: display_name is too long and messy for Indian addresses.
            // Instead, we build a clean address from structured fields.
            const a = data.address;
            const parts = [
              a.house_number,
              a.road || a.pedestrian || a.footway || a.path,
              a.neighbourhood || a.suburb || a.village || a.hamlet || a.quarter,
              a.city || a.town || a.municipality || a.county,
              a.state_district,
              a.state,
              a.postcode,
            ].filter(Boolean); // removes undefined / empty

            const cleanAddress = parts.length > 0
              ? parts.join(', ')
              : data.display_name; // fallback if all structured fields are empty

            setForm(prev => ({ ...prev, address: cleanAddress }));
            setLocationStatus('success');
          } else {
            // Nominatim gave no address — fall back to raw coordinates
            setForm(prev => ({ ...prev, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
            setLocationStatus('apifail');
            setLocationError('Could not convert GPS to address. Raw coordinates filled — please edit to your full address.');
          }

        } catch (fetchErr) {
          // Network error reaching Nominatim
          setForm(prev => ({ ...prev, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
          setLocationStatus('apifail');
          setLocationError(
            'GPS worked but address lookup failed (check internet). Raw coordinates filled — please replace with your full address.'
          );
        }
      },

      // ── ERROR callback ────────────────────────────────────────
      (err) => {
        if (err.code === 1) {
          setLocationStatus('denied');
          setLocationError(
            'Location access was blocked. To fix: click the 🔒 icon in the address bar → Allow location. Or just type your address below.'
          );
        } else if (err.code === 2) {
          setLocationStatus('unavailable');
          setLocationError(
            'Could not detect your location. Make sure Location is ON in your device settings, then try again.'
          );
        } else if (err.code === 3) {
          setLocationStatus('timeout');
          setLocationError('Location request timed out. Move to an open area with better signal and try again.');
        } else {
          setLocationStatus('unavailable');
          setLocationError('Location detection failed. Please type your address manually.');
        }
      },

      // ── Options ───────────────────────────────────────────────
      {
        enableHighAccuracy: true,  // use GPS chip if available
        timeout: 15000,            // wait up to 15 seconds
        maximumAge: 120000,        // accept cached location up to 2 min old
      }
    );
  };

  // ── Button label based on status ────────────────────────────────
  const locationBtnLabel = () => {
    switch (locationStatus) {
      case 'loading':     return '⏳ Detecting...';
      case 'success':     return '✅ Location Found';
      case 'denied':      return '🚫 Blocked — Try Again';
      case 'unavailable': return '📡 Unavailable — Try Again';
      case 'timeout':     return '⏱ Timed Out — Try Again';
      case 'apifail':     return '⚠️ Partial — Try Again';
      case 'notsupported':return '❌ Not Supported';
      default:            return '📍 Use My Location';
    }
  };

  // ── Hint box colour ─────────────────────────────────────────────
  const hintClass = () => {
    if (locationStatus === 'success') return 'location-hint location-ok';
    return 'location-hint location-error';
  };

  // ────────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.address.trim()) e.address = 'Address is required';
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!form.date) e.date = 'Date is required';
    else if (form.date < today) e.date = 'Date cannot be in the past';
    if (!form.time) e.time = 'Time is required';
    return e;
  };

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setBookingDetails(form);
    navigate(isLoggedIn ? '/payment' : '/login');
  };

  return (
    <div className="page booking-page">
      <div className="page-header">
        <h1>Book Your Cleaning</h1>
        <p>Fill in the details to schedule your service</p>
      </div>

      <div className="booking-layout">
        {/* Service Summary */}
        <div className="booking-summary">
          <div className="summary-card">
            <h3>Selected Service</h3>
            <div className="summary-service">
              <span className="sum-icon">{selectedService.icon}</span>
              <div>
                <div className="sum-name">{selectedService.name}</div>
                <div className="sum-price">₹{selectedService.price.toLocaleString()}</div>
              </div>
            </div>
            <div className="summary-info">
              <div className="info-row"><span>Duration</span><span>{selectedService.duration}</span></div>
              <div className="info-row"><span>Professionals</span><span>2 cleaners</span></div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form className="booking-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          {/* ── Address + GPS Button ────────────────────────── */}
          <div className="form-group">
            <div className="address-label-row">
              <label>Address</label>
              <button
                type="button"
                className={`location-btn ${locationStatus}`}
                onClick={handleUseMyLocation}
                disabled={locationStatus === 'loading' || locationStatus === 'notsupported'}
              >
                {locationBtnLabel()}
              </button>
            </div>

            <textarea
              name="address"
              value={form.address}
              onChange={e => {
                handleChange(e);
                if (locationStatus !== 'idle') setLocationStatus('idle');
              }}
              placeholder="Type your address, or click '📍 Use My Location' above"
              rows={3}
            />

            {locationStatus !== 'idle' && locationStatus !== 'loading' && (
              <span className={hintClass()}>
                {locationStatus === 'success'
                  ? '✅ Address filled from GPS. You can edit it if needed.'
                  : locationError}
              </span>
            )}

            {errors.address && <span className="error">{errors.address}</span>}
          </div>
          {/* ─────────────────────────────────────────────────── */}

          <div className="form-group">
            <label>Phone Number</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10} />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={form.date} min={today} onChange={handleChange} />
              {errors.date && <span className="error">{errors.date}</span>}
            </div>
            <div className="form-group">
              <label>Time</label>
              <select name="time" value={form.time} onChange={handleChange}>
                <option value="">Select time</option>
                {['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.time && <span className="error">{errors.time}</span>}
            </div>
          </div>

          <button type="submit" className="btn-primary btn-full">Continue →</button>
          {!isLoggedIn && (
            <p className="login-hint">⚠ You'll be asked to login / register before payment</p>
          )}
        </form>
      </div>
    </div>
  );
}
