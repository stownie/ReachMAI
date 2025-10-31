import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, db } from '../lib/database.js';
import emailService from '../lib/emailService.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    jwt_secret_configured: !!process.env.JWT_SECRET,
    oauth_configured: !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN)
  });
});

// Debug endpoint to check/create system owner account
router.post('/debug/create-owner', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔧 Debug: Creating system owner account for:', email);
    
    // Check if account exists
    const existingAccount = await query(
      'SELECT id FROM auth_accounts WHERE email = $1',
      [email]
    );
    
    if (existingAccount.rows.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Account already exists',
        accountId: existingAccount.rows[0].id 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create account
    const accountResult = await query(
      'INSERT INTO auth_accounts (email, password_hash, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [email, hashedPassword]
    );
    
    const account = accountResult.rows[0];
    console.log('✅ System owner account created:', account.id);
    
    res.json({ 
      success: true, 
      message: 'System owner account created successfully',
      accountId: account.id
    });
    
  } catch (error) {
    console.error('❌ Failed to create system owner account:', error);
    res.status(500).json({ error: 'Failed to create system owner account' });
  }
});

// Debug endpoint to check database schema
router.get('/debug/schema-check', async (req, res) => {
  try {
    // Check the profile_type constraint
    const constraintResult = await query(`
      SELECT con.conname, con.consrc 
      FROM pg_constraint con 
      JOIN pg_class rel ON rel.oid = con.conrelid 
      WHERE rel.relname = 'user_profiles' AND con.contype = 'c'
    `);
    
    // Check current profile types in use
    const profileTypesResult = await query(`
      SELECT DISTINCT profile_type, COUNT(*) as count 
      FROM user_profiles 
      GROUP BY profile_type
    `);
    
    res.json({
      constraints: constraintResult.rows,
      existingProfileTypes: profileTypesResult.rows
    });
    
  } catch (error) {
    console.error('❌ Failed to check schema:', error);
    res.status(500).json({ error: 'Failed to check schema', details: error.message });
  }
});

