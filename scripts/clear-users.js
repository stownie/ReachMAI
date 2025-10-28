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

async function clearAllUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Starting user cleanup process...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Delete in correct order to handle foreign key constraints
    console.log('📝 Deleting user profiles...');
    const profileResult = await client.query('DELETE FROM user_profiles');
    console.log(`   Deleted ${profileResult.rowCount} user profiles`);
    
    console.log('📧 Deleting user accounts...');
    const accountResult = await client.query('DELETE FROM user_accounts');
    console.log(`   Deleted ${accountResult.rowCount} user accounts`);
    
    // You might also want to clean up related tables
    console.log('🔄 Deleting password reset tokens...');
    const tokenResult = await client.query('DELETE FROM password_reset_tokens');
    console.log(`   Deleted ${tokenResult.rowCount} password reset tokens`);
    
    // Delete staff invitations if they exist
    console.log('📮 Deleting staff invitations...');
    try {
      const inviteResult = await client.query('DELETE FROM staff_invitations');
      console.log(`   Deleted ${inviteResult.rowCount} staff invitations`);
    } catch (error) {
      // Table might not exist yet
      console.log('   Staff invitations table not found (skipping)');
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ All user data has been successfully deleted!');
    console.log('');
    console.log('📊 Summary:');
    console.log(`   User Profiles: ${profileResult.rowCount} deleted`);
    console.log(`   User Accounts: ${accountResult.rowCount} deleted`);
    console.log(`   Reset Tokens: ${tokenResult.rowCount} deleted`);
    
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
    // Rollback transaction on error
    await client.query('ROLLBACK');
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