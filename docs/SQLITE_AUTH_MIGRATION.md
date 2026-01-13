# SQLite Authentication Migration

## Overview

DBscope now uses SQLite database for user authentication instead of environment variables, providing better security and multi-user support.

## What Changed

### Before
- Credentials stored in environment variables (`AUTH_USERNAME`, `AUTH_PASSWORD`)
- Single user support
- Plain text password comparison

### After
- Credentials stored in SQLite database (`data/dbscope.db`)
- Multi-user support
- Bcrypt password hashing (10 rounds)
- User management API endpoints

## New Features

1. **Secure Password Storage**
   - Passwords are hashed using bcrypt
   - Never stored in plain text
   - Industry-standard security

2. **Multi-User Support**
   - Create multiple users
   - Each user has their own credentials
   - User management via API

3. **Database Persistence**
   - All users stored in SQLite
   - Survives application restarts
   - Easy to backup

## Files Modified

- `src/lib/db/sqlite.ts` - Added users table and management functions
- `src/lib/auth/session.ts` - Updated to use SQLite and bcrypt
- `app/api/auth/login/route.ts` - Updated login logic
- `app/login/page.tsx` - Updated UI messaging
- `docs/AUTHENTICATION.md` - Complete documentation update

## Files Created

- `scripts/init-db.ts` - Database initialization script
- `app/api/users/route.ts` - User management API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
```bash
npm run init-db
```

This creates:
- Users table in SQLite
- Default admin user (username: `admin`, password: `admin`)

### 3. Start Application
```bash
npm run dev
```

### 4. Login
- Navigate to `http://localhost:3000`
- Click "Get Started" or "Connect Now"
- Login with `admin` / `admin`

## API Endpoints

### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "password": "securepassword",
  "email": "user@example.com"
}
```

### List Users
```bash
GET /api/users
```

## Security Improvements

1. ✅ Bcrypt password hashing (10 rounds)
2. ✅ No plain text passwords
3. ✅ Secure password comparison
4. ✅ User active/inactive status
5. ✅ JWT session tokens
6. ✅ HTTP-only cookies

## Migration Notes

- **No breaking changes** for existing users
- Default admin user created automatically
- Environment variables (`AUTH_USERNAME`, `AUTH_PASSWORD`) no longer used
- `AUTH_SECRET` still used for JWT signing (optional)

## Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

## Best Practices

1. **Change Default Password**: Immediately after first login
2. **Backup Database**: Regular backups of `data/dbscope.db`
3. **Strong Passwords**: Enforce strong password policies
4. **User Auditing**: Review user access regularly
5. **HTTPS**: Use HTTPS in production

## Troubleshooting

### "Invalid credentials" error
- Ensure database is initialized: `npm run init-db`
- Check username/password are correct
- Verify user is active in database

### Database not found
- Run `npm run init-db` to create database
- Check `DATABASE_PATH` environment variable
- Ensure `data/` directory exists

### Cannot create user
- Check if username already exists
- Ensure you're authenticated
- Verify database permissions
