// Database initialization script
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔗 Connecting to database...');
    
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully at:', result.rows[0].now);

    // Read and execute schema
    console.log('📋 Reading schema file...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    
    console.log('🏗️ Creating database schema...');
    try {
      await pool.query(schemaSQL);
      console.log('✅ Schema created successfully!');
    } catch (schemaError) {
      if (schemaError.message.includes('already exists')) {
        console.log('ℹ️ Schema already exists, skipping creation...');
      } else {
        throw schemaError;
      }
    }

    // Read and execute sample data
    console.log('📊 Reading sample data file...');
    const sampleDataSQL = fs.readFileSync(path.join(__dirname, '../database/sample_data.sql'), 'utf8');
    
    console.log('📝 Inserting sample data...');
    try {
      await pool.query(sampleDataSQL);
      console.log('✅ Sample data inserted successfully!');
    } catch (dataError) {
      if (dataError.message.includes('duplicate key') || dataError.message.includes('already exists')) {
        console.log('ℹ️ Sample data already exists, skipping insertion...');
      } else {
        throw dataError;
      }
    }

    // Verify tables were created
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Created tables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
    console.log('🎉 Database initialization complete!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Load environment variables
require('dotenv').config();

// Run initialization
initializeDatabase();