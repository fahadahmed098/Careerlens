import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const tone = (s) => (s >= 70 ? 'high' : s >= 40 ? 'mid' : 'low');

export default function Dashboard() {
  const { api, user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/api/stats').then(setStats).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []); // eslint-disable-line

  async function remove(id) {
    await api(`/api/history/${id}`, { method: 'DELETE' });
    load();
  }

  if (error) return <div className="page-pad"><p className="error">{error}</p></div>;
  if (!stats) return <div className="page-pad"><p className="muted">Loading your dashboard...</p></div>;

  const maxMiss = Math.max(1, ...stats.topMissing.map((m) => m.count));

  return (
    <div className="page-pad">
      <div className="banner">
        <div>
          <h1 className="page-title">Welcome back</h1>
          <p className="muted">{stats.total ? `You have run ${stats.total} analysis${stats.total === 1 ? '' : 'es'}. Keep going!` : 'Run your first analysis to see your stats here.'}</p>
        </div>
        <Link className="btn grad" to="/analyze">Analyze new resume</Link>
      </div>

      <div className="stat-grid">
        <div className="card stat"><span>Analyses</span><strong>{stats.total}</strong></div>
        <div className="card stat"><span>Average score</span><strong>{stats.avg}%</strong></div>
        <div className="card stat"><span>Best score</span><strong>{stats.best}%</strong></div>
        <Link to="/analyze" className="card stat action"><span>Start a new</span><strong>Analysis</strong></Link>
      </div>

      {stats.total === 0 ? (
        <div className="panel"><p>No analyses yet. <Link to="/analyze">Run your first one</Link> while logged in and it will show up here.</p></div>
      ) : (
        <>
          <div className="split">
            <div className="panel">
              <h2>Score trend (last {stats.trend.length})</h2>
              <div className="trend">
                {stats.trend.map((s, i) => (
                  <div key={i} className={`bar ${tone(s)}`} style={{ height: `${Math.max(s, 6)}%` }} title={`${s}%`}><span>{s}</span></div>
                ))}
              </div>
            </div>
            <div className="panel">
              <h2>Skills you miss most</h2>
              {stats.topMissing.length === 0 ? <p className="muted">Nothing missing so far.</p> : stats.topMissing.map((m) => (
                <div className="hbar" key={m.skill}>
                  <span>{m.skill}</span>
                  <div><i style={{ width: `${(m.count / maxMiss) * 100}%` }} /></div>
                  <b>{m.count}</b>
                </div>
              ))}
              <p className="muted small">Adding these to your resume (if you have them) lifts your scores the most.</p>
            </div>
          </div>

          <div className="panel">
            <h2>Recent analyses</h2>
            <div className="hist">
              {stats.recent.map((h) => (
                <div className="hist-row" key={h.id}>
                  <div style={{ flex: 1 }}>
                    <strong>{h.job_title || 'Untitled job'}</strong>
                    <small>{h.file_name} · {new Date(h.created_at).toLocaleDateString()}</small>
                  </div>
                  <span className={`badge ${tone(h.match_score)}`}>{h.match_score}%</span>
                  <Link className="btn small-btn" to={`/analyze?open=${h.id}`}>View</Link>
                  <button className="del" onClick={() => remove(h.id)} aria-label="Delete analysis">Delete</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
