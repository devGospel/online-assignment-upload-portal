import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Timeout after 2 seconds if connection fails
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // Enable SSL for Neon in production
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
  // Optionally notify admins or restart the pool
});

// Log connection stats for debugging
pool.on('connect', () => {
  console.log('Database pool connected. Stats:', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  });
});

export default pool;