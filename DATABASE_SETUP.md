# Database Setup Guide

This guide explains how to set up PostgreSQL database for ReachMAI on Render.

## 🗄️ Database Setup on Render

### Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Fill in the details:
   - **Name**: `reachmai-db`
   - **Database**: `reachmai`
   - **User**: `reachmai_user`
   - **Region**: Choose same as your web service
   - **PostgreSQL Version**: 15 (latest)
   - **Plan**: Free (for development) or Starter $7/month (recommended)

4. Click "Create Database"

### Step 2: Get Database Connection Details

After creation, you'll see:
- **Internal Database URL**: `postgresql://reachmai_user:password@dpg-xxxxx-a.oregon-postgres.render.com/reachmai`
- **External Database URL**: Similar, but accessible from outside Render

Copy the **Internal Database URL** - this is what you'll use for your web service.

### Step 3: Set Environment Variable

1. Go to your ReachMAI web service settings
2. Go to "Environment" tab
3. Add environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: [Your Internal Database URL from Step 2]
4. Add JWT secret:
   - **Key**: `JWT_SECRET`
   - **Value**: `your-super-secret-jwt-key-generate-a-random-string`

### Step 4: Initialize Database Schema

You have two options to set up the database schema:

#### Option A: Use Render Shell (Recommended)

1. Go to your database in Render dashboard
2. Click "Connect" → "PSQL"
3. Copy and paste the contents of `database/schema.sql`
4. Copy and paste the contents of `database/sample_data.sql`

#### Option B: Use Local PostgreSQL Client

1. Install PostgreSQL client locally (psql)
2. Connect using External Database URL:
   ```bash
   psql "postgresql://reachmai_user:password@dpg-xxxxx-a.oregon-postgres.render.com/reachmai?sslmode=require"
   ```
3. Run the schema:
   ```sql
   \i database/schema.sql
   \i database/sample_data.sql
   ```

### Step 5: Deploy Updated Web Service

Your web service will automatically redeploy with the new database connection. Check the logs to ensure:
- ✅ Database connection successful
- ✅ API endpoints available at /api/*

## 🔧 Local Development Setup

For local development, you can use either:

### Option 1: Local PostgreSQL

1. Install PostgreSQL locally
2. Create database:
   ```sql
   CREATE DATABASE reachmai;
   CREATE USER reachmai_user WITH PASSWORD 'localpassword';
   GRANT ALL PRIVILEGES ON DATABASE reachmai TO reachmai_user;
   ```
3. Set environment variable:
   ```bash
   DATABASE_URL=postgresql://reachmai_user:localpassword@localhost:5432/reachmai
   ```

### Option 2: Connect to Render Database

Use the External Database URL from Render:
```bash
DATABASE_URL=postgresql://reachmai_user:password@dpg-xxxxx-a.oregon-postgres.render.com/reachmai
```

## 📊 Database Schema Overview

The database includes these main tables:

- **auth_accounts**: User authentication (email/password)
- **user_profiles**: Multiple profiles per account (student/parent/teacher/adult)
- **organizations**: Schools and educational institutions
- **programs**: Educational programs/courses
- **classes**: Specific class sessions
- **enrollments**: Student enrollments in classes
- **assignments**: Homework and projects
- **assignment_submissions**: Student submissions
- **attendance_records**: Class attendance tracking
- **invoices** & **payments**: Billing system
- **payroll_records**: Teacher payroll
- **notifications**: In-app notifications
- **messages**: Internal messaging system

## 🔐 Sample Data

The sample data includes:
- **Test Account**: `johnson.family@email.com` / `password123`
  - Student profile: Emma Johnson
  - Parent profile: Sarah Johnson
- **Teacher Account**: `teacher.smith@email.com` / `password123`
  - Teacher profile: Michael Smith
- **Sample Classes**: Math and Writing programs
- **Sample Assignments** and **Attendance Records**

## 🚀 API Endpoints

Once deployed, your API will be available at:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/profiles` - Get user profiles
- `GET /api/classes` - Get classes for profile
- `GET /api/assignments` - Get assignments
- `GET /api/attendance` - Get attendance records
- `GET /api/billing` - Get billing information
- `GET /api/notifications` - Get notifications
- `GET /api/health` - Health check

## 🔍 Testing the Database

After setup, you can test the database connection:

1. Visit your deployed app
2. Check browser console for any API errors
3. Test the health endpoint: `https://your-app.onrender.com/api/health`
4. Try logging in with sample account: `johnson.family@email.com` / `password123`

## 🐛 Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is set correctly in environment variables
- Check that Internal Database URL is used (not External)
- Ensure database is in same region as web service

### Authentication Issues
- Verify JWT_SECRET is set in environment variables
- Check that passwords are properly hashed in database

### API Issues
- Check server logs for detailed error messages
- Verify all dependencies are installed
- Test health endpoint first

## 📈 Next Steps

After database setup:
1. ✅ Database and API are working
2. 🔄 Update frontend to use real APIs instead of mock data
3. 🎨 Implement user authentication UI
4. 📱 Test mobile features with real data
5. 🔔 Set up email notifications (optional)

Your ReachMAI platform will now have full database functionality! 🎉