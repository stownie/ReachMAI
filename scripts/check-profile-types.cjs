#!/usr/bin/env node

/**
 * Check Profile Types Script
 * Shows what profile types exist in the database
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkProfileTypes() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking profile types in database...');
    console.log('');
    
    // Check if user_profiles table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ user_profiles table does not exist');
      return;
    }
    
    // Get all profile types that currently exist in the database
    console.log('📊 Current profile types in user_profiles table:');
    const currentTypes = await client.query(`
      SELECT type, COUNT(*) as count 
      FROM user_profiles 
      GROUP BY type 
      ORDER BY type
    `);
    
    if (currentTypes.rows.length === 0) {
      console.log('   No profiles found in database');
    } else {
      currentTypes.rows.forEach(row => {
        console.log(`   ${row.type}: ${row.count} profiles`);
      });
    }
    
    console.log('');
    
    // Check what profile types are allowed by the database constraint
    console.log('🔒 Profile types allowed by database constraint:');
    const constraintInfo = await client.query(`
      SELECT 
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'user_profiles' 
        AND tc.constraint_type = 'CHECK'
        AND cc.check_clause LIKE '%type%'
    `);
    
    if (constraintInfo.rows.length > 0) {
      constraintInfo.rows.forEach(row => {
        console.log(`   Constraint: ${row.constraint_name}`);
        console.log(`   Allowed values: ${row.check_clause}`);
      });
    } else {
      console.log('   No CHECK constraints found on type column');
    }
    
    console.log('');
    
    // Show all user profiles with their details
    console.log('👥 All user profiles:');
    const allProfiles = await client.query(`
      SELECT 
        id, 
        first_name, 
        last_name, 
        email, 
        type,
        created_at
      FROM user_profiles 
      ORDER BY created_at DESC
    `);
    
    if (allProfiles.rows.length === 0) {
      console.log('   No profiles found');
    } else {
      allProfiles.rows.forEach(profile => {
        console.log(`   ${profile.first_name} ${profile.last_name} (${profile.email}) - Type: ${profile.type}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkProfileTypes();