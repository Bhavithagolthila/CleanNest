# CleanNest Portal

A full-stack home cleaning service booking platform.

## Project Structure

```
CleanNest-portal/
├── cleannest-backend/    → Node.js + Express + MongoDB API
├── cleannest-frontend/   → React user-facing app (Vite)
└── cleannest-admin/      → React admin panel (Vite)
```

## Quick Start

### 1. Backend
```bash
cd cleannest-backend
npm install
# Make sure MongoDB is running (mongod)
npm start
```

### 2. Frontend (User App)
```bash
cd cleannest-frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

### 3. Admin Panel
```bash
cd cleannest-admin
npm install
npm run dev
# Runs at http://localhost:5174
```

## Default Credentials

**Admin Login:**
- Email: `admin@cleannest.in`
- Password: `admin@123`

**Test User:** Register via the frontend Register tab.

## Key Features

### User App
- Register / Login (password min 8 characters)
- Browse services (fetched from database, managed by admin)
- Book a service with GPS location detection
- Payment (Cash/UPI/Card)
- Dashboard with booking history
- Profile management

### Admin Panel
- Dashboard with stats (bookings, revenue, users)
- Manage all bookings and update status
- View users and their booking history
- **Services Management** — Add, edit, hide/show, delete services
  (changes reflect instantly in the user app)

## Flow: Register → Login → Book → Pay

1. User registers with name, email, password (8+ chars)
2. After login, browse Services page
3. Select a service → fill booking form (name, address, phone, date, time)
4. Proceed to payment → booking confirmed
5. View in Dashboard

## Admin: Managing Services

1. Login to admin panel → click **Services** in sidebar
2. Click **+ Add Service** to create a new service
3. Fill name, price, duration, description, icon
4. Toggle **Active** to show/hide from users
5. Mark **Popular** to highlight with ⭐ badge
6. Edit or delete existing services anytime
