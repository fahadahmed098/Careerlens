import { useEffect, useState } from 'react';
import { useAuth } from './auth.jsx';

// Analyzer page ke andar hi login/signup, taake file page par hi rahe
export default function AuthModal({ initialMode = 'signup', onClose, onDone }) {
  const { authenticate } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const login = mode === 'login';

  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try { await authenticate(mode, form); onDone(); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={login ? 'Log in' : 'Create account'}>
        <button className="ghost x" onClick={onClose} aria-label="Close">×</button>
        <form className="authform" onSubmit={submit}>
          <h2>{login ? 'Welcome back' : 'Create your free account'}</h2>
          <p className="muted small">{login ? 'Log in and your analysis starts right away.' : 'Takes 30 seconds. Your file stays on this page and the analysis starts right after.'}</p>
          <label>Email<input type="email" autoFocus required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label>Password<input type="password" required placeholder="8+ characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <button type="submit" className="grad-btn" disabled={busy}>{busy ? 'Please wait...' : login ? 'Log in and analyze' : 'Create account and analyze'}</button>
          {error && <p className="error" role="alert">{error}</p>}
          <p className="muted small">
            {login ? 'New here? ' : 'Already registered? '}
            <button type="button" className="linkbtn" onClick={() => { setMode(login ? 'signup' : 'login'); setError(''); }}>{login ? 'Create an account' : 'Log in'}</button>
          </p>
        </form>
      </div>
    </div>
  );
}
