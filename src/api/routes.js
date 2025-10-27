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
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Auth endpoints
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user account
    const accountResult = await query(
      'SELECT * FROM auth_accounts WHERE email = $1',
      [email]
    );
    
    if (accountResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const account = accountResult.rows[0];
    
    // Verify password
    const validPassword = await bcrypt.compare(password, account.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Get user profiles
    let profilesResult = await query(
      'SELECT * FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [account.id]
    );

    // Fallback: If no profiles exist for system owner email, create admin profile
    if (profilesResult.rows.length === 0 && account.email === 'admin@musicalartsinstitute.org') {
      console.log('Creating system owner profiles for:', account.email);
      
      // Create admin profile
      const adminProfileResult = await query(
        `INSERT INTO user_profiles 
         (account_id, profile_type, first_name, last_name, email, is_active, created_at)
         VALUES ($1, 'admin', 'System', 'Owner', $2, true, NOW()) RETURNING *`,
        [account.id, account.email]
      );
      
      // Create admin role entry
      await query(
        'INSERT INTO admin_roles (user_profile_id, name, permissions, created_at) VALUES ($1, $2, $3, NOW())',
        [adminProfileResult.rows[0].id, 'System Owner', JSON.stringify(['all'])]
      );
      
      // Re-fetch profiles
      profilesResult = await query(
        'SELECT * FROM user_profiles WHERE account_id = $1 AND is_active = true',
        [account.id]
      );
      
      console.log('System owner profiles created successfully');
    }

    // Create JWT token
    const token = jwt.sign(
      { accountId: account.id, email: account.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );    res.json({
      token,
      account: {
        id: account.id,
        email: account.email,
        phone: account.phone,
        profiles: profilesResult.rows
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// Staff Management endpoints
// Get all staff members
router.get('/staff', authenticateToken, async (req, res) => {
  try {
    // Verify user is admin
    const userProfile = await query(
      'SELECT profile_type FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [req.user.accountId]
    );
    
    if (!userProfile.rows.some(p => p.profile_type === 'admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

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
        ar.name as admin_role_name,
        ar.description as admin_role_description,
        ar.level as admin_role_level,
        inv.invited_by,
        inv.invited_at,
        (
          SELECT MAX(created_at) 
          FROM auth_tokens 
          WHERE account_id = aa.id AND token_type = 'login'
        ) as last_login
      FROM user_profiles up
      JOIN auth_accounts aa ON up.account_id = aa.id
      LEFT JOIN admin_roles ar ON up.admin_role_id = ar.id
      LEFT JOIN staff_invitations inv ON up.email = inv.email AND inv.status = 'accepted'
      WHERE up.profile_type IN ('admin', 'teacher') 
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
router.get('/staff/invitations', authenticateToken, async (req, res) => {
  try {
    // Verify user is admin
    const userProfile = await query(
      'SELECT profile_type FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [req.user.accountId]
    );
    
    if (!userProfile.rows.some(p => p.profile_type === 'admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

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
router.post('/staff/invite', authenticateToken, async (req, res) => {
  try {
    const { email, firstName, lastName, role, adminRole } = req.body;

    // Verify user is admin - check for admin profile or system owner fallback
    const userProfile = await query(
      'SELECT id, profile_type FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [req.user.accountId]
    );
    
    const adminProfile = userProfile.rows.find(p => p.profile_type === 'admin');
    
    // Fallback: If no admin profile found but user email matches system owner, create one
    if (!adminProfile && req.user.email === 'admin@musicalartsinstitute.org') {
      console.log('Creating system owner admin profile for:', req.user.email);
      
      // Create admin profile for system owner
      const newAdminProfile = await query(
        `INSERT INTO user_profiles 
         (account_id, profile_type, first_name, last_name, email, is_active, created_at)
         VALUES ($1, 'admin', 'System', 'Owner', $2, true, NOW()) RETURNING *`,
        [req.user.accountId, req.user.email]
      );
      
      // Create admin role entry
      await query(
        'INSERT INTO admin_roles (user_profile_id, name, permissions, created_at) VALUES ($1, $2, $3, NOW())',
        [newAdminProfile.rows[0].id, 'System Owner', JSON.stringify(['all'])]
      );
      
      console.log('System owner admin profile created successfully');
      
      // Use the newly created profile
      var finalAdminProfile = newAdminProfile.rows[0];
    } else if (!adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    } else {
      var finalAdminProfile = adminProfile;
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
       (email, first_name, last_name, role, admin_role, status, invited_by, invited_at, expires_at, token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW() + INTERVAL '7 days', $8)
       RETURNING *`,
      [email, firstName, lastName, role, adminRole, 'pending', finalAdminProfile.id, invitationToken]
    );

    const invitation = invitationResult.rows[0];

    // Send invitation email
    const emailResult = await emailService.sendStaffInvitation({
      email,
      firstName,
      lastName,
      role,
      token: invitationToken,
      invitedBy: finalAdminProfile.id
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
router.put('/staff/:staffId', authenticateToken, async (req, res) => {
  try {
    const { staffId } = req.params;
    const { firstName, lastName, role, adminRole, status } = req.body;

    // Verify user is admin
    const userProfile = await query(
      'SELECT profile_type FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [req.user.accountId]
    );
    
    if (!userProfile.rows.some(p => p.profile_type === 'admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

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
router.delete('/staff/:staffId', authenticateToken, async (req, res) => {
  try {
    const { staffId } = req.params;

    // Verify user is admin
    const userProfile = await query(
      'SELECT profile_type FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [req.user.accountId]
    );
    
    if (!userProfile.rows.some(p => p.profile_type === 'admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

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
router.delete('/staff/invitations/:invitationId', authenticateToken, async (req, res) => {
  try {
    const { invitationId } = req.params;

    // Verify user is admin
    const userProfile = await query(
      'SELECT profile_type FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [req.user.accountId]
    );
    
    if (!userProfile.rows.some(p => p.profile_type === 'admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

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
router.post('/staff/invitations/:invitationId/resend', authenticateToken, async (req, res) => {
  try {
    const { invitationId } = req.params;

    // Verify user is admin
    const userProfile = await query(
      'SELECT profile_type FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [req.user.accountId]
    );
    
    if (!userProfile.rows.some(p => p.profile_type === 'admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

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
      'INSERT INTO auth_accounts (email, password_hash, is_verified, created_at) VALUES ($1, $2, true, NOW()) RETURNING *',
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

    // If admin role, create admin profile entry
    if (invitation.role === 'admin' && invitation.admin_role) {
      await query(
        'INSERT INTO admin_roles (user_profile_id, name, permissions, created_at) VALUES ($1, $2, $3, NOW())',
        [profileResult.rows[0].id, invitation.admin_role.replace('_', ' '), '{}']
      );
    }

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
        isVerified: account.is_verified
      },
      profile: profileResult.rows[0]
    });

  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;