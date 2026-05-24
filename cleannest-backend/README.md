# CleanNest Backend — Complete Setup Guide (Windows)

## 📁 Folder Structure
```
cleannest-backend/
├── server.js              ← Main entry point
├── .env                   ← Your secret keys (NEVER share this)
├── package.json
├── models/
│   ├── User.js            ← User schema (name, email, password, role)
│   └── Booking.js         ← Booking schema (service, date, payment...)
├── routes/
│   ├── auth.js            ← /api/auth (register, login, me)
│   ├── bookings.js        ← /api/bookings (create, my, cancel)
│   ├── payments.js        ← /api/payments (razorpay order + verify)
│   └── admin.js           ← /api/admin (all bookings, stats, users)
├── middleware/
│   └── auth.js            ← JWT verification middleware
└── controllers/
    └── emailService.js    ← Nodemailer email sender
```

---

## 🔧 STEP 1 — Install MongoDB (local)

1. Go to: https://www.mongodb.com/try/download/community
2. Download **MongoDB Community Server** (Windows, .msi)
3. Install with default settings → check "Install MongoDB as a Service"
4. MongoDB will now auto-start with Windows ✅

**Verify it's running:** Open CMD and type:
```
mongosh
```
You should see a `>` prompt. Type `exit` to quit.

---

## 🔧 STEP 2 — Install Node.js (if not already)

1. Go to: https://nodejs.org
2. Download LTS version → Install
3. Verify: open CMD → `node -v` → should show version number

---

## 🔧 STEP 3 — Setup the Backend

Open **Command Prompt** (search "cmd" in Start):

```cmd
cd C:\path\to\your\cleannest-backend

npm install
```

Wait for it to finish (downloads all packages).

---

## 🔧 STEP 4 — Setup Gmail App Password (for emails)

1. Go to: https://myaccount.google.com
2. Click **Security** (left sidebar)
3. Under "How you sign in to Google" → click **2-Step Verification** → Turn it ON
4. Go back to Security → scroll down → click **App passwords**
5. Select app: **Mail** → Select device: **Windows Computer** → click **Generate**
6. Copy the **16-character password** shown (e.g. `abcd efgh ijkl mnop`)

Now open `.env` file (use Notepad) and fill in:
```
GMAIL_USER=youremail@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

---

## 🔧 STEP 5 — Get Razorpay Test Keys (free)

1. Go to: https://razorpay.com → Sign Up (free, use any phone number)
2. After signup → Dashboard → **Settings** → **API Keys**
3. Click **Generate Test Key** → Copy both Key ID and Key Secret
4. Paste in `.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```
> **Note:** Until you add real keys, backend still works with dummy mode ✅

---

## 🚀 STEP 6 — Run the Backend

```cmd
npm run dev
```

You should see:
```
✅ MongoDB connected: mongodb://localhost:27017/cleannest
✅ Admin account created → admin@cleannest.in / admin123
🚀 CleanNest Backend running!
   Local:  http://localhost:5000
   Health: http://localhost:5000/api/health
```

Open http://localhost:5000/api/health in browser → you'll see:
```json
{ "success": true, "message": "CleanNest API is running! 🏠" }
```

---

## 🔑 Admin Login
```
Email:    admin@cleannest.in
Password: admin123
```
Auto-created on first startup.

---

## 📡 All API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user (protected) |

### Bookings
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/bookings | Create booking (protected) |
| GET | /api/bookings/my | My bookings (protected) |
| PATCH | /api/bookings/:id/cancel | Cancel booking (protected) |

### Payments
| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/payments/create-order | Create Razorpay order |
| POST | /api/payments/verify | Verify payment |

### Admin (admin role only)
| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/admin/stats | Dashboard stats |
| GET | /api/admin/bookings | All bookings |
| PATCH | /api/admin/bookings/:id/status | Update status |
| GET | /api/admin/users | All users |

---

## 🔗 STEP 7 — Connect Frontend to Backend

In your **frontend** `src/context/AppContext.jsx`:
- Replace `localStorage` auth with real API calls
- Save JWT token to localStorage
- Add `Authorization: Bearer <token>` header to requests

> I'll send you the updated frontend that connects to this backend next!

---

## ⚠️ Troubleshooting

**"MongoDB connection failed"**
→ MongoDB service not running. Open Services (Win+R → services.msc) → find MongoDB → Start

**"npm is not recognized"**
→ Node.js not installed. Download from nodejs.org

**"EADDRINUSE port 5000"**
→ Something already using port 5000. Change PORT=5001 in .env

**Email not sending**
→ Check GMAIL_USER and GMAIL_APP_PASSWORD in .env. Make sure 2FA is ON in Google account.
