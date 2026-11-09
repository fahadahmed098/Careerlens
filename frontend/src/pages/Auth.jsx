import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Auth({ mode }) {
  const { user, authenticate } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [show, setShow] = useState(false);
  const login = mode === 'login';
  if (user) return <Navigate to="/analyze" replace />;

  async function submit(e) {
    e.preventDefault(); setError('');
    try { await authenticate(mode, form); nav(loc.state?.from || '/analyze', { replace: true }); }
    catch (err) { setError(err.message); }
  }

  return (
    <div className="auth-split">
      <div className="auth-brand">
        <div className="orb" />
        <h2>Know exactly where you stand.</h2>
        <p>Match your resume to any job, see the skills you are missing and get AI-written ways to improve.</p>
        <div className="glass-note">Your resume text is never stored. Only scores and skills are saved to your history.</div>
      </div>
      <div className="auth-form-side">
        <form className="authform" onSubmit={submit}>
          <h1>{login ? 'Welcome back' : 'Create your account'}</h1>
          <label>Email<input type="email" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password
            <span className="pw">
              <input type={show ? 'text' : 'password'} placeholder="8+ characters" value={form.password} required onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="ghost small-btn" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
            </span>
          </label>
          <button type="submit" className="grad-btn">{login ? 'Continue' : 'Create account'}</button>
          {error && <p className="error" role="alert">{error}</p>}
          <p className="muted small">{login ? <>New here? <Link to="/signup">Create an account</Link></> : <>Already registered? <Link to="/login">Log in</Link></>}</p>
        </form>
      </div>
    </div>
  );
}
