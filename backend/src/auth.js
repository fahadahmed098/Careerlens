import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from './db.js';

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('.env mein JWT_SECRET likhein.');
  return process.env.JWT_SECRET;
};
const sign = (u) => jwt.sign({ id: u.id, email: u.email }, secret(), { expiresIn: '7d' });

const roleOf = (email) =>
  (process.env.ADMIN_EMAIL || '').trim().toLowerCase() === String(email).toLowerCase() ? 'admin' : 'user';

export const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Sahi email likhein.' });
    if (password.length < 8) return res.status(400).json({ error: 'Password kam az kam 8 characters ka ho.' });

    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email', [email, hash]);
    res.json({ token: sign(r.rows[0]), email, role: roleOf(email) });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Ye email pehle se registered hai.' });
    res.status(500).json({ error: err.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const r = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = r.rows[0];
    const ok = user && (await bcrypt.compare(req.body.password || '', user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Email ya password galat hai.' });
    res.json({ token: sign(user), email: user.email, role: roleOf(user.email) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login ho to req.user set karta hai, warna guest ki tarah aage jane deta hai
export function optionalAuth(req, _res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token) {
    try { req.user = jwt.verify(token, secret()); req.user.role = roleOf(req.user.email); } catch { /* token kharab: guest */ }
  }
  next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ error: 'Pehle login karein.' });
    next();
  });
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access only.' });
    next();
  });
}

// Frontend page load par role dobara confirm karta hai
authRouter.get('/me', requireAuth, (req, res) => res.json({ email: req.user.email, role: req.user.role }));
