# Supabase Database Setup Guide
## Free PostgreSQL Database in the Cloud

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Supabase Account

1. **Go to:** https://supabase.com
2. **Click:** "Start your project" or "Sign Up"
3. **Sign up** with GitHub, Google, or Email
4. **Verify your email** (check inbox)

---

### Step 2: Create New Project

1. **Click:** "New Project" button
2. **Fill in:**
   - **Project Name:** `casino-platform` (or any name)
   - **Database Password:** Create a strong password
     - Save this password! You'll need it
     - Minimum 12 characters
     - Mix of letters, numbers, symbols
   - **Region:** Choose closest to you
     - US East, US West, EU West, etc.
   - **Pricing Plan:** Free tier is enough to start
3. **Click:** "Create new project"
4. **Wait 2-3 minutes** for project to initialize

---

### Step 3: Get Database Credentials

Once project is ready:

1. **Go to:** Project Settings (gear icon ⚙️ in left sidebar)
2. **Click:** "Database" in settings menu
3. **Scroll down** to "Connection string" section

You'll see different connection options. We need:

#### **Option A: Connection Pooling (Recommended for Apps)**

**Look for:** "Connection string" → "Transaction mode"

```
postgresql://postgres:[YOUR-PASSWORD]@[HOST]:6543/postgres?pgbouncer=true
```

#### **Option B: Direct Connection (For Migrations/Admin)**

**Look for:** "Connection string" → "Session mode"

```
postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres
```

---

### Step 4: Copy Your Credentials

**From Supabase Dashboard, copy these values:**

1. **Host/URL:** 
   - Example: `db.xxxxxxxxxxxxx.supabase.co`
   - Found in connection string after `@` and before `:`

2. **Port:**
   - For pooling: `6543`
   - For direct: `5432`

3. **Database Name:**
   - Usually: `postgres`

4. **User:**
   - Usually: `postgres`

5. **Password:**
   - The password you created in Step 2

6. **Connection String (Alternative):**
   - You can also use the full connection string
   - Supabase provides it ready to use

---

## 📋 What to Copy to Your Config

### Method 1: Individual Values

```bash
DB_HOST = db.xxxxxxxxxxxxx.supabase.co
DB_PORT = 6543  (for pooling) or 5432 (for direct)
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = YourPasswordFromStep2
```

### Method 2: Connection String (Easier)

Supabase provides a ready-to-use connection string. You can use it directly:

```bash
# Copy the full connection string from Supabase
DATABASE_URL = postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
```

---

## 🎯 Visual Guide to Find Credentials

### In Supabase Dashboard:

```
Left Sidebar:
  ⚙️ Settings (gear icon)
    → Database
      → Connection string section
        → Transaction mode (for pooling)
        → Session mode (for direct)
```

### Connection String Looks Like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:6543/postgres?pgbouncer=true
                     ↑              ↑                                    ↑
                  Password       Host                              Port
```

---

## ✅ Fill in Your Checklist

Copy these values to `SETUP_CHECKLIST.md`:

```
DB_HOST = db.________________________________________.supabase.co
DB_PORT = 6543  (or 5432 for direct connection)
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = ________________________________________
```

**OR use full connection string:**

```
DATABASE_URL = postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
```

---

## 🔒 Security Settings

### Enable SSL (Required for Supabase)

In your config file, make sure SSL is enabled:

```bash
DB_SSL = true
```

Supabase requires SSL connections.

---

## 🧪 Test Your Connection

### Using Node.js/TypeScript:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  host: 'db.xxxxx.supabase.co',
  port: 6543,
  database: 'postgres',
  user: 'postgres',
  password: 'your-password',
  ssl: { rejectUnauthorized: false }
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection failed:', err);
  } else {
    console.log('Connected! Time:', res.rows[0].now);
  }
});
```

### Using psql (Command Line):

```bash
psql "postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres"
```

---

## 📊 Free Tier Limits

Supabase Free Tier includes:
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth
- ✅ Unlimited API requests
- ✅ More than enough to start!

**Upgrade when you need:**
- More storage
- More bandwidth
- Better performance

---

## 🔧 Connection Pooling vs Direct

### Use Connection Pooling (Port 6543)
- ✅ Better for production apps
- ✅ Handles many connections efficiently
- ✅ Recommended by Supabase
- ✅ Use for your application

### Use Direct Connection (Port 5432)
- ✅ For database migrations
- ✅ For admin tools
- ✅ For debugging
- ❌ Don't use for production app

**Recommendation:** Use pooling (port 6543) for your app.

---

## 📝 Complete Example Config

```bash
# Database Configuration (Supabase)
DB_HOST=db.abcdefghijklmnop.supabase.co
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_strong_password_here
DB_SSL=true

# OR use connection string directly:
# DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
```

---

## ✅ Checklist

- [ ] Supabase account created
- [ ] New project created
- [ ] Database password saved securely
- [ ] Connection string copied
- [ ] Host, port, user, password noted
- [ ] SSL enabled in config
- [ ] Connection tested successfully

---

## 🆘 Troubleshooting

### "Connection refused"
- Check host is correct (no `https://` prefix)
- Verify port: 6543 for pooling, 5432 for direct
- Check firewall isn't blocking connection

### "Password authentication failed"
- Verify password is correct (no extra spaces)
- Check you're using `postgres` as user
- Try resetting password in Supabase dashboard

### "SSL required"
- Make sure `DB_SSL=true` in config
- For Node.js, use: `ssl: { rejectUnauthorized: false }`

### "Cannot connect to database"
- Check Supabase project is active (not paused)
- Verify project region matches
- Try direct connection (port 5432) to test

### "Too many connections"
- Use connection pooling (port 6543)
- Implement connection pooling in your app
- Close connections properly

---

## 🔐 Security Reminders

- ✅ Never commit database password to git
- ✅ Use environment variables
- ✅ Enable SSL connections
- ✅ Use connection pooling for production
- ✅ Rotate password regularly
- ✅ Use strong password (12+ characters)

---

## 🎉 You're Done!

Once you have:
- ✅ Host
- ✅ Port
- ✅ Database name
- ✅ Username
- ✅ Password

Copy them to your `config.minimal.env` or `.env.local` file!

---

**Need help?** Check Supabase docs: https://supabase.com/docs/guides/database

