#!/usr/bin/env node
/**
 * Database Status Check Script
 * Shows current database schema and constraints
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabaseStatus() {
  console.log('📊 Checking database status...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();

    // Database info
    console.log('\n🗄️  Database Information:');
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        version() as version
    `);
    console.log(`   Database: ${dbInfo.rows[0].database_name}`);
    console.log(`   User: ${dbInfo.rows[0].current_user}`);
    console.log(`   Version: ${dbInfo.rows[0].version.split(' ')[0]} ${dbInfo.rows[0].version.split(' ')[1]}`);

    // Table information
    console.log('\n📋 Tables and Row Counts:');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    for (const table of tables.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      console.log(`   ${table.table_name}: ${countResult.rows[0].count} rows`);
    }

    // Check profile types constraint
    console.log('\n👥 User Profile Types Constraint:');
    const constraints = await client.query(`
      SELECT 
        tc.constraint_name,
        cc.check_clause
      FROM information_schema.table_constraints tc
      JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
      WHERE tc.table_name = 'user_profiles' 
        AND tc.constraint_type = 'CHECK'
        AND cc.check_clause LIKE '%profile_type%';
    `);

    if (constraints.rows.length > 0) {
      console.log(`   ✅ ${constraints.rows[0].check_clause}`);
    }

    // Check existing user profiles by type
    console.log('\n👤 Current User Profiles by Type:');
    const profiles = await client.query(`
      SELECT profile_type, COUNT(*) as count
      FROM user_profiles 
      GROUP BY profile_type 
      ORDER BY profile_type;
    `);

    if (profiles.rows.length > 0) {
      profiles.rows.forEach(row => {
        console.log(`   ${row.profile_type}: ${row.count} users`);
      });
    } else {
      console.log('   No user profiles found');
    }

    // Check staff invitations
    console.log('\n📧 Staff Invitations:');
    const invites = await client.query(`
      SELECT status, COUNT(*) as count
      FROM staff_invitations 
      GROUP BY status 
      ORDER BY status;
    `);

    if (invites.rows.length > 0) {
      invites.rows.forEach(row => {
        console.log(`   ${row.status}: ${row.count} invitations`);
      });
    } else {
      console.log('   No staff invitations found');
    }

    client.release();
    console.log('\n✅ Database status check completed!');

  } catch (error) {
    console.error('❌ Error checking database status:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkDatabaseStatus();