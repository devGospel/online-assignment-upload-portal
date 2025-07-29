import { Pool } from 'pg';

// Configuration for production vs development
const isProduction = process.env.NODE_ENV === 'production';
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to try connecting before timing out
});

// Log connection events
pool.on('connect', () => {
  console.log('Database client connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('remove', () => {
  console.log('Database client removed');
});

// Test the connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to database');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
})();

// Helper function for queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (err) {
    console.error('Query error', { text, params });
    throw err;
  }
};

// Export the pool for transactions
export default pool;