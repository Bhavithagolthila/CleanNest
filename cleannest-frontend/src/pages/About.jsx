import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="page about-page">
      <div className="page-header">
        <h1>About CleanNest</h1>
        <p>Trusted home cleaning since 2018</p>
      </div>

      <div className="about-grid">
        <div className="about-text">
          <h2>Our Story</h2>
          <p>CleanNest was founded with a simple belief — every home deserves to be clean, and every family deserves peace of mind. We started in 2018 as a small team of 5 professional cleaners, and today we serve thousands of happy homes across 10+ cities.</p>
          <p>We combine skilled professionals, eco-friendly products, and seamless technology to deliver a world-class cleaning experience right to your doorstep.</p>
        </div>
        <div className="about-cards">
          <div className="about-card">
            <div className="about-card-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>To make professional home cleaning accessible, affordable, and trustworthy for every household in India.</p>
          </div>
          <div className="about-card">
            <div className="about-card-icon">🌟</div>
            <h3>Our Vision</h3>
            <p>A clean home in every city, powered by India's most trusted cleaning professionals.</p>
          </div>
          <div className="about-card">
            <div className="about-card-icon">🤝</div>
            <h3>Our Values</h3>
            <p>Trust, transparency, and quality — in every sweep, scrub, and shine we deliver.</p>
          </div>
        </div>
      </div>

      <div className="team-section">
        <h2>What We Offer</h2>
        <div className="services-list">
          {['Full Home Cleaning', 'Bathroom Deep Cleaning', 'Kitchen Cleaning', 'Sofa Cleaning', 'Window Cleaning', 'Full Home Deep Cleaning', 'Mattress Cleaning'].map(s => (
            <div key={s} className="service-pill">✓ {s}</div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => navigate('/services')}>View All Services →</button>
      </div>
    </div>
  );
}
