import React, { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.message.trim()) e.message = 'Message is required';
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSent(true);
  };

  return (
    <div className="page contact-page">
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Reach out anytime!</p>
      </div>

      <div className="contact-layout">
        <div className="contact-info">
          <div className="contact-item"><span>📧</span><div><strong>Email</strong><p>support@cleannest.in</p></div></div>
          <div className="contact-item"><span>📞</span><div><strong>Phone</strong><p>+91 98765 432102</p></div></div>
          <div className="contact-item"><span>📍</span><div><strong>Address</strong><p>CleanNest HQ, Bangalore, Karnataka 560001</p></div></div>
          <div className="contact-item"><span>⏰</span><div><strong>Hours</strong><p>Mon–Sat, 8 AM – 8 PM</p></div></div>
        </div>

        {sent ? (
          <div className="contact-success">
            <div className="sent-icon">✉️</div>
            <h2>Message Sent Successfully!</h2>
            <p>Thank you for reaching out. Our team will get back to you within 24 hours.</p>
            <button className="btn-primary" onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}>
              Send Another
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Your Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea name="message" value={form.message} onChange={handleChange} placeholder="Write your message here..." rows={5} />
              {errors.message && <span className="error">{errors.message}</span>}
            </div>
            <button type="submit" className="btn-primary btn-full">Send Message →</button>
          </form>
        )}
      </div>
    </div>
  );
}
