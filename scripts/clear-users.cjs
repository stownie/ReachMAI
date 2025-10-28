#!/usr/bin/env node

/**
 * Clear Users Script
 * 
 * This script deletes all user accounts and related data from the database.
 * Use with caution - this will permanently delete all user data!
 */

const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to check if table exists
async function tableExists(client, tableName) {
  try {
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [tableName]);
    return result.rows[0].exists;
  } catch (error) {
    return false;
  }
}

// Helper function to safely delete from table
async function safeDelete(client, tableName, description) {
  try {
    const exists = await tableExists(client, tableName);
    if (!exists) {
      console.log(`   ${description} table not found (skipping)`);
      return 0;
    }
    
    const result = await client.query(`DELETE FROM ${tableName}`);
    console.log(`   Deleted ${result.rowCount} ${description.toLowerCase()}`);
    return result.rowCount;
  } catch (error) {
    console.log(`   Error deleting ${description.toLowerCase()}: ${error.message}`);
    return 0;
  }
}

async function clearAllUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Starting user cleanup process...');
    
    // Delete in correct order to handle foreign key constraints
    
    // First, delete all dependent data that references user_profiles
    console.log('💰 Deleting invoices...');
    await safeDelete(client, 'invoices', 'invoices');
    
    console.log('📊 Deleting enrollments...');
    await safeDelete(client, 'enrollments', 'enrollments');
    
    console.log('📝 Deleting assignments...');
    await safeDelete(client, 'assignments', 'assignments');
    
    console.log('📋 Deleting attendance records...');
    await safeDelete(client, 'attendance', 'attendance records');
    
    console.log('💳 Deleting payments...');
    await safeDelete(client, 'payments', 'payments');
    
    console.log('📮 Deleting staff invitations...');
    await safeDelete(client, 'staff_invitations', 'staff invitations');
    
    console.log('🔄 Deleting password reset tokens...');
    await safeDelete(client, 'password_reset_tokens', 'password reset tokens');
    
    // Delete any other tables that might reference user_profiles
    console.log('📱 Deleting sessions...');
    await safeDelete(client, 'user_sessions', 'sessions');
    
    console.log('📧 Deleting notifications...');
    await safeDelete(client, 'notifications', 'notifications');
    
    // Now delete user profiles and accounts
    console.log('👤 Deleting user profiles...');
    const profileResult = await safeDelete(client, 'user_profiles', 'user profiles');
    
    console.log('📧 Deleting user accounts...');
    const accountResult = await safeDelete(client, 'user_accounts', 'user accounts');
    
    console.log('✅ All user data has been successfully deleted!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   User Profiles: ${profileResult.rowCount} deleted`);
    console.log(`   User Accounts: ${accountResult.rowCount} deleted`);
    console.log('   All related data (invoices, enrollments, etc.) has been cleaned up');
    
    // Verify cleanup
    const remainingAccounts = await client.query('SELECT COUNT(*) FROM user_accounts');
    const remainingProfiles = await client.query('SELECT COUNT(*) FROM user_profiles');
    
    console.log('');
    console.log('🔍 Verification:');
    console.log(`   Remaining accounts: ${remainingAccounts.rows[0].count}`);
    console.log(`   Remaining profiles: ${remainingProfiles.rows[0].count}`);
    
    if (remainingAccounts.rows[0].count === '0' && remainingProfiles.rows[0].count === '0') {
      console.log('✅ Database is clean!');
    } else {
      console.log('⚠️  Some data may still remain.');
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    console.log('🚨 WARNING: This will permanently delete ALL user data!');
    console.log('Database:', process.env.DATABASE_URL ? 'Connected' : 'Not configured');
    console.log('');
    
    // In a real scenario, you might want to add a confirmation prompt
    // For now, we'll proceed directly
    
    await clearAllUsers();
    
  } catch (error) {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('');
    console.log('🔌 Database connection closed.');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { clearAllUsers };