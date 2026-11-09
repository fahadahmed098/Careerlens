import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { extractText } from './extract.js';
import { matchResume } from './matcher.js';
import { analyzeWithAI } from './aiService.js';
import { pool, initDb } from './db.js';
import { authRouter, requireAuth, requireAdmin } from './auth.js';

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());
app.use('/api/auth', authRouter);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Guest bhi analyze kar sakta hai; login ho to result history mein save hota hai
app.post('/api/analyze', requireAuth, upload.single('resume'), async (req, res) => {
  try {
    const jobDescription = (req.body.jobDescription || '').trim();
    if (!req.file) return res.status(400).json({ error: 'Resume file upload karein.' });
    if (jobDescription.length < 30) return res.status(400).json({ error: 'Job description thori lambi paste karein.' });

    const resumeText = await extractText(req.file);
    const result = matchResume(resumeText, jobDescription);
    if (result.score === null) {
      return res.status(422).json({ error: 'Job description mein koi pehchani hui skill nahi mili.' });
    }

    let ai = null, aiError = null;
    try {
      ai = await analyzeWithAI({ resumeText, jobText: jobDescription, ...result });
    } catch (err) {
      aiError = err.message;
    }

    let savedId = null;
    if (req.user) {
      try {
        const title = jobDescription.split('\n')[0].slice(0, 80);
        const r = await pool.query(
          `INSERT INTO analyses (user_id, file_name, job_title, match_score, matched_skills, missing_skills, extra_skills, ai_report)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
          [req.user.id, req.file.originalname, title, result.score,
           JSON.stringify(result.matched), JSON.stringify(result.missing), JSON.stringify(result.extra),
           ai ? JSON.stringify(ai) : null]
        );
        savedId = r.rows[0].id;
      } catch (err) {
        console.error('[DB] save fail:', err.message);
      }
    }
    res.json({ fileName: req.file.originalname, ...result, ai, aiError, savedId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/history', requireAuth, async (req, res) => {
  const r = await pool.query(
    'SELECT id, file_name, job_title, match_score, created_at FROM analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [req.user.id]
  );
  res.json(r.rows);
});

app.get('/api/history/:id', requireAuth, async (req, res) => {
  const q = req.user.role === 'admin'
    ? ['SELECT * FROM analyses WHERE id = $1', [req.params.id]]
    : ['SELECT * FROM analyses WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]];
  const r = await pool.query(...q);
  const a = r.rows[0];
  if (!a) return res.status(404).json({ error: 'Nahi mila.' });
  res.json({ fileName: a.file_name, score: a.match_score, matched: a.matched_skills, missing: a.missing_skills,
             extra: a.extra_skills, ai: a.ai_report, aiError: a.ai_report ? null : 'Is analysis ke waqt AI report nahi bani thi.' });
});

app.delete('/api/history/:id', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM analyses WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch((e) => res.status(500).json({ error: e.message }));

// Contact form (public, spam se bachne ke liye IP par 5 messages/ghanta)
const hits = new Map();
app.post('/api/contact', wrap(async (req, res) => {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < 3600e3);
  if (recent.length >= 5) return res.status(429).json({ error: 'Too many messages. Please try again later.' });
  const { name = '', email = '', message = '' } = req.body;
  if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || message.trim().length < 10) {
    return res.status(400).json({ error: 'Please fill in every field (message: at least 10 characters).' });
  }
  await pool.query('INSERT INTO messages (name, email, message) VALUES ($1,$2,$3)',
    [name.trim().slice(0, 100), email.trim().slice(0, 200), message.trim().slice(0, 2000)]);
  hits.set(req.ip, [...recent, now]);
  res.json({ ok: true });
}));

// User dashboard ke numbers
app.get('/api/stats', requireAuth, wrap(async (req, res) => {
  const id = req.user.id;
  const [t, trend, miss, recent] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total, COALESCE(ROUND(AVG(match_score)),0)::int AS avg, COALESCE(MAX(match_score),0)::int AS best FROM analyses WHERE user_id = $1', [id]),
    pool.query('SELECT match_score AS score FROM (SELECT match_score, created_at FROM analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10) x ORDER BY created_at', [id]),
    pool.query('SELECT skill, COUNT(*)::int AS count FROM analyses, jsonb_array_elements_text(missing_skills) AS skill WHERE user_id = $1 GROUP BY skill ORDER BY count DESC LIMIT 6', [id]),
    pool.query('SELECT id, file_name, job_title, match_score, created_at FROM analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 6', [id]),
  ]);
  res.json({ ...t.rows[0], trend: trend.rows.map((r) => r.score), topMissing: miss.rows, recent: recent.rows });
}));

// ---------------- ADMIN ----------------
app.get('/api/admin/overview', requireAdmin, wrap(async (_req, res) => {
  const [t, perDay, miss] = await Promise.all([
    pool.query(`SELECT (SELECT COUNT(*) FROM users)::int AS users,
                       (SELECT COUNT(*) FROM analyses)::int AS analyses,
                       COALESCE((SELECT ROUND(AVG(match_score)) FROM analyses), 0)::int AS avg,
                       (SELECT COUNT(*) FROM messages WHERE NOT is_read)::int AS unread`),
    pool.query(`SELECT to_char(d, 'DD Mon') AS day, COALESCE(c.n, 0)::int AS count
                FROM generate_series(CURRENT_DATE - 6, CURRENT_DATE, interval '1 day') d
                LEFT JOIN (SELECT created_at::date AS day, COUNT(*) AS n FROM analyses GROUP BY 1) c ON c.day = d::date
                ORDER BY d`),
    pool.query(`SELECT skill, COUNT(*)::int AS count FROM analyses, jsonb_array_elements_text(missing_skills) AS skill
                GROUP BY skill ORDER BY count DESC LIMIT 8`),
  ]);
  res.json({ ...t.rows[0], perDay: perDay.rows, topMissing: miss.rows });
}));

app.get('/api/admin/users', requireAdmin, wrap(async (_req, res) => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const r = await pool.query(`SELECT u.id, u.email, u.created_at, COUNT(a.id)::int AS analyses,
      COALESCE(ROUND(AVG(a.match_score)), 0)::int AS avg_score, MAX(a.created_at) AS last_active
      FROM users u LEFT JOIN analyses a ON a.user_id = u.id GROUP BY u.id ORDER BY u.created_at DESC`);
  res.json(r.rows.map((u) => ({ ...u, role: u.email === adminEmail ? 'admin' : 'user' })));
}));

app.delete('/api/admin/users/:id', requireAdmin, wrap(async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ error: 'You cannot delete your own account here.' });
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]); // analyses khud delete ho jati hain
  res.json({ ok: true });
}));

app.get('/api/admin/analyses', requireAdmin, wrap(async (_req, res) => {
  const r = await pool.query(`SELECT a.id, u.email, a.file_name, a.job_title, a.match_score, a.created_at
      FROM analyses a JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 200`);
  res.json(r.rows);
}));

app.get('/api/admin/messages', requireAdmin, wrap(async (_req, res) => {
  res.json((await pool.query('SELECT * FROM messages ORDER BY created_at DESC LIMIT 200')).rows);
}));
app.patch('/api/admin/messages/:id', requireAdmin, wrap(async (req, res) => {
  await pool.query('UPDATE messages SET is_read = true WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
}));
app.delete('/api/admin/messages/:id', requireAdmin, wrap(async (req, res) => {
  await pool.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
}));

const port = process.env.PORT || 5000;
initDb()
  .then(() => console.log('Database connected, tables ready.'))
  .catch((err) => console.error('[DB] connect fail (guest mode chalega):', err.message))
  .finally(() => app.listen(port, () => console.log(`API chal rahi hai: http://localhost:${port}`)));
