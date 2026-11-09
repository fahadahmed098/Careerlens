import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { ScoreRing, Chips, AiReport } from '../components.jsx';
import { downloadReport } from '../report.js';
import AuthModal from '../AuthModal.jsx';

const tone = (s) => (s >= 70 ? 'high' : s >= 40 ? 'mid' : 'low');

export default function Analyzer() {
  const { api, user } = useAuth();
  const [params] = useSearchParams();
  const [file, setFile] = useState(null);
  const [job, setJob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [modal, setModal] = useState(null);     // 'login' | 'signup' | null
  const [pending, setPending] = useState(false); // login ke foran baad analysis chalane ke liye
  const [history, setHistory] = useState([]);
  const resultRef = useRef(null);

  const toResult = () => setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
  const loadHistory = () => api('/api/history').then(setHistory).catch(() => {});
  const show = (id) => api(`/api/history/${id}`).then((r) => { setResult(r); toResult(); }).catch((e) => setError(e.message));

  useEffect(() => { if (user) loadHistory(); else setHistory([]); }, [user?.token]); // eslint-disable-line
  useEffect(() => { const id = params.get('open'); if (id && user) show(id); }, [params, user?.token]); // eslint-disable-line
  useEffect(() => {
    if (user && pending) { setPending(false); if (file && job.length >= 30) analyze(); }
  }, [user, pending]); // eslint-disable-line

  async function analyze() {
    setError(''); setResult(null); setLoading(true);
    try {
      const body = new FormData();
      body.append('resume', file);
      body.append('jobDescription', job);
      setResult(await api('/api/analyze', { method: 'POST', body }));
      loadHistory(); toResult();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  const remove = (id) => api(`/api/history/${id}`, { method: 'DELETE' }).then(loadHistory);

  return (
    <main className="page-pad">
      <header className="hero">
        <h1>Resume analyzer</h1>
        <p>Choose your resume, paste the job description and see how well you match.</p>
      </header>

      <section className="panel input">
        <label className={`drop ${file ? 'has-file' : ''}`}>
          <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0] || null)} />
          <strong>{file ? file.name : 'Choose your resume'}</strong>
          <span>{file ? 'Click to change file' : 'PDF or DOCX, up to 5 MB'}</span>
        </label>

        {!user && file && (
          <div className="gate">
            <div><strong>One more step</strong><p>Log in or create a free account to analyze this file. It stays right here, nothing is lost.</p></div>
            <div className="gate-btns">
              <button className="ghost" onClick={() => setModal('login')}>Log in</button>
              <button className="grad-btn" onClick={() => setModal('signup')}>Create account</button>
            </div>
          </div>
        )}

        <textarea placeholder="Paste the job description here" value={job} onChange={(e) => setJob(e.target.value)} rows={9} />
        <button onClick={() => (user ? analyze() : setModal('signup'))} disabled={!file || job.length < 30 || loading}>
          {loading ? 'Analyzing...' : user ? 'Check my match' : 'Continue to analyze'}
        </button>
        {loading && <p className="spinner-note">The AI review can take 10 to 20 seconds.</p>}
        {error && <p className="error" role="alert">{error}</p>}
      </section>

      {result && (
        <div ref={resultRef}>
          <section className="panel result-hero">
            <ScoreRing score={result.score} />
            <div className="result-side">
              <p className="eyebrow">Analysis result</p>
              <h2>{result.score >= 70 ? 'Strong match' : result.score >= 40 ? 'Partial match' : 'Needs work'}</h2>
              {result.ai?.summary && <p className="quote">{result.ai.summary}</p>}
              <div className="pills">
                <div className="pill good"><b>{result.matched.length}</b><span>Matched</span></div>
                <div className="pill bad"><b>{result.missing.length}</b><span>Missing</span></div>
                <div className="pill neutral"><b>{result.extra.length}</b><span>Bonus</span></div>
              </div>
              <button className="ghost" onClick={() => downloadReport(result)}>Download PDF report</button>
            </div>
          </section>
          <section className="panel">
            <div className="cols">
              <div><h3>Matched skills</h3><Chips items={result.matched} kind="good" /></div>
              <div><h3>Missing skills</h3><Chips items={result.missing} kind="bad" /></div>
              <div><h3>Bonus skills</h3><Chips items={result.extra} kind="neutral" /></div>
            </div>
          </section>
          <section className="panel">
            {result.ai ? <AiReport ai={result.ai} /> : <p className="note">AI review is unavailable: {result.aiError}. Your keyword score above still works.</p>}
          </section>
        </div>
      )}

      {user && history.length > 0 && (
        <section className="panel">
          <h3>Your recent analyses</h3>
          <div className="hist">
            {history.slice(0, 8).map((h) => (
              <div className="hist-row" key={h.id}>
                <div style={{ flex: 1 }}><strong>{h.job_title || 'Untitled job'}</strong><small>{h.file_name} · {new Date(h.created_at).toLocaleDateString()}</small></div>
                <span className={`badge ${tone(h.match_score)}`}>{h.match_score}%</span>
                <button className="ghost small-btn" onClick={() => show(h.id)}>View</button>
                <button className="del" onClick={() => remove(h.id)} aria-label="Delete analysis">Delete</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {modal && <AuthModal initialMode={modal} onClose={() => setModal(null)} onDone={() => { setModal(null); setPending(true); }} />}
    </main>
  );
}
