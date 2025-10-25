-- Essential Data for ReachMAI Database
-- Only includes critical system data needed for functionality testing

-- Insert admin roles (required for admin functionality)
INSERT INTO admin_roles (id, name, description, level) VALUES
    ('550e8400-e29b-41d4-a716-446655440401', 'system_owner', 'System Owner - Full unrestricted access', 1),
    ('550e8400-e29b-41d4-a716-446655440402', 'super_admin', 'Super Administrator - Full platform access', 2),
    ('550e8400-e29b-41d4-a716-446655440403', 'office_admin', 'Office Administrator - All access except payroll', 3);

-- Insert core permissions
INSERT INTO admin_permissions (id, name, description, resource, action) VALUES
    -- User management
    ('550e8400-e29b-41d4-a716-446655440501', 'users.manage', 'Full user management access', 'users', 'manage'),
    ('550e8400-e29b-41d4-a716-446655440502', 'users.create', 'Create new users', 'users', 'create'),
    ('550e8400-e29b-41d4-a716-446655440503', 'users.read', 'View user information', 'users', 'read'),
    ('550e8400-e29b-41d4-a716-446655440504', 'users.update', 'Edit user information', 'users', 'update'),
    ('550e8400-e29b-41d4-a716-446655440505', 'users.delete', 'Delete users', 'users', 'delete'),
    
    -- Organization management
    ('550e8400-e29b-41d4-a716-446655440506', 'organizations.manage', 'Full organization management', 'organizations', 'manage'),
    ('550e8400-e29b-41d4-a716-446655440507', 'organizations.create', 'Create organizations', 'organizations', 'create'),
    ('550e8400-e29b-41d4-a716-446655440508', 'organizations.read', 'View organizations', 'organizations', 'read'),
    ('550e8400-e29b-41d4-a716-446655440509', 'organizations.update', 'Edit organizations', 'organizations', 'update'),
    ('550e8400-e29b-41d4-a716-446655440510', 'organizations.delete', 'Delete organizations', 'organizations', 'delete'),
    
    -- Payroll management (restricted for office admin)
    ('550e8400-e29b-41d4-a716-446655440511', 'payroll.manage', 'Full payroll management access', 'payroll', 'manage'),
    ('550e8400-e29b-41d4-a716-446655440512', 'payroll.create', 'Create payroll records', 'payroll', 'create'),
    ('550e8400-e29b-41d4-a716-446655440513', 'payroll.read', 'View payroll information', 'payroll', 'read'),
    ('550e8400-e29b-41d4-a716-446655440514', 'payroll.update', 'Edit payroll records', 'payroll', 'update'),
    ('550e8400-e29b-41d4-a716-446655440515', 'payroll.delete', 'Delete payroll records', 'payroll', 'delete'),
    
    -- Other core permissions
    ('550e8400-e29b-41d4-a716-446655440516', 'system.manage', 'System administration access', 'system', 'manage'),
    ('550e8400-e29b-41d4-a716-446655440517', 'analytics.read', 'View analytics and reports', 'analytics', 'read');

-- Assign all permissions to system_owner
INSERT INTO admin_role_permissions (role_id, permission_id) 
SELECT '550e8400-e29b-41d4-a716-446655440401', id FROM admin_permissions;

-- Assign all permissions to super_admin
INSERT INTO admin_role_permissions (role_id, permission_id) 
SELECT '550e8400-e29b-41d4-a716-446655440402', id FROM admin_permissions;

-- Assign all permissions except payroll to office_admin
INSERT INTO admin_role_permissions (role_id, permission_id) 
SELECT '550e8400-e29b-41d4-a716-446655440403', id 
FROM admin_permissions 
WHERE resource != 'payroll';

