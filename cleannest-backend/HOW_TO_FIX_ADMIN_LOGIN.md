# 🔧 How to Fix Admin Login

## Root Cause (The Bug)

The bug was in `reset-admin.js` — it was **double-hashing** the password.

Here's what happened:
1. `reset-admin.js` manually called `bcrypt.hash('admin123', 10)` → got a hash string
2. Then called `User.create({ password: hashedString })` 
3. BUT the `User` model's `pre('save')` hook ALSO hashes the password automatically
4. So the already-hashed string got hashed AGAIN
5. Result: password stored in DB = bcrypt(bcrypt('admin123')) — **impossible to match!**

When you then tried to login with `admin123`:
- Backend called `bcrypt.compare('admin123', doubleHashedPassword)`
- This always returns `false` → "Incorrect password" error

## The Fix

Simple: **never manually hash the password before saving through the model**.
The `User` model handles hashing automatically.

## Step-by-Step Fix (Run Once)

### Step 1: Make sure MongoDB is running
```bash
mongod
```

### Step 2: Go to the backend folder
```bash
cd cleannest-backend
```

### Step 3: Run the fix script
```bash
node reset-admin.js
```

You should see:
```
✅ MongoDB connected
🗑  Old admin deleted
✅ Admin account reset successfully!
   Email:    admin@cleannest.in
   Password: admin123
```

### Step 4: Start the backend
```bash
npm start
```

### Step 5: Open the admin panel
Go to `http://localhost:5174` and login with:
- Email: `admin@cleannest.in`
- Password: `admin123`

## Testing with Postman (Optional)

To verify the login API works:

**POST** `http://localhost:5000/api/auth/login`

Body (raw JSON):
```json
{
  "email": "admin@cleannest.in",
  "password": "admin123"
}
```

Expected response:
```json
{
  "success": true,
  "token": "eyJ...",
  "user": {
    "id": "...",
    "email": "admin@cleannest.in",
    "role": "admin"
  }
}
```

If you get `"Incorrect password"` even after running `reset-admin.js`,
check MongoDB Compass → `cleannest` → `users` collection and verify:
- `role` field = `"admin"`
- `password` field starts with `$2a$12$` (bcrypt hash, ~60 chars)

