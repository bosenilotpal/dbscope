# Authentication Setup

DBscope uses SQLite database to store user credentials with bcrypt password hashing for secure authentication.

## Default Credentials

After running the database initialization, a default admin user is created:

- **Username**: `admin`
- **Password**: `admin`

**⚠️ Important**: Change the default password after first login!

## Initial Setup

### 1. Initialize the Database

Run the following command to create the default admin user:

```bash
npm run init-db
```

This will:
- Create the users table in SQLite
- Create a default admin user with hashed password
- Display the default credentials

### 2. Start the Application

```bash
npm run dev
```

## Configuration

### Environment Variables

You can optionally configure the JWT secret:

```bash
AUTH_SECRET=your-secret-key-for-jwt-signing
```

Create a `.env.local` file:

```env
AUTH_SECRET=generate-a-long-random-string-here
```

**Important**: 
- Use a strong, random string for `AUTH_SECRET` in production
- Never commit `.env.local` to version control

### Database Location

By default, the SQLite database is stored at `./data/dbscope.db`. You can change this with:

```env
DATABASE_PATH=/path/to/your/database.db
```

## Features

- ✅ SQLite database for user storage
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Session-based authentication with JWT
- ✅ Secure HTTP-only cookies
- ✅ Public home page (no login required)
- ✅ Protected database connection routes (`/connect`, `/viewer`)
- ✅ Automatic redirect to login for protected pages
- ✅ Redirect back to intended page after login
- ✅ Logout functionality
- ✅ 24-hour session duration
- ✅ Multi-user support

## Usage

1. Navigate to `http://localhost:3000`
   - The home page is **public** and accessible without login
   
2. Click "Get Started" or "Connect Now" to access database connections
   - You'll be redirected to `/login` if not authenticated

3. Login with your credentials (default: `admin` / `admin`)

4. You'll be redirected back to the page you were trying to access

5. Click the red "Logout" button in the header to sign out
   - After logout, you can still access the home page
   - Attempting to access `/connect` or `/viewer` will require login again

## Managing Users

### Creating New Users

Use the API endpoint to create new users (requires authentication):

```bash
POST /api/users
Content-Type: application/json

{
  "username": "newuser",
  "password": "securepassword",
  "email": "user@example.com"
}
```

### Listing Users

```bash
GET /api/users
```

Returns all users (without password hashes).

## Security Best Practices

1. **Change Default Password**: Immediately change the admin password after first login
2. **Strong Passwords**: Use strong, unique passwords for all users
3. **Secure Secret**: Use a cryptographically random `AUTH_SECRET` in production
4. **HTTPS**: Always use HTTPS in production to protect session cookies
5. **Regular Backups**: Backup your `dbscope.db` file regularly
6. **User Management**: Remove inactive users and review user access regularly
