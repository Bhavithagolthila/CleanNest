import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('cleannest_token');
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  const data = await res.json();
  return { ok: res.ok, data };
};

export function AppProvider({ children }) {
  const [user, setUser]               = useState(null);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [bookings, setBookings]       = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const [selectedService, setSelectedService] = useState(null);
  const [bookingDetails, setBookingDetails]   = useState(null);
  const [paymentMethod, setPaymentMethod]     = useState('cash');

  // Restore session on page load
  useEffect(() => {
    const token = localStorage.getItem('cleannest_token');
    const saved = localStorage.getItem('cleannest_user');
    if (token && saved) {
      try {
        const u = JSON.parse(saved);
        setUser(u);
        setIsLoggedIn(true);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) fetchMyBookings();
  }, [isLoggedIn]);

  const fetchMyBookings = async () => {
    setLoadingBookings(true);
    try {
      const { ok, data } = await apiFetch('/bookings/my');
      if (ok) setBookings(data.bookings || []);
    } catch {}
    finally { setLoadingBookings(false); }
  };

  const login = async (email, password) => {
    try {
      const { ok, data } = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!ok) return { success: false, error: data.message || 'Login failed.' };
      localStorage.setItem('cleannest_token', data.token);
      localStorage.setItem('cleannest_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsLoggedIn(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Is the backend running on localhost:5000?' };
    }
  };

  const register = async (name, email, password, confirm) => {
    try {
      const { ok, data } = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirm }),
      });
      if (!ok) return { success: false, error: data.message || 'Registration failed.' };
      localStorage.setItem('cleannest_token', data.token);
      localStorage.setItem('cleannest_user', JSON.stringify(data.user));
      setUser(data.user);
      setIsLoggedIn(true);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Is the backend running on localhost:5000?' };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const { ok, data } = await apiFetch('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      if (!ok) return { success: false, error: data.message || 'Could not update profile.' };
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('cleannest_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Is the backend running on localhost:5000?' };
    }
  };

  const logout = () => {
    localStorage.removeItem('cleannest_token');
    localStorage.removeItem('cleannest_user');
    setUser(null);
    setIsLoggedIn(false);
    setBookings([]);
  };

  const addBooking = async (bookingData) => {
    const { ok, data } = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    if (!ok) throw new Error(data.message || 'Could not create booking.');
    await fetchMyBookings();
    return data.booking;
  };

  const cancelBooking = async (id) => {
    const { ok, data } = await apiFetch(`/bookings/${id}/cancel`, { method: 'PATCH' });
    if (!ok) throw new Error(data.message || 'Could not cancel booking.');
    await fetchMyBookings();
    return { refundApplicable: data.refundApplicable };
  };

  return (
    <AppContext.Provider value={{
      selectedService, setSelectedService,
      bookingDetails, setBookingDetails,
      paymentMethod, setPaymentMethod,
      user, isLoggedIn,
      bookings, loadingBookings, fetchMyBookings,
      addBooking, cancelBooking,
      login, register, logout, updateProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
