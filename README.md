# 🏠 CleanNest — Home Cleaning Service Booking Platform

A full-stack home cleaning service booking web app with a user-facing frontend, an admin panel, and a REST API backend.

> **Live Demo**
> | App | URL |
> |---|---|
> | 🌐 Frontend (User App) | [clean-nest-nine.vercel.app](https://clean-nest-nine.vercel.app) |
> | 🛠️ Admin Panel | [clean-nest-m1jd.vercel.app](https://clean-nest-m1jd.vercel.app) |
> | ⚙️ Backend API | [cleannest-3wmv.onrender.com](https://cleannest-3wmv.onrender.com/api/health) |

---

## 📁 Project Structure

```
CleanNest/
├── cleannest-backend/     → Node.js + Express + MongoDB REST API
├── cleannest-frontend/    → React user app (Vite)
└── cleannest-admin/       → React admin panel (Vite)
```

---

## ✨ Features

### 👤 User App
- Register & Login with JWT authentication
- Browse cleaning services (fetched live from DB)
- Book a service — name, address, GPS location, date & time
- Pay via **Cash / UPI / Card** (Razorpay integration)
- View booking history from personal dashboard
- Manage profile

### 🛠️ Admin Panel
- Dashboard with live stats — total bookings, revenue, users
- View & update booking statuses
- Full user management with booking history
- Services management — add, edit, hide/show, delete services (reflects instantly in user app)
- Mark services as **Popular ⭐** or toggle visibility

### ⚙️ Backend API
- RESTful API with Express.js
- MongoDB + Mongoose for data persistence
- JWT-based auth with bcrypt password hashing
- Helmet security headers + rate limiting (100 req / 15 min)
- Nodemailer for email notifications
- Razorpay payment processing

---

## 🚀 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router v6, Axios, Vite |
| Admin Panel | React 18, React Router v6, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcryptjs |
| Payments | Razorpay |
| Email | Nodemailer |
| Security | Helmet, express-rate-limit |
| Deployment | Vercel (frontend + admin), Render (backend) |

---

## 🔑 Default Credentials

**Admin Login** (admin panel):
```
Email:    admin@cleannest.in
Password: admin123
```

**Test User:** Register via the frontend → Register tab.

---

## 🛠️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/cleannest.git
cd cleannest
```

### 2. Backend
```bash
cd cleannest-backend
npm install
cp .env.example .env   # fill in your MongoDB URI, JWT secret, Razorpay keys
npm start              # runs on http://localhost:5000
```

### 3. Frontend (User App)
```bash
cd cleannest-frontend
npm install
npm run dev            # runs on http://localhost:5173
```

### 4. Admin Panel
```bash
cd cleannest-admin
npm install
npm run dev            # runs on http://localhost:5174
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/services` | List all services |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings` | Get user bookings |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/admin/bookings` | Admin — all bookings |
| GET | `/api/admin/users` | Admin — all users |

---

---

## 🔄 User Flow

```
Register → Login → Browse Services → Book → Pay → View in Dashboard
```

Admin Flow:
```
Admin Login → Dashboard → Manage Bookings / Users / Services
```

---

## 🌐 Deployment

- **Frontend & Admin** → Deployed on [Vercel](https://vercel.com) (auto-deploy from Git)
- **Backend** → Deployed on [Render](https://render.com) (Node.js web service)
- **Database** → MongoDB Compass (local dev) → MongoDB Atlas (production)
