#!/usr/bin/env node
/**
 * Safe Database Schema Update Script
 * Applies schema changes safely, checking for existing tables
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

async function safeSchemaUpdate() {
  console.log('🔄 Starting safe database schema update...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);

    // Check existing tables
    console.log('🔍 Checking existing tables...');
    const existingTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = existingTables.rows.map(row => row.table_name);
    console.log('📋 Found existing tables:', tableNames.length);

    // Check if we need to add the new staff_invitations table
    if (!tableNames.includes('staff_invitations')) {
      console.log('➕ Adding staff_invitations table...');
      await client.query(`
        -- Staff Invitations Table
        CREATE TABLE staff_invitations (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email VARCHAR(255) NOT NULL,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'manager')),
            status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
            invited_by UUID REFERENCES user_profiles(id),
            invited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            accepted_at TIMESTAMP WITH TIME ZONE,
            token VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      await client.query(`
        CREATE TRIGGER update_staff_invitations_updated_at BEFORE UPDATE ON staff_invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
      
      console.log('✅ staff_invitations table created successfully!');
    } else {
      console.log('✅ staff_invitations table already exists');
    }

    // Update profile_type constraints to ensure they match our current requirements
    console.log('🔧 Updating profile_type constraints...');
    await client.query(`
      ALTER TABLE user_profiles 
      DROP CONSTRAINT IF EXISTS user_profiles_profile_type_check;
    `);
    
    await client.query(`
      ALTER TABLE user_profiles 
      ADD CONSTRAINT user_profiles_profile_type_check 
      CHECK (profile_type IN ('student', 'parent', 'adult', 'teacher', 'admin', 'manager'));
    `);
    console.log('✅ Profile type constraints updated');

    // Check indexes
    console.log('🔍 Ensuring all indexes exist...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_user_profiles_account_id ON user_profiles(account_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_profiles_type ON user_profiles(profile_type);',
      'CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);',
      'CREATE INDEX IF NOT EXISTS idx_classes_program_id ON classes(program_id);',
      'CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);',
      'CREATE INDEX IF NOT EXISTS idx_enrollments_class_id ON enrollments(class_id);',
      'CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON assignments(class_id);',
      'CREATE INDEX IF NOT EXISTS idx_attendance_class_student ON attendance_records(class_id, student_id);',
      'CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);',
      'CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);'
    ];

    for (const indexSQL of indexes) {
      await client.query(indexSQL);
    }
    console.log('✅ All indexes verified/created');

    // Final verification
    const finalTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📋 Final table count:', finalTables.rows.length);
    finalTables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });

    client.release();
    console.log('🎉 Safe database schema update completed successfully!');

  } catch (error) {
    console.error('❌ Error updating database schema:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

safeSchemaUpdate();