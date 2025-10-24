import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query, db } from '../lib/database.js';

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
    const profilesResult = await query(
      'SELECT * FROM user_profiles WHERE account_id = $1 AND is_active = true',
      [account.id]
    );
    
    // Create JWT token
    const token = jwt.sign(
      { accountId: account.id, email: account.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
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

export default router;