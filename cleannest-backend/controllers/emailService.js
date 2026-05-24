const nodemailer = require('nodemailer');

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL SERVICE — Booking Confirmation
// ─────────────────────────────────────────────────────────────────────────────
//
// HOW IT WORKS (for interviews):
//
//  Gmail blocks normal password login for apps.
//  You must use a Gmail "App Password" (16 chars, no spaces):
//    1. Go to myaccount.google.com → Security → 2-Step Verification (enable it)
//    2. Then → App passwords → Select app: Mail → Generate
//    3. Copy the 16-char password → paste into GMAIL_APP_PASSWORD in .env
//
//  GMAIL_USER=cleannest50@gmail.com
//  GMAIL_APP_PASSWORD=armgpvcxtqcdpzph   ← 16 chars, no spaces
//
// WHY EMAIL MIGHT FAIL:
//   1. App Password not set up correctly in Gmail account
//   2. 2-Step Verification not enabled (required for App Passwords)
//   3. Wrong GMAIL_USER or GMAIL_APP_PASSWORD in .env
//   4. Gmail account is new / suspicious → Google blocks it temporarily
//
// NOTE: Email failure does NOT crash the booking — we return false and log the error.
// ─────────────────────────────────────────────────────────────────────────────

const createTransporter = () => {
  // Validate env vars before trying
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('❌ Email config missing: set GMAIL_USER and GMAIL_APP_PASSWORD in .env');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,  // 16-char App Password, no spaces
    },
  });
};

// Send booking confirmation email to customer
const sendBookingConfirmation = async (booking, userEmail, userName) => {
  try {
    const transporter = createTransporter();

    // If env vars missing, skip silently
    if (!transporter) return false;

    // Verify SMTP connection before sending (catches wrong password early)
    await transporter.verify();

    const methodLabels = {
      cash: '💵 Cash on Arrival',
      upi: '📱 UPI',
      card: '💳 Card',
      razorpay: '💳 Online (Razorpay)'
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb, #0ea5e9); padding: 32px 32px 24px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 800; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; }
    .check { font-size: 48px; margin-bottom: 12px; display: block; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; color: #374151; margin-bottom: 20px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .card h3 { margin: 0 0 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .row:last-child { border-bottom: none; }
    .row .label { color: #64748b; }
    .row .value { font-weight: 600; color: #0f172a; text-align: right; max-width: 60%; }
    .total-row { background: #eff6ff; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; margin-top: 16px; }
    .total-label { font-weight: 700; color: #1e40af; }
    .total-value { font-size: 20px; font-weight: 800; color: #2563eb; }
    .footer { background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { font-size: 12px; color: #94a3b8; margin: 4px 0; }
    .footer a { color: #2563eb; text-decoration: none; }
    .tip { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-top: 16px; font-size: 13px; color: #166534; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="check">✅</span>
      <h1>Booking Confirmed!</h1>
      <p>CleanNest — Professional Home Cleaning</p>
    </div>
    <div class="body">
      <p class="greeting">Hi <strong>${userName}</strong>, your booking is confirmed! Here are the details:</p>

      <div class="card">
        <h3>📋 Booking Details</h3>
        <div class="row"><span class="label">Service</span><span class="value">${booking.icon} ${booking.service}</span></div>
        <div class="row"><span class="label">Date</span><span class="value">📅 ${booking.date}</span></div>
        <div class="row"><span class="label">Time</span><span class="value">⏰ ${booking.time}</span></div>
        <div class="row"><span class="label">Address</span><span class="value">📍 ${booking.address}</span></div>
        <div class="row"><span class="label">Phone</span><span class="value">📞 ${booking.phone}</span></div>
        <div class="row"><span class="label">Payment</span><span class="value">${methodLabels[booking.paymentMethod] || booking.paymentMethod}</span></div>
      </div>

      <div class="total-row">
        <span class="total-label">Total Amount</span>
        <span class="total-value">₹${booking.price.toLocaleString('en-IN')}</span>
      </div>

      <div class="tip">
        💡 <strong>What's next?</strong> Our team will arrive at your address on the scheduled date. Keep your phone handy — the cleaner will call you 30 minutes before arrival.
      </div>
    </div>
    <div class="footer">
      <p>Questions? Email us at <a href="mailto:support@cleannest.in">support@cleannest.in</a> or call <a href="tel:+919876543210">+91 98765 43210</a></p>
      <p style="margin-top:8px;">© 2024 CleanNest. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;

    await transporter.sendMail({
      from: `"CleanNest 🏠" <${process.env.GMAIL_USER}>`,
      to: userEmail,
      subject: `✅ Booking Confirmed — ${booking.service} on ${booking.date}`,
      html,
    });

    console.log(`✅ Confirmation email sent to ${userEmail}`);
    return true;

  } catch (err) {
    // Log the FULL error so you can debug it in terminal
    console.error('❌ Email send failed!');
    console.error('   Reason:', err.message);

    // Common causes and hints:
    if (err.message.includes('Invalid login') || err.message.includes('Username and Password')) {
      console.error('   FIX: Wrong Gmail App Password. Go to myaccount.google.com → Security → App Passwords and regenerate.');
    } else if (err.message.includes('ECONNREFUSED') || err.message.includes('ETIMEDOUT')) {
      console.error('   FIX: Cannot reach Gmail SMTP. Check your internet connection.');
    } else if (err.message.includes('self signed') || err.message.includes('certificate')) {
      console.error('   FIX: SSL/TLS issue. Try setting rejectUnauthorized: false in tls options.');
    }

    return false; // Don't crash the app if email fails
  }
};

module.exports = { sendBookingConfirmation };
