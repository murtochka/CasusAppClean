# Admin User Setup

## Admin Account Created ✅

**Email:** `admin@example.com`  
**Password:** `SecureAdminPassword123!` (use a strong password)  
**Role:** `admin`  
**Name:** Admin User

---

## How to Use This Account

### 1. On Mobile App
- Open the app
- Tap "Create Account" or "Sign In"
- Enter:
  - Email: `admin@example.com`
  - Password: Use a strong password (minimum 8 chars, numbers, symbols)
  - Select role: **Admin** (or Tourist to also browse activities)
- Tap Sign In ✅

### 2. On Web App
- Visit the frontend at `http://localhost:3000`
- Click Login
- Enter the same credentials above
- Submit ✅

---

## What's Included

✅ **Mock API** - Already has the admin user (immediate use)  
✅ **Database Script** - Created at `my-api-project/src/scripts/create-admin.ts` (for production DB)

---

## Running the Database Script (Optional - for Real DB)

If you have PostgreSQL running and want to add this to your actual database:

```bash
cd /Users/marting/Desktop/CasusApp/my-api-project
npx ts-node src/scripts/create-admin.ts
```

Output will show:
```
✅ Admin user created successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:     admin@example.com
🔑 Password:  Use a strong password (minimum 8 chars, numbers, symbols)
👤 Name:      Admin User
🔐 Role:      admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Quick Start

### 1. Start Backend & Mobile (One Command)
```bash
cd /Users/marting/Desktop/CasusApp
bash restart-all.sh
```

### 2. In the Expo terminal, press `a` for Android emulator

### 3. Login with:
- **Email:** admin@example.com
- **Password:** Use a strong password (minimum 8 chars, numbers, symbols)

### 4. Done! ✅

---

## Admin Capabilities

With this admin account, you can:
- ✅ Log in to both web and mobile
- ✅ View all activities and bookings (admin panel - coming soon)
- ✅ Manage user accounts
- ✅ View analytics and reports
- ✅ Browse activities as a tourist too (multi-role capable)

---

## Testing Other Users

The system also has these pre-configured users ready to test:

### Tourists
- **john@example.com** / `Tourist123!`
- **sarah@example.com** / `Tourist123!`

### Guides
- **marco@guides.com** / `Guide123!`

### (Mock API Only)
- **adt@adt.com** / `123` (traveler role)
- **adb@adb.com** / `123` (business role)

---

**Admin account is ready to use! 🚀**