-- Insert system owner account (your account)
INSERT INTO auth_accounts (id, email, phone, password_hash, email_verified, phone_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440101', 'stownsend@musicalartsinstitute.org', '+1-555-000-0001', '$2b$10$rOKlWlpT7qAJzXxp5mHlE.JvMWqcDf/aNLOeBkRy9q8x.WZtCKkMa', true, true);

-- Insert system owner profile
INSERT INTO user_profiles (id, account_id, profile_type, first_name, last_name, preferred_name, email, phone, admin_role_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440101', 'admin', 'Steven', 'Townsend', 'Steven', 'stownsend@musicalartsinstitute.org', '+1-555-000-0001', '550e8400-e29b-41d4-a716-446655440401');

-- Insert student-parent relationships
INSERT INTO student_parent_relationships (student_id, parent_id, relationship_type, is_primary) VALUES
    ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440202', 'parent', true);

-- Insert sample classes
INSERT INTO classes (id, program_id, teacher_id, name, description, start_date, end_date, day_of_week, start_time, end_time, max_students, location) VALUES
    ('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440203', 'Math Excellence Level 1', 'Foundational advanced mathematics', '2024-11-01', '2025-01-26', 2, '15:30:00', '16:30:00', 15, 'Room 101'),
    ('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440203', 'Creative Writing Basics', 'Introduction to creative writing', '2024-11-01', '2024-12-20', 4, '16:00:00', '17:00:00', 12, 'Room 205');

-- Insert sample enrollments
INSERT INTO enrollments (id, student_id, class_id, enrolled_by, status, payment_status) VALUES
    ('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440202', 'active', 'paid'),
    ('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440202', 'active', 'pending');

-- Insert sample assignments
INSERT INTO assignments (id, class_id, teacher_id, title, description, instructions, due_date, points_possible, assignment_type, is_published) VALUES
    ('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440203', 'Multiplication Tables Practice', 'Practice multiplication tables 1-12', 'Complete all multiplication problems in the worksheet. Show your work for word problems.', '2024-11-15 23:59:00', 100, 'homework', true),
    ('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440203', 'Short Story Draft', 'First draft of original short story', 'Write a 500-word short story on any topic of your choice. Focus on character development and plot structure.', '2024-11-20 23:59:00', 100, 'project', true);

-- Insert sample assignment submissions
INSERT INTO assignment_submissions (id, assignment_id, student_id, submission_text, submitted_at, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440201', 'Completed all multiplication problems. Word problems solved with explanations.', '2024-11-14 18:30:00', 'submitted');

-- Insert sample attendance records
INSERT INTO attendance_records (id, class_id, student_id, session_date, status, check_in_time, recorded_by) VALUES
    ('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '2024-11-05', 'present', '2024-11-05 15:25:00', '550e8400-e29b-41d4-a716-446655440203'),
    ('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440201', '2024-11-12', 'present', '2024-11-12 15:30:00', '550e8400-e29b-41d4-a716-446655440203'),
    ('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440201', '2024-11-07', 'present', '2024-11-07 15:55:00', '550e8400-e29b-41d4-a716-446655440203');

-- Insert sample invoices
INSERT INTO invoices (id, account_id, student_id, invoice_number, description, subtotal, tax_amount, total_amount, due_date, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440201', 'INV-2024-001', 'November 2024 - Math Excellence Classes', 540.00, 43.20, 583.20, '2024-11-15', 'paid'),
    ('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440201', 'INV-2024-002', 'November 2024 - Creative Writing Classes', 320.00, 25.60, 345.60, '2024-11-15', 'pending');

-- Insert invoice line items
INSERT INTO invoice_line_items (invoice_id, enrollment_id, description, quantity, unit_price, total_price) VALUES
    ('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440401', 'Math Excellence Level 1 - 12 sessions', 12, 45.00, 540.00),
    ('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440402', 'Creative Writing Basics - 8 sessions', 8, 40.00, 320.00);

-- Insert sample payments
INSERT INTO payments (id, invoice_id, amount, payment_method, transaction_id, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440901', '550e8400-e29b-41d4-a716-446655440801', 583.20, 'credit_card', 'tx_1234567890', 'completed');

-- Insert sample notifications
INSERT INTO notifications (id, recipient_id, sender_id, title, message, notification_type, priority, sent_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440a01', '550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440203', 'Assignment Due Tomorrow', 'Emma has an assignment due tomorrow in Math Excellence Level 1', 'assignment', 'normal', '2024-11-13 09:00:00'),
    ('550e8400-e29b-41d4-a716-446655440a02', '550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440203', 'Great Work on Assignment!', 'Excellent job on your multiplication tables practice. Keep up the good work!', 'praise', 'normal', '2024-11-14 20:00:00');

-- Insert sample messages
INSERT INTO messages (id, sender_id, recipient_id, subject, body) VALUES
    ('550e8400-e29b-41d4-a716-446655440b01', '550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440202', 'Emma''s Progress Update', 'Hi Sarah, I wanted to update you on Emma''s progress in the Math Excellence program. She''s doing wonderfully and consistently demonstrates strong problem-solving skills. Please let me know if you have any questions.');

-- Insert sample payroll record for teacher
INSERT INTO payroll_records (id, teacher_id, period_start, period_end, hours_worked, hourly_rate, base_pay, gross_pay, net_pay, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440c01', '550e8400-e29b-41d4-a716-446655440203', '2024-11-01', '2024-11-15', 24.0, 35.00, 840.00, 840.00, 672.00, 'approved');