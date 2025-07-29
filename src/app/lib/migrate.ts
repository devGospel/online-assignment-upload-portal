// lib/migrate.ts
import { query } from './db';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    const migrationFiles = fs.readdirSync(path.join(__dirname, '../migrations'))
      .sort()
      .filter(file => file.endsWith('.sql'));

    for (const file of migrationFiles) {
      const alreadyRun = await query('SELECT * FROM migrations WHERE name = $1', [file]);
      if (alreadyRun.rows.length > 0) continue;

      const sql = fs.readFileSync(path.join(__dirname, `../migrations/${file}`), 'utf8');
      await query('BEGIN');
      try {
        await query(sql);
        await query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await query('COMMIT');
        console.log(`Ran migration: ${file}`);
      } catch (err) {
        await query('ROLLBACK');
        throw err;
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}