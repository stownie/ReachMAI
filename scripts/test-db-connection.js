#!/usr/bin/env node
/**
 * Database Connection Test Script
 * Tests connection to the Render PostgreSQL database
 */

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  console.log('🔌 Testing database connection...');

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please update your .env file with your Render PostgreSQL connection string:');
    console.log('DATABASE_URL=postgresql://username:password@hostname:port/database');
    process.exit(1);
  }

  console.log('🔍 Using DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

  // Create database connection
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    // Test basic connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    
    console.log('✅ Connection successful!');
    console.log('📅 Server time:', result.rows[0].now);
    console.log('🏷️  PostgreSQL version:', result.rows[0].version.split(' ')[0], result.rows[0].version.split(' ')[1]);

    // Check database info
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port
    `);

    console.log('🗄️  Database name:', dbInfo.rows[0].database_name);
    console.log('👤 Current user:', dbInfo.rows[0].current_user);
    console.log('🌐 Server IP:', dbInfo.rows[0].server_ip || 'localhost');
    console.log('🔌 Server port:', dbInfo.rows[0].server_port);

    // List existing tables
    const tables = await client.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    if (tables.rows.length > 0) {
      console.log('📋 Existing tables:');
      tables.rows.forEach(row => {
        console.log(`  - ${row.table_name} (${row.table_type})`);
      });
    } else {
      console.log('📋 No tables found in public schema');
    }

    client.release();
    console.log('🎉 Database connection test completed successfully!');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 Check your hostname in DATABASE_URL');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Check your port and ensure database is running');
    } else if (error.message.includes('password authentication failed')) {
      console.log('💡 Check your username and password in DATABASE_URL');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('💡 Check your database name in DATABASE_URL');
    }
    
    console.log('🔧 Troubleshooting:');
    console.log('1. Verify your Render database is running');
    console.log('2. Check your DATABASE_URL format: postgresql://user:pass@host:port/db');
    console.log('3. Ensure your IP is whitelisted (if required)');
    console.log('4. Try connecting from Render dashboard first');
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test
testConnection();