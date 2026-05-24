import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

// LOCAL dev → http://localhost:5000/api | Production → set VITE_API_URL in .env.production
export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'cleannest_admin_token';   // separate key — avoids conflict with user frontend
const SESSION_KEY = 'cleannest_admin_session';

export async function adminFetch(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  try {
    const res = await fetch(`${API}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error('adminFetch error:', err);
    return { ok: false, status: 0, data: { message: 'Network error. Is the backend running on port 5000?' } };
  }
}

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem(SESSION_KEY));
      return u?.role === 'admin' ? u : null;
    } catch { return null; }
  });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const login = async (email, password) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const { ok, data } = await adminFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!ok) { setLoginError(data.message || 'Login failed.'); return false; }
      if (data.user?.role !== 'admin') { setLoginError('Access denied. Admin accounts only.'); return false; }
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      setAdmin(data.user);
      return true;
    } catch {
      setLoginError('Network error. Is the backend running on port 5000?');
      return false;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, loginError, loginLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
