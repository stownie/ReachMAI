import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection pool
let pool = null;

/**
 * Initialize database connection pool
 */
export async function initializeDatabase() {
  if (pool) {
    console.log('Database pool already initialized');
    return;
  }

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Initializing database connection pool...');
  
  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  });

  // Test the connection
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
}

/**
 * Get database connection pool
 */
export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

/**
 * Execute a query with the connection pool
 */
export async function query(text, params = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a transaction
 */
export async function transaction(callback) {
  const client = await getPool().connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Health check function
 */
export async function healthCheck() {
  try {
    const result = await query('SELECT NOW() as current_time');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      poolSize: pool ? pool.totalCount : 0,
      idleConnections: pool ? pool.idleCount : 0,
      waitingConnections: pool ? pool.waitingCount : 0
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
}

/**
 * Close the database connection pool
 */
export async function closePool() {
  if (pool) {
    console.log('Closing database connection pool...');
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
}

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database connections...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database connections...');
  await closePool();
  process.exit(0);
});

/**
 * Helper function to create a record in a table
 */
export async function create(table, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
  const columns = keys.join(', ');
  
  const text = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await query(text, values);
  return result.rows[0];
}

/**
 * Helper function to find a record by ID
 */
export async function findById(table, id) {
  const text = `SELECT * FROM ${table} WHERE id = $1`;
  const result = await query(text, [id]);
  return result.rows[0];
}

/**
 * Helper function to find records by condition
 */
export async function findWhere(table, conditions) {
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);
  const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
  
  const text = `SELECT * FROM ${table} WHERE ${whereClause}`;
  const result = await query(text, values);
  return result.rows;
}

/**
 * Helper function to update a record
 */
export async function update(table, id, data) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
  
  const text = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
  const result = await query(text, [id, ...values]);
  return result.rows[0];
}

/**
 * Helper function to delete a record
 */
export async function deleteById(table, id) {
  const text = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
  const result = await query(text, [id]);
  return result.rows[0];
}

// Create db object for backward compatibility
export const db = {
  create,
  findById,
  findWhere,
  update,
  deleteById
};

export default {
  initializeDatabase,
  getPool,
  query,
  transaction,
  healthCheck,
  closePool,
  create,
  findById,
  findWhere,
  update,
  deleteById,
  db
};