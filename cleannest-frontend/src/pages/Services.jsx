import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Services() {
  const { setSelectedService } = useApp();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API}/services`);
        const data = await res.json();
        if (data.success) {
          setServices(data.services);
        } else {
          setError('Could not load services. Please try again.');
        }
      } catch {
        setError('Unable to connect to server. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleBook = (service) => {
    setSelectedService(service);
    navigate('/booking');
  };

  if (loading) return (
    <div className="page center-page">
      <div className="empty-state">
        <div className="empty-icon">⏳</div>
        <h2>Loading Services...</h2>
        <p>Fetching available cleaning services</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="page center-page">
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <h2>Could Not Load Services</h2>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="page services-page">
      <div className="page-header">
        <h1>Our Services</h1>
        <p>Professional cleaning solutions tailored to your needs</p>
      </div>
      {services.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧹</div>
          <h2>No Services Available</h2>
          <p>Services will be added soon. Please check back later.</p>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <div className={`service-card ${service.popular ? 'popular' : ''}`} key={service._id}>
              {service.popular && <div className="popular-badge">⭐ Popular</div>}
              <div className="service-icon">{service.icon}</div>
              <h3>{service.name}</h3>
              <p>{service.desc}</p>
              <div className="service-meta">
                <span className="service-duration">⏱ {service.duration}</span>
              </div>
              <div className="service-footer">
                <span className="service-price">₹{service.price.toLocaleString()}</span>
                <button className="btn-primary" onClick={() => handleBook(service)}>
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