// Debug endpoint to update system owner profile to admin type
router.post('/debug/update-to-admin', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('🔧 Debug: Updating profile to admin type for:', email);
    
    // Only allow for system owner emails
    const systemOwnerEmails = ['admin@musicalartsinstitute.org', 'stownsend@musicalartsinstitute.org'];
    if (!systemOwnerEmails.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'Not authorized for profile update' });
    }
    
    // Update profile type to admin
    const result = await query(`
      UPDATE user_profiles 
      SET profile_type = 'admin', updated_at = NOW() 
      WHERE email = $1 
      RETURNING id, profile_type, first_name, last_name
    `, [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    console.log('✅ Profile updated to admin for:', email);
    
    res.json({ 
      success: true, 
      message: 'Profile updated to admin successfully',
      profile: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Failed to update profile:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Debug endpoint to reset system owner password
router.post('/debug/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    console.log('🔧 Debug: Resetting password for:', email);
    
    // Only allow for system owner emails
    const systemOwnerEmails = ['admin@musicalartsinstitute.org', 'stownsend@musicalartsinstitute.org'];
    if (!systemOwnerEmails.includes(email.toLowerCase())) {
      return res.status(403).json({ error: 'Not authorized for password reset' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    const result = await query(
      'UPDATE auth_accounts SET password_hash = $1, updated_at = NOW() WHERE email = $2 RETURNING id',
      [hashedPassword, email]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    console.log('✅ Password reset successful for:', email);
    
    res.json({ 
      success: true, 
      message: 'Password reset successfully',
      accountId: result.rows[0].id
    });
    
  } catch (error) {
    console.error('❌ Failed to reset password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Auth check:', {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 20) + '...' : 'none',
    hasJwtSecret: !!process.env.JWT_SECRET,
    endpoint: req.path
  });

  if (!token) {
    console.log('❌ No token provided for:', req.path);
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message, 'for endpoint:', req.path);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('✅ Token verified for user:', user.accountId, 'endpoint:', req.path);
    req.user = user;
    next();
  });
};

// System Admin authentication middleware
export const authenticateSystemAdmin = (req, res, next) => {
  const { username, password } = req.body;
  
  console.log('🔐 System Admin auth check:', {
    hasUsername: !!username,
    hasPassword: !!password,
    endpoint: req.path
  });

  const expectedUsername = process.env.VITE_SYSTEM_ADMIN_USERNAME || 'systemadmin';
  const expectedPassword = process.env.VITE_SYSTEM_ADMIN_PASSWORD || 'SecurePassword123!';

  if (username === expectedUsername && password === expectedPassword) {
    console.log('✅ System admin authenticated for endpoint:', req.path);
    req.isSystemAdmin = true;
    next();
  } else {
    console.log('❌ System admin authentication failed for endpoint:', req.path);
    return res.status(401).json({ error: 'System admin access required' });
  }
};

// Flexible authentication middleware (JWT or System Admin)
export const authenticateFlexible = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  // Try JWT authentication first
  if (token) {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    jwt.verify(token, jwtSecret, (err, user) => {
      if (!err) {
        console.log('✅ JWT Token verified for user:', user.accountId, 'endpoint:', req.path);
        req.user = user;
        return next();
      }
    });
  }
  
  // If JWT fails, check for system admin credentials in request body or query params
  const { sysAdminUsername: bodyUsername, sysAdminPassword: bodyPassword } = req.body || {};
  const { sysAdminUsername: queryUsername, sysAdminPassword: queryPassword } = req.query || {};
  
  const sysAdminUsername = bodyUsername || queryUsername;
  const sysAdminPassword = bodyPassword || queryPassword;
  
  if (sysAdminUsername && sysAdminPassword) {
    const expectedUsername = process.env.VITE_SYSTEM_ADMIN_USERNAME || 'systemadmin';
    const expectedPassword = process.env.VITE_SYSTEM_ADMIN_PASSWORD || 'SecurePassword123!';
    
    if (sysAdminUsername === expectedUsername && sysAdminPassword === expectedPassword) {
      console.log('✅ System admin authenticated for endpoint:', req.path);
      req.isSystemAdmin = true;
      return next();
    }
  }
  
  console.log('❌ No valid authentication provided for:', req.path);
  console.log('Auth details:', {
    hasToken: !!token,
    hasBodyAuth: !!(bodyUsername && bodyPassword),
    hasQueryAuth: !!(queryUsername && queryPassword)
  });
  return res.status(401).json({ error: 'Authentication required' });
};

// Auth endpoints
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    // Find user account
    const accountResult = await query(
      'SELECT * FROM auth_accounts WHERE email = $1',
      [email]
    );
    
    if (accountResult.rows.length === 0) {
      console.log('❌ Account not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const account = accountResult.rows[0];
    console.log('✅ Account found for:', email, 'ID:', account.id);
    
    // Verify password
    const validPassword = await bcrypt.compare(password, account.password_hash);
    if (!validPassword) {
      console.log('❌ Invalid password for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('✅ Password valid for email:', email);
    
    console.log('🔍 Getting user profiles for account:', account.id);
    
    // Get user profiles
    let profilesResult = await query(
      'SELECT * FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [account.id]
    );
    
    console.log('👤 Found profiles:', profilesResult.rows.length);

    // Fallback: If no profiles exist for system owner email, create admin profile
    const systemOwnerEmails = ['admin@musicalartsinstitute.org', 'stownsend@musicalartsinstitute.org'];
    if (profilesResult.rows.length === 0 && systemOwnerEmails.includes(account.email.toLowerCase())) {
      console.log('Creating system owner profiles for:', account.email);
      
      // Create admin profile (using 'teacher' type since 'admin' may not be in production constraint)
      const adminProfileResult = await query(
        `INSERT INTO user_profiles 
         (account_id, profile_type, first_name, last_name, email, is_active, created_at)
         VALUES ($1, 'teacher', 'System', 'Owner', $2, true, NOW()) RETURNING *`,
        [account.id, account.email]
      );
      
      console.log('✅ System owner profile created:', adminProfileResult.rows[0].id);
      
      // Skip admin_roles table for now since it doesn't exist in production
      // The system owner will be identified by email in systemOwnerEmails array
      
      // Re-fetch profiles
      profilesResult = await query(
        'SELECT * FROM user_profiles WHERE account_id = $1 AND is_active = true',
        [account.id]
      );
      
      console.log('System owner profiles created successfully');
    }

    console.log('🔐 Creating JWT token...');
    
    // Create JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    console.log('🔑 JWT secret configured:', !!process.env.JWT_SECRET);
    
    const token = jwt.sign(
      { accountId: account.id, email: account.email },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    console.log('✅ JWT token generated for:', account.email);
    console.log('🔑 Token prefix:', token.substring(0, 20) + '...');
    console.log('👤 Profile count:', profilesResult.rows.length);
    
    console.log('📤 Sending login response...');
    
    res.json({
      token,
      account: {
        id: account.id,
        email: account.email,
        phone: account.phone,
        profiles: profilesResult.rows
      }
    });
  } catch (error) {
    console.error('❌ Login error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { email, phone, password, profile } = req.body;
    
    // Check if account exists
    const existingAccount = await query(
      'SELECT id FROM auth_accounts WHERE email = $1',
      [email]
    );
    
    if (existingAccount.rows.length > 0) {
      return res.status(400).json({ error: 'Account already exists' });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create account
    const accountResult = await query(
      'INSERT INTO auth_accounts (email, phone, password_hash) VALUES ($1, $2, $3) RETURNING *',
      [email, phone, passwordHash]
    );
    
    const account = accountResult.rows[0];
    
    // Create initial profile
    const profileResult = await query(
      `INSERT INTO user_profiles (account_id, profile_type, first_name, last_name, email, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [account.id, profile.type, profile.firstName, profile.lastName, email, phone]
    );
    
    // Create JWT token
    const token = jwt.sign(
      { accountId: account.id, email: account.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      account: {
        id: account.id,
        email: account.email,
        phone: account.phone,
        profiles: [profileResult.rows[0]]
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile endpoints
router.get('/profiles', authenticateToken, async (req, res) => {
  try {
    const profiles = await query(
      'SELECT * FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [req.user.accountId]
    );
    res.json(profiles.rows);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/profiles', authenticateToken, async (req, res) => {
  try {
    const profileData = { ...req.body, account_id: req.user.accountId };
    const profile = await db.create('user_profiles', profileData);
    res.status(201).json(profile);
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Classes endpoints
router.get('/classes', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.query;
    
    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID required' });
    }
    
    // Get profile to determine type
    const profile = await db.findById('user_profiles', profileId);
    if (!profile || profile.account_id !== req.user.accountId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let classesQuery;
    let params;
    
    if (profile.profile_type === 'teacher') {
      classesQuery = `
        SELECT c.*, p.name as program_name, o.name as organization_name
        FROM classes c
        JOIN programs p ON c.program_id = p.id
        JOIN organizations o ON p.organization_id = o.id
        WHERE c.teacher_id = $1 AND c.is_active = true
        ORDER BY c.start_date, c.start_time
      `;
      params = [profileId];
    } else if (profile.profile_type === 'student') {
      classesQuery = `
        SELECT c.*, p.name as program_name, o.name as organization_name, e.status as enrollment_status
        FROM classes c
        JOIN programs p ON c.program_id = p.id
        JOIN organizations o ON p.organization_id = o.id
        JOIN enrollments e ON c.id = e.class_id
        WHERE e.student_id = $1 AND c.is_active = true AND e.status = 'active'
        ORDER BY c.start_date, c.start_time
      `;
      params = [profileId];
    } else if (profile.profile_type === 'parent') {
      classesQuery = `
        SELECT DISTINCT c.*, p.name as program_name, o.name as organization_name, e.status as enrollment_status,
               sp.first_name as student_first_name, sp.last_name as student_last_name
        FROM classes c
        JOIN programs p ON c.program_id = p.id
        JOIN organizations o ON p.organization_id = o.id
        JOIN enrollments e ON c.id = e.class_id
        JOIN user_profiles sp ON e.student_id = sp.id
        JOIN student_parent_relationships spr ON sp.id = spr.student_id
        WHERE spr.parent_id = $1 AND c.is_active = true AND e.status = 'active'
        ORDER BY c.start_date, c.start_time
      `;
      params = [profileId];
    } else {
      return res.json([]);
    }
    
    const result = await query(classesQuery, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assignments endpoints
router.get('/assignments', authenticateToken, async (req, res) => {
  try {
    const { profileId, classId } = req.query;
    
    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID required' });
    }
    
    const profile = await db.findById('user_profiles', profileId);
    if (!profile || profile.account_id !== req.user.accountId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let assignmentsQuery;
    let params;
    
    if (profile.profile_type === 'teacher') {
      assignmentsQuery = `
        SELECT a.*, c.name as class_name
        FROM assignments a
        JOIN classes c ON a.class_id = c.id
        WHERE a.teacher_id = $1 ${classId ? 'AND a.class_id = $2' : ''}
        ORDER BY a.due_date DESC, a.created_at DESC
      `;
      params = classId ? [profileId, classId] : [profileId];
    } else if (profile.profile_type === 'student') {
      assignmentsQuery = `
        SELECT a.*, c.name as class_name,
               sub.id as submission_id, sub.submitted_at, sub.status as submission_status,
               sub.points_earned, sub.grade, sub.feedback
        FROM assignments a
        JOIN classes c ON a.class_id = c.id
        JOIN enrollments e ON c.id = e.class_id
        LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
        WHERE e.student_id = $1 AND a.is_published = true ${classId ? 'AND a.class_id = $2' : ''}
        ORDER BY a.due_date DESC, a.created_at DESC
      `;
      params = classId ? [profileId, classId] : [profileId];
    } else {
      return res.json([]);
    }
    
    const result = await query(assignmentsQuery, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendance endpoints
router.get('/attendance', authenticateToken, async (req, res) => {
  try {
    const { profileId, classId, startDate, endDate } = req.query;
    
    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID required' });
    }
    
    const profile = await db.findById('user_profiles', profileId);
    if (!profile || profile.account_id !== req.user.accountId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let attendanceQuery;
    let params = [profileId];
    
    if (profile.profile_type === 'teacher') {
      attendanceQuery = `
        SELECT ar.*, c.name as class_name, up.first_name, up.last_name
        FROM attendance_records ar
        JOIN classes c ON ar.class_id = c.id
        JOIN user_profiles up ON ar.student_id = up.id
        WHERE c.teacher_id = $1
      `;
    } else if (profile.profile_type === 'student') {
      attendanceQuery = `
        SELECT ar.*, c.name as class_name
        FROM attendance_records ar
        JOIN classes c ON ar.class_id = c.id
        WHERE ar.student_id = $1
      `;
    } else {
      return res.json([]);
    }
    
    // Add optional filters
    if (classId) {
      attendanceQuery += ' AND ar.class_id = $' + (params.length + 1);
      params.push(classId);
    }
    
    if (startDate) {
      attendanceQuery += ' AND ar.session_date >= $' + (params.length + 1);
      params.push(startDate);
    }
    
    if (endDate) {
      attendanceQuery += ' AND ar.session_date <= $' + (params.length + 1);
      params.push(endDate);
    }
    
    attendanceQuery += ' ORDER BY ar.session_date DESC, ar.created_at DESC';
    
    const result = await query(attendanceQuery, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Billing endpoints
router.get('/billing', authenticateToken, async (req, res) => {
  try {
    const invoicesQuery = `
      SELECT i.*, 
             COALESCE(p.total_paid, 0) as total_paid,
             (i.total_amount - COALESCE(p.total_paid, 0)) as balance_due
      FROM invoices i
      LEFT JOIN (
        SELECT invoice_id, SUM(amount) as total_paid
        FROM payments
        WHERE status = 'completed'
        GROUP BY invoice_id
      ) p ON i.id = p.invoice_id
      WHERE i.account_id = $1
      ORDER BY i.created_at DESC
    `;
    
    const result = await query(invoicesQuery, [req.user.accountId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get billing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications endpoints
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.query;
    
    if (!profileId) {
      return res.status(400).json({ error: 'Profile ID required' });
    }
    
    const result = await query(
      `SELECT n.*, up.first_name as sender_first_name, up.last_name as sender_last_name
       FROM notifications n
       LEFT JOIN user_profiles up ON n.sender_id = up.id
       WHERE n.recipient_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [profileId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to test authentication
router.get('/auth-test', authenticateFlexible, async (req, res) => {
  try {
    res.json({
      message: 'Authentication successful',
      authType: req.user ? 'JWT' : (req.isSystemAdmin ? 'SystemAdmin' : 'Unknown'),
      user: req.user || null,
      isSystemAdmin: !!req.isSystemAdmin,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Auth test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Management endpoints
// Get all users with their profiles
router.get('/users', authenticateFlexible, async (req, res) => {
  try {
    // User is authenticated, no additional permission check needed

    const usersQuery = `
      SELECT 
        aa.id as account_id,
        aa.email as account_email,
        aa.phone as account_phone,
        aa.email_verified,
        aa.phone_verified,
        aa.created_at as account_created,
        aa.updated_at as account_updated,
        up.id as profile_id,
        up.profile_type,
        up.first_name,
        up.last_name,
        up.preferred_name,
        up.email as profile_email,
        up.phone as profile_phone,
        up.preferred_contact_method,
        up.date_of_birth,
        up.school,
        up.school_catalog,
        up.is_active,
        up.created_at as profile_created,
        up.updated_at as profile_updated
      FROM auth_accounts aa
      LEFT JOIN user_profiles up ON aa.id = up.account_id
      WHERE up.is_active = true OR up.is_active IS NULL
      ORDER BY aa.created_at DESC, up.created_at DESC
    `;

    const result = await query(usersQuery);
    
    // Group profiles by account
    const accountsMap = new Map();
    
    result.rows.forEach(row => {
      const accountId = row.account_id;
      
      if (!accountsMap.has(accountId)) {
        accountsMap.set(accountId, {
          id: accountId,
          email: row.account_email,
          phone: row.account_phone,
          emailVerified: row.email_verified,
          phoneVerified: row.phone_verified,
          createdAt: row.account_created,
          updatedAt: row.account_updated,
          profiles: []
        });
      }
      
      // Add profile if it exists
      if (row.profile_id) {
        accountsMap.get(accountId).profiles.push({
          id: row.profile_id,
          type: row.profile_type,
          firstName: row.first_name,
          lastName: row.last_name,
          preferredName: row.preferred_name,
          email: row.profile_email,
          phone: row.profile_phone,
          preferredContactMethod: row.preferred_contact_method,
          dateOfBirth: row.date_of_birth,
          school: row.school,
          schoolCatalog: row.school_catalog,
          isActive: row.is_active,
          accountId: accountId,
          createdAt: row.profile_created,
          updatedAt: row.profile_updated,
          emailVerified: row.email_verified,
          phoneVerified: row.phone_verified
        });
      }
    });

    // Convert map to array and add primary profile
    const users = Array.from(accountsMap.values()).map(account => ({
      ...account,
      primaryProfile: account.profiles.length > 0 ? account.profiles[0] : null
    }));

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Staff Management endpoints
// Get all staff members
router.get('/staff', authenticateFlexible, async (req, res) => {
  try {
    // User is authenticated, no additional permission check needed

    const staffQuery = `
      SELECT 
        up.id,
        up.first_name,
        up.last_name,
        up.email,
        up.profile_type as role,
        up.is_active,
        up.created_at,
        up.updated_at,
        aa.email_verified,
        aa.phone,
        inv.invited_by,
        inv.invited_at
      FROM user_profiles up
      JOIN auth_accounts aa ON up.account_id = aa.id
      LEFT JOIN staff_invitations inv ON up.email = inv.email AND inv.status = 'accepted'
      WHERE up.profile_type IN ('admin', 'teacher', 'manager') 
        AND up.is_active = true
      ORDER BY up.created_at DESC
    `;

    const result = await query(staffQuery);
    
    const staffMembers = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      adminRole: row.admin_role_name ? {
        id: row.admin_role_id,
        name: row.admin_role_name,
        description: row.admin_role_description,
        level: row.admin_role_level,
        permissions: []
      } : undefined,
      status: row.is_active ? 'active' : 'inactive',
      invitedBy: row.invited_by,
      invitedAt: row.invited_at,
      lastLogin: row.last_login,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(staffMembers);
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all staff invitations
router.get('/staff/invitations', authenticateFlexible, async (req, res) => {
  try {
    // User is authenticated, no additional permission check needed

    const invitationsQuery = `
      SELECT 
        si.*,
        up.first_name as invited_by_first_name,
        up.last_name as invited_by_last_name
      FROM staff_invitations si
      LEFT JOIN user_profiles up ON si.invited_by = up.id
      ORDER BY si.invited_at DESC
    `;

    const result = await query(invitationsQuery);
    res.json(result.rows);
  } catch (error) {
    console.error('Get staff invitations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create staff invitation
router.post('/staff/invite', authenticateFlexible, async (req, res) => {
  try {
    const { email, firstName, lastName, role, adminRole } = req.body;

    // Get the user's profile for invitation tracking (no permission check needed)
    let inviterProfile = { id: null };
    let inviterName = 'System Administrator';
    
    if (req.user && req.user.accountId) {
      // Regular JWT authentication
      const userProfile = await query(
        'SELECT id, profile_type, first_name, last_name FROM user_profiles WHERE account_id = $1 AND is_active = true',
        [req.user.accountId]
      );
      if (userProfile.rows[0]) {
        inviterProfile = userProfile.rows[0];
        inviterName = `${userProfile.rows[0].first_name} ${userProfile.rows[0].last_name}`;
      }
    } else if (req.isSystemAdmin) {
      // System admin authentication - use NULL for invited_by (allowed by schema)
      inviterProfile = { id: null };
      inviterName = 'System Administrator';
    }

    // Check if email already exists
    const existingAccount = await query(
      'SELECT id FROM auth_accounts WHERE email = $1',
      [email]
    );

    if (existingAccount.rows.length > 0) {
      return res.status(400).json({ error: 'Account with this email already exists' });
    }

    // Check if invitation already exists
    const existingInvitation = await query(
      'SELECT id FROM staff_invitations WHERE email = $1 AND status = $2',
      [email, 'pending']
    );

    if (existingInvitation.rows.length > 0) {
      return res.status(400).json({ error: 'Pending invitation already exists for this email' });
    }

    // Generate invitation token
    const invitationToken = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);

    // Create invitation
    const invitationResult = await query(
      `INSERT INTO staff_invitations 
       (email, first_name, last_name, role, status, invited_by, invited_at, expires_at, token)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW() + INTERVAL '7 days', $7)
       RETURNING *`,
      [email, firstName, lastName, role, 'pending', inviterProfile.id, invitationToken]
    );

    const invitation = invitationResult.rows[0];

    // Send invitation email
    const emailResult = await emailService.sendStaffInvitation({
      email,
      firstName,
      lastName,
      role,
      token: invitationToken,
      invitedBy: inviterName
    });

    res.status(201).json({
      message: 'Staff invitation created successfully',
      invitation,
      emailSent: emailResult.success,
      emailMessage: emailResult.message,
      note: emailResult.success 
        ? 'Invitation email sent from portal@musicalartsinstitute.org' 
        : 'Invitation created but email could not be sent'
    });
  } catch (error) {
    console.error('Create staff invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update staff member
router.put('/staff/:staffId', authenticateFlexible, async (req, res) => {
  try {
    const { staffId } = req.params;
    const { firstName, lastName, role, adminRole, status } = req.body;

    // User is authenticated, no additional permission check needed

    // Get admin role ID if specified
    let adminRoleId = null;
    if (role === 'admin' && adminRole) {
      const roleResult = await query(
        'SELECT id FROM admin_roles WHERE name = $1',
        [adminRole]
      );
      if (roleResult.rows.length > 0) {
        adminRoleId = roleResult.rows[0].id;
      }
    }

    // Update staff member
    const updateQuery = `
      UPDATE user_profiles 
      SET first_name = $1, 
          last_name = $2, 
          profile_type = $3, 
          admin_role_id = $4,
          is_active = $5,
          updated_at = NOW()
      WHERE id = $6 
      RETURNING *
    `;

    const result = await query(updateQuery, [
      firstName, 
      lastName, 
      role, 
      adminRoleId, 
      status === 'active',
      staffId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({
      message: 'Staff member updated successfully',
      staff: result.rows[0]
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete staff member
router.delete('/staff/:staffId', authenticateFlexible, async (req, res) => {
  try {
    const { staffId } = req.params;

    // User is authenticated, no additional permission check needed

    // Don't allow deleting self
    const staffProfile = await query(
      'SELECT account_id FROM user_profiles WHERE id = $1',
      [staffId]
    );

    if (staffProfile.rows.length > 0 && staffProfile.rows[0].account_id === req.user.accountId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Soft delete by setting is_active to false
    const result = await query(
      'UPDATE user_profiles SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [staffId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel staff invitation
router.delete('/staff/invitations/:invitationId', authenticateFlexible, async (req, res) => {
  try {
    const { invitationId } = req.params;

    // User is authenticated, no additional permission check needed

    const result = await query(
      'UPDATE staff_invitations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      ['cancelled', invitationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    res.json({
      message: 'Invitation cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resend staff invitation
router.post('/staff/invitations/:invitationId/resend', authenticateFlexible, async (req, res) => {
  try {
    const { invitationId } = req.params;

    // User is authenticated, no additional permission check needed

    // Generate new token and extend expiry
    const newToken = Math.random().toString(36).substring(2, 15) + 
                     Math.random().toString(36).substring(2, 15);

    const result = await query(
      `UPDATE staff_invitations 
       SET token = $1, 
           expires_at = NOW() + INTERVAL '7 days',
           updated_at = NOW()
       WHERE id = $2 AND status = 'pending'
       RETURNING *`,
      [newToken, invitationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }

    res.json({
      message: 'Invitation resent successfully',
      invitation: result.rows[0]
    });
  } catch (error) {
    console.error('Resend invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept staff invitation
router.post('/staff/accept-invitation', async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Token and passwords are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Find invitation
    const invitationResult = await query(
      'SELECT * FROM staff_invitations WHERE token = $1 AND status = $2 AND expires_at > NOW()',
      [token, 'pending']
    );

    if (invitationResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired invitation' });
    }

    const invitation = invitationResult.rows[0];

    // Create auth account
    const hashedPassword = await bcrypt.hash(password, 10);
    const accountResult = await query(
      'INSERT INTO auth_accounts (email, password_hash, email_verified, created_at) VALUES ($1, $2, true, NOW()) RETURNING *',
      [invitation.email, hashedPassword]
    );

    const account = accountResult.rows[0];

    // Create user profile
    const profileResult = await query(
      `INSERT INTO user_profiles 
       (account_id, profile_type, first_name, last_name, email, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW()) RETURNING *`,
      [account.id, invitation.role, invitation.first_name, invitation.last_name, invitation.email]
    );

    // Admin role is handled by the profile_type field

    // Mark invitation as accepted
    await query(
      'UPDATE staff_invitations SET status = $1, accepted_at = NOW() WHERE id = $2',
      ['accepted', invitation.id]
    );

    // Generate JWT token
    const jwtToken = jwt.sign(
      { accountId: account.id, email: account.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token: jwtToken,
      account: {
        id: account.id,
        email: account.email,
        isVerified: account.email_verified
      },
      profile: profileResult.rows[0]
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;