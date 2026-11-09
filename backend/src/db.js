import pg from 'pg';

const url = process.env.DATABASE_URL;
// Hosted database (Neon) ko SSL chahiye, local ko nahi
const ssl = url && !/localhost|127\.0\.0\.1/.test(url) ? { rejectUnauthorized: false } : false;
export const pool = new pg.Pool({ connectionString: url, ssl });

// Tables khud ban jati hain, SQL manually chalane ki zarurat nahi
export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS analyses (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      file_name TEXT,
      job_title TEXT,
      match_score INT,
      matched_skills JSONB,
      missing_skills JSONB,
      extra_skills JSONB,
      ai_report JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      name TEXT, email TEXT, message TEXT,
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);
}
