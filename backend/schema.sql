-- Phase 2 mein use hoga
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT,
  extracted_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE analyses (
  id SERIAL PRIMARY KEY,
  resume_id INT REFERENCES resumes(id) ON DELETE CASCADE,
  job_title TEXT,
  job_description TEXT,
  match_score INT,
  matched_skills JSONB,
  missing_skills JSONB,
  ai_summary TEXT,
  suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
