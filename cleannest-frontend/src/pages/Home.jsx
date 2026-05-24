import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '💰', title: 'Affordable', desc: 'Best prices with no hidden charges. Transparent billing always.' },
  { icon: '🛡️', title: 'Trusted Pros', desc: 'Background-verified professionals for your safety and peace of mind.' },
  { icon: '⚡', title: 'Fast Service', desc: 'Book today, get service tomorrow. Prompt and reliable every time.' },
  { icon: '♻️', title: 'Eco Friendly', desc: 'We use green, non-toxic cleaning products safe for your family.' },
];

const promises = [
  { icon: '✅', title: 'Verified Cleaners', desc: 'Every professional is background-checked before joining our team.' },
  { icon: '💬', title: 'Real Support', desc: 'We are always reachable. Any issue, we sort it out for you.' },
  { icon: '🔄', title: 'Satisfaction First', desc: 'Not happy with the service? We will make it right — no questions asked.' },
  { icon: '📅', title: 'Flexible Scheduling', desc: 'Book at your convenience. We work around your timetable.' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🚀 Just Launched — Book Your First Clean!</div>
          <h1 className="hero-title">
            Book Trusted<br />
            <span className="highlight">Home Cleaning</span><br />
            Services
          </h1>
          <p className="hero-sub">
            Professional, affordable, and reliable cleaning at your doorstep.<br />
            Book in minutes. Relax in comfort.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate('/services')}>
              Book Now →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card floating">
            <div className="hcard-icon">🏠</div>
            <div>
              <div className="hcard-title">Full Home Cleaning</div>
              <div className="hcard-price">Starting ₹999</div>
            </div>
          </div>
          <div className="hero-card floating-2">
            <div className="hcard-icon">🛡️</div>
            <div>
              <div className="hcard-title">Verified Cleaners</div>
              <div className="hcard-price" style={{ color: '#22c55e' }}>Background Checked</div>
            </div>
          </div>
          <div className="hero-blob"></div>
        </div>
      </section>

      {/* Launch Banner */}
      <section className="launch-banner">
        <div className="launch-inner">
          <div className="launch-text">
            <span className="launch-emoji">🎉</span>
            <div>
              <div className="launch-heading">We Just Launched!</div>
              <div className="launch-sub">CleanNest is brand new. Be among our first customers and help us grow. Your trust means everything to us.</div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => navigate('/services')} style={{ whiteSpace: 'nowrap' }}>
            Be First to Book →
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="section-header">
          <h2>Why Choose CleanNest?</h2>
          <p>We may be new, but our commitment to quality is not.</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Promise */}
      <section className="features" style={{ background: '#f8faff' }}>
        <div className="section-header">
          <h2>Our Promise to You</h2>
          <p>No fake numbers. Just real commitment.</p>
        </div>
        <div className="features-grid">
          {promises.map((p, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <h2>Ready for a Spotless Home?</h2>
        <p>Book your first cleaning today and experience the CleanNest difference.</p>
        <button className="btn-primary" onClick={() => navigate('/services')}>
          Explore Services →
        </button>
      </section>
    </div>
  );
}
