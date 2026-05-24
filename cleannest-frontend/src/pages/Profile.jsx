import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user, updateProfile, logout, bookings } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
  });

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg,  setProfileMsg]  = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [savingProfile,  setSavingProfile]  = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPw,  setShowCurrentPw]  = useState(false);
  const [showNewPw,      setShowNewPw]      = useState(false);
  const [showConfirmPw,  setShowConfirmPw]  = useState(false);

  const handleProfileSave = async e => {
    e.preventDefault();
    if (!form.name.trim()) {
      setProfileMsg({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }
    setSavingProfile(true);
    setProfileMsg({ text: '', type: '' });
    const result = await updateProfile({ name: form.name.trim() });
    setSavingProfile(false);
    if (result.success) {
      setProfileMsg({ text: '✅ Profile updated successfully!', type: 'success' });
    } else {
      setProfileMsg({ text: result.error, type: 'error' });
    }
  };

  const handlePasswordSave = async e => {
    e.preventDefault();
    if (!pwForm.currentPassword) {
      setPasswordMsg({ text: 'Enter your current password.', type: 'error' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg({ text: '', type: '' });
    const result = await updateProfile({
      currentPassword: pwForm.currentPassword,
      newPassword:     pwForm.newPassword,
    });
    setSavingPassword(false);
    if (result.success) {
      setPasswordMsg({ text: '✅ Password changed successfully!', type: 'success' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordMsg({ text: result.error, type: 'error' });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const totalBookings = bookings?.length || 0;
  const completedBookings = bookings?.filter(b => b.status === 'Completed').length || 0;
  const totalSpent = bookings?.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.price || 0), 0) || 0;

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account details</p>
      </div>

      <div className="profile-layout">

        {/* ── Left: Avatar card ─────────────────────────────── */}
        <div className="profile-sidebar">
          <div className="profile-avatar-card">
            <div className="profile-avatar">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-badge">Customer</div>

            {/* Stats row */}
            <div className="profile-stats">
              <div className="profile-stat">
                <div className="profile-stat-val">{totalBookings}</div>
                <div className="profile-stat-label">Bookings</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">{completedBookings}</div>
                <div className="profile-stat-label">Completed</div>
              </div>
              <div className="profile-stat">
                <div className="profile-stat-val">₹{totalSpent.toLocaleString()}</div>
                <div className="profile-stat-label">Spent</div>
              </div>
            </div>

            <button className="btn-outline" onClick={() => navigate('/dashboard')}>
              📋 My Bookings
            </button>

            <button className="btn-logout-profile" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* ── Right: Forms ──────────────────────────────────── */}
        <div className="profile-forms">

          {/* Personal Details */}
          <div className="profile-section">
            <h2>Personal Details</h2>
            <p className="section-sub">Update your display name</p>

            <form onSubmit={handleProfileSave} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                />
              </div>

              <div className="form-group">
                <label>Email <span className="field-locked">(cannot be changed)</span></label>
                <input type="email" value={user?.email || ''} disabled className="input-disabled" />
              </div>

              {profileMsg.text && (
                <div className={profileMsg.type === 'success' ? 'alert-success' : 'alert-error'}>
                  {profileMsg.text}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="profile-section">
            <h2>Change Password</h2>
            <p className="section-sub">Use a strong password with at least 8 characters</p>

            <form onSubmit={handlePasswordSave} className="profile-form">
              <div className="form-group">
                <label>Current Password</label>
                <div className="pass-wrap">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={pwForm.currentPassword}
                    onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                  <button type="button" className="show-pass" onClick={() => setShowCurrentPw(p => !p)}>
                    {showCurrentPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>New Password</label>
                <div className="pass-wrap">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                  />
                  <button type="button" className="show-pass" onClick={() => setShowNewPw(p => !p)}>
                    {showNewPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="pass-wrap">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                  <button type="button" className="show-pass" onClick={() => setShowConfirmPw(p => !p)}>
                    {showConfirmPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {passwordMsg.text && (
                <div className={passwordMsg.type === 'success' ? 'alert-success' : 'alert-error'}>
                  {passwordMsg.text}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={savingPassword}>
                {savingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
