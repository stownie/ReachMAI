#!/usr/bin/env node

/**
 * Simple User Cleanup Script
 * Just deletes user_profiles - let the database handle cascading if configured
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function simpleCleanup() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Simple cleanup: Deleting user profiles...');
    
    // Try to delete just user_profiles - let DB handle cascading
    try {
      const result = await client.query('DELETE FROM user_profiles');
      console.log(`✅ Deleted ${result.rowCount} user profiles`);
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

simpleCleanup();