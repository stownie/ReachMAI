# Database Update Guide

## Step-by-Step Instructions

### 1. Get Your Render Database Credentials

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your PostgreSQL service
3. In the "Connections" section, copy the connection details:
   - **External Database URL** (for external connections)
   - **Host**, **Database**, **Username**, **Password**, **Port**

### 2. Update Your .env File

Replace the placeholder values in your `.env` file with your actual Render database credentials:

```env
# Replace these with your actual Render PostgreSQL details
DATABASE_URL=postgresql://reachmai_user:YOUR_ACTUAL_PASSWORD@dpg-xxxxx-a.oregon-postgres.render.com:5432/reachmai
DB_HOST=dpg-xxxxx-a.oregon-postgres.render.com
DB_PORT=5432
DB_NAME=reachmai
DB_USER=reachmai_user
DB_PASSWORD=YOUR_ACTUAL_PASSWORD
```

### 3. Test Your Connection

Run the connection test script:
```bash
node scripts/test-db-connection.js
```

This will verify your database connection and show existing tables.

### 4. Update Database Schema

Once connection is confirmed, update your database with the latest schema:
```bash
node scripts/update-schema.js
```

This will apply all the changes from `database/schema.sql` to your Render database.

### 5. Alternative: Direct psql Connection

If you have PostgreSQL client tools installed, you can connect directly:
```bash
psql "postgresql://username:password@hostname:port/database"
```

Then run SQL commands manually:
```sql
-- Check current tables
\dt

-- Apply schema (copy/paste from schema.sql)
-- Or use: \i database/schema.sql

-- Check tables again
\dt

-- Exit
\q
```

## What Information You Need

From your Render Dashboard, get these exact values:
- ✅ **External Database URL** (complete connection string)
- ✅ **Host** (e.g., dpg-xxxxx-a.oregon-postgres.render.com)
- ✅ **Database** (e.g., reachmai)
- ✅ **Username** (e.g., reachmai_user)
- ✅ **Password** (the password you set or was generated)
- ✅ **Port** (usually 5432)

## Troubleshooting

- **Connection refused**: Check if database is running in Render
- **Authentication failed**: Verify username/password
- **Database not found**: Check database name
- **Host not found**: Verify hostname from Render dashboard
- **SSL errors**: Database should accept SSL connections by default

## Security Notes

- ⚠️ Never commit your actual database credentials to Git
- ✅ The `.env` file is in `.gitignore` to prevent accidental commits
- ✅ Use strong passwords in production
- ✅ Consider IP restrictions if available in your Render plan