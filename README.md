# 🏠 CleanNest Portal

A full-stack home cleaning service booking platform built with Node.js, Express, MongoDB, and React.

## 🌐 Live Demo

| App | URL |
|-----|-----|
| 👤 User App | [clean-nest-phi.vercel.app](https://clean-nest-phi.vercel.app) |
| 🛠️ Admin Panel | [clean-nest-a1sb.vercel.app](https://clean-nest-a1sb.vercel.app) |
| ⚙️ Backend API | [cleannest-sfcj.onrender.com](https://cleannest-sfcj.onrender.com) — [/api/health](https://cleannest-sfcj.onrender.com/api/health) |


---

## 📁 Project Structure

```
CleanNest-portal/
├── cleannest-backend/    → Node.js + Express + MongoDB API
├── cleannest-frontend/   → React user-facing app (Vite)
└── cleannest-admin/      → React admin panel (Vite)
```

---

## 🚀 Quick Start (Local)

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

---

## 🔐 Default Credentials

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | admin@cleannest.in     | Admin@123  |
| User  | Register via frontend  | —          |

---

## ✨ Key Features

### 👤 User App

- Register / Login (password min 8 characters)
- Browse services (fetched from database, managed by admin)
- Book a service with GPS location detection
- Payment options: Cash / UPI / Card
- Dashboard with booking history
- Profile management

### 🛠️ Admin Panel

- Dashboard with stats (bookings, revenue, users)
- Manage all bookings and update status
- View users and their booking history
- **Services Management** — Add, edit, hide/show, delete services
  *(changes reflect instantly in the user app)*

---

## 🔄 User Flow

```
Register → Login → Browse Services → Book → Pay → View in Dashboard
```

1. User registers with name, email, and password (8+ characters)
2. After login, browse the Services page
3. Select a service → fill booking form (name, address, phone, date, time)
4. Proceed to payment → booking confirmed
5. View booking history in Dashboard

---

## ⚙️ Admin: Managing Services

1. Login to admin panel → click **Services** in the sidebar
2. Click **+ Add Service** to create a new service
3. Fill in: name, price, duration, description, icon
4. Toggle **Active** to show/hide the service from users
5. Mark **Popular** to highlight with a ⭐ badge
6. Edit or delete existing services anytime

---

## 🗄️ Database

| Detail       | Value                 |
|--------------|-----------------------|
| Database     | MongoDB Atlas (Cloud) |
| GUI Tool     | MongoDB Compass       |
| Collections  | `users`, `bookings`, `services` |

---

## 🧰 Tech Stack

| Layer    | Technology                    | Hosting    |
|----------|-------------------------------|------------|
| Backend  | Node.js, Express.js, MongoDB  | Render     |
| Frontend | React, Vite                   | Vercel     |
| Admin    | React, Vite                   | Vercel     |
| Database | MongoDB Atlas                 | GCP Mumbai |

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/services` | Get all services |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get user bookings |
| GET | `/api/admin/dashboard` | Admin stats |

---

> Built with ❤️ — CleanNest makes home cleaning simple and seamless.
