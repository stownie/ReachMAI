#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function updateProfileTypes() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Updating database to use simplified profile-based access control...');
    
    // First, update the constraint to allow the new profile types
    console.log('1. Dropping old constraint...');
    await client.query(`
      ALTER TABLE user_profiles 
      DROP CONSTRAINT IF EXISTS user_profiles_profile_type_check;
    `);
    
    console.log('2. Adding new constraint with updated profile types...');
    await client.query(`
      ALTER TABLE user_profiles 
      ADD CONSTRAINT user_profiles_profile_type_check 
      CHECK (profile_type IN ('student', 'parent', 'adult', 'teacher', 'admin', 'manager'));
    `);
    
    // Update staff invitations constraint
    console.log('3. Updating staff invitations constraint...');
    await client.query(`
      ALTER TABLE staff_invitations 
      DROP CONSTRAINT IF EXISTS staff_invitations_role_check;
    `);
    
    await client.query(`
      ALTER TABLE staff_invitations 
      ADD CONSTRAINT staff_invitations_role_check 
      CHECK (role IN ('admin', 'teacher', 'manager'));
    `);
    
    // Remove admin_role column from staff_invitations if it exists
    console.log('4. Removing admin_role column from staff_invitations...');
    await client.query(`
      ALTER TABLE staff_invitations 
      DROP COLUMN IF EXISTS admin_role;
    `);
    
    // Remove admin_role_id column from user_profiles if it exists
    console.log('5. Removing admin_role_id column from user_profiles...');
    await client.query(`
      ALTER TABLE user_profiles 
      DROP COLUMN IF EXISTS admin_role_id;
    `);
    
    // Drop admin roles system tables if they exist
    console.log('6. Removing admin roles system tables...');
    await client.query(`DROP TABLE IF EXISTS admin_role_permissions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS admin_permissions CASCADE;`);
    await client.query(`DROP TABLE IF EXISTS admin_roles CASCADE;`);
    
    // Update any existing 'office_admin' roles to 'manager'
    console.log('7. Converting any existing office_admin roles to manager...');
    const updateResult = await client.query(`
      UPDATE staff_invitations 
      SET role = 'manager' 
      WHERE role = 'office_admin'
      RETURNING id, email, role;
    `);
    
    if (updateResult.rows.length > 0) {
      console.log(`   Updated ${updateResult.rows.length} staff invitations from office_admin to manager`);
    }
    
    // Check current profile types
    console.log('8. Current profile types in database:');
    const profileTypesResult = await client.query(`
      SELECT profile_type, COUNT(*) as count 
      FROM user_profiles 
      GROUP BY profile_type 
      ORDER BY profile_type;
    `);
    
    profileTypesResult.rows.forEach(row => {
      console.log(`   - ${row.profile_type}: ${row.count} users`);
    });
    
    console.log('✅ Database updated to simplified profile-based access control!');
    console.log('');
    console.log('Valid profile types are now:');
    console.log('  - student   (student users)');
    console.log('  - parent    (parent/guardian users)'); 
    console.log('  - adult     (adult learners)');
    console.log('  - teacher   (teaching staff)');
    console.log('  - admin     (full administrative access)');
    console.log('  - manager   (management-level access)');
    console.log('');
    console.log('Access control is now based purely on profile_type - no complex role hierarchies needed!');
    
  } catch (error) {
    console.error('❌ Error updating profile types:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await updateProfileTypes();
  } catch (error) {
    console.error('Failed to update profile types:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main();
}