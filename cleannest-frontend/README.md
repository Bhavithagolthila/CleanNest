# CleanNest – Frontend (Phase 1 Complete)

## ✅ What's Fixed & Improved

### Auth (Login/Register)
- Real validation — empty fields, invalid email, short password, password mismatch
- Clear error messages shown under each field
- Bookings persist across page refresh (localStorage)
- Login sessions persist across refresh (no logout on F5)
- Proper redirect: if you came from booking → goes to payment after login

### Payment
- Card number, expiry, CVV validation
- UPI ID format validation
- Auto-format card number (spaces every 4 digits)
- Auto-format expiry (MM / YY)
- Loading spinner while "processing"

### Dashboard
- Shows only YOUR bookings (filtered by email)
- Cancel booking button (Confirmed bookings only)
- Status shown in color (Confirmed=green, Cancelled=red, etc.)

### Admin Panel (NEW — /admin route)
- See ALL bookings from all users
- Stats: Total, Confirmed, Completed, Cancelled, Revenue
- Search by service, email, or address
- Filter by status
- Change booking status from dropdown
- Protected route — only admin role can access

### App-wide
- 404 → redirects to home
- If logged in and go to /login → redirects away
- Bookings saved to localStorage (survive refresh)

---

## 🚀 Setup & Run

```bash
npm install
npm run dev
```
Open: http://localhost:5173

---

## 👤 Creating Admin Account

1. Run the app: `npm run dev`
2. Open browser at http://localhost:5173
3. Press **F12** → go to **Console** tab
4. Paste and run this:

```js
const users = JSON.parse(localStorage.getItem('cleannest_users') || '[]');
users.push({ name: 'Admin', email: 'admin@cleannest.in', password: 'admin123', role: 'admin' });
localStorage.setItem('cleannest_users', JSON.stringify(users));
console.log('Done! Login with admin@cleannest.in / admin123');
```

5. Login with `admin@cleannest.in` / `admin123`
6. You'll see **🛡 Admin** in the navbar → click it

---

## 📁 Folder Structure

```
cleannest/
├── src/
│   ├── context/
│   │   └── AppContext.jsx       ← State, localStorage, auth logic
│   ├── components/
│   │   └── Navbar.jsx           ← With admin link
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Services.jsx
│   │   ├── Booking.jsx
│   │   ├── Login.jsx            ← Fixed with real validation
│   │   ├── Payment.jsx          ← Fixed with card/UPI validation
│   │   ├── Success.jsx
│   │   ├── Dashboard.jsx        ← With cancel booking
│   │   ├── AdminPanel.jsx       ← NEW — admin only
│   │   ├── About.jsx
│   │   └── Contact.jsx
│   ├── App.jsx                  ← Protected routes added
│   ├── main.jsx
│   └── styles.css               ← Admin styles added
├── index.html
├── package.json
├── vite.config.js
└── CREATE_ADMIN.js              ← Instructions to seed admin

```

---

## 🔜 Phase 2 — Backend (Coming Next)

Will include:
- Node.js + Express server
- MongoDB Atlas (cloud DB)
- Real JWT auth (HTTP-only cookies)
- Razorpay payment integration
- Nodemailer (email confirmations)
- Admin API routes
- All commands to run

---

## Demo Flow

1. Go to `/services` → pick a service → click Book Now
2. Fill booking form → Continue
3. If not logged in → goes to Login → Register
4. After login → goes to Payment → fill card/UPI → Pay Now
5. Success page → Go to Dashboard
6. Admin: login as admin → click 🛡 Admin in navbar
