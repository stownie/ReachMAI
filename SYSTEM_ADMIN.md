# System Administrator Guide

## Overview

The ReachMAI platform includes a secure system administrator interface that provides full platform oversight and control. This interface uses environment variable-based authentication and is separate from the regular user authentication system.

## Accessing System Admin

### URL
```
https://your-domain.com/systemadmin
```

For development:
```
http://localhost:5173/systemadmin
```

### Default Credentials
- **Username**: `systemadmin`
- **Password**: `SecurePassword123!`

⚠️ **Important**: Change these credentials in production!

## Setting Up Credentials

### Development Environment

1. Create or update the `.env` file in your project root:
```env
VITE_SYSTEM_ADMIN_USERNAME=systemadmin
VITE_SYSTEM_ADMIN_PASSWORD=SecurePassword123!
```

### Production Environment (Render.com)

1. In your Render dashboard, go to your web service
2. Navigate to the "Environment" tab
3. Add the following environment variables:
   - `VITE_SYSTEM_ADMIN_USERNAME`: Your chosen username
   - `VITE_SYSTEM_ADMIN_PASSWORD`: Your secure password

### Other Hosting Platforms

Set the following environment variables in your hosting platform:
- `VITE_SYSTEM_ADMIN_USERNAME`
- `VITE_SYSTEM_ADMIN_PASSWORD`

## Security Features

### Authentication
- **Session-based**: Authentication persists only for the browser session
- **Environment Variables**: Credentials are stored securely in environment variables
- **No Database Storage**: System admin credentials are never stored in the database
- **Auto-timeout**: Session expires when browser is closed

### Access Control
- **Isolated Route**: System admin is on a separate route (`/systemadmin`)
- **Independent Auth**: Completely separate from regular user authentication
- **Secure Storage**: Uses sessionStorage (cleared on browser close)

### Security Best Practices
1. **Change Default Credentials**: Always use strong, unique credentials in production
2. **HTTPS Only**: Always use HTTPS in production environments
3. **Regular Updates**: Change credentials periodically
4. **Access Logging**: Consider implementing access logging for audit trails
5. **IP Restrictions**: Consider restricting access to specific IP addresses

## Features Available

The system administrator has access to all the same features as regular administrators, including:

- **User Management**: View and manage all user accounts and profiles
- **Staff Management**: Invite and manage staff members
- **Organization Management**: Oversee all organizations and schools
- **Financial Analytics**: Access to comprehensive financial reporting
- **System Analytics**: Platform-wide metrics and insights
- **Bulk Communications**: Send system-wide announcements
- **System Settings**: Configure platform-wide settings

## User Interface

The system admin interface:
- **Same UI**: Uses the same AdminDashboard component as regular admins
- **Enhanced Header**: Special red header indicating system admin mode
- **Full Access**: All admin features are available
- **Quick Exit**: Easy logout and return to main site

## Troubleshooting

### Can't Access System Admin
1. **Check URL**: Ensure you're accessing `/systemadmin` correctly
2. **Check Credentials**: Verify environment variables are set correctly
3. **Check Browser**: Clear browser cache and cookies
4. **Check Console**: Look for JavaScript errors in browser console

### Authentication Fails
1. **Verify Environment Variables**: Check that `VITE_SYSTEM_ADMIN_USERNAME` and `VITE_SYSTEM_ADMIN_PASSWORD` are set
2. **Restart Server**: Restart your development server after adding environment variables
3. **Check Spelling**: Ensure no typos in credentials
4. **Check Case Sensitivity**: Credentials are case-sensitive

### Session Issues
1. **Browser Storage**: Check if sessionStorage is available and working
2. **Multiple Tabs**: Each tab maintains its own session
3. **Private/Incognito**: May behave differently in private browsing mode

## Development Notes

### Environment Variables
- Vite requires the `VITE_` prefix for client-side environment variables
- Environment variables are built into the client bundle at build time
- In production, ensure environment variables are set on the server

### Security Considerations
- Client-side environment variables are visible in the built bundle
- For maximum security, consider implementing server-side authentication
- This approach is suitable for internal admin tools with trusted users

### Customization
- Modify `SystemAdminAuth.tsx` to change the authentication UI
- Update `SystemAdminPage.tsx` to customize the admin interface
- Add additional security measures as needed

## Production Deployment

### Render.com
1. Set environment variables in the Render dashboard
2. Redeploy your application
3. Access via `https://your-app.onrender.com/systemadmin`

### Other Platforms
1. Set the required environment variables
2. Build and deploy your application
3. Access via your domain + `/systemadmin`

## Security Warnings

⚠️ **Never commit credentials to version control**
⚠️ **Always use HTTPS in production**
⚠️ **Change default credentials immediately**
⚠️ **Consider additional security measures for production use**
⚠️ **Environment variables are visible in the client bundle**

For maximum security in production environments, consider implementing:
- Server-side authentication
- IP-based access restrictions
- Two-factor authentication
- Access logging and monitoring