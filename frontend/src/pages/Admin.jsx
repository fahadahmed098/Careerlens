import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const tone = (s) => (s >= 70 ? 'high' : s >= 40 ? 'mid' : 'low');
const day = (d) => (d ? new Date(d).toLocaleDateString() : '-');
const TABS = ['Overview', 'Users', 'Analyses', 'Messages'];

export default function Admin() {
  const { api } = useAuth();
  const [tab, setTab] = useState('Overview');
  const [data, setData] = useState({});
  const [error, setError] = useState('');

  const load = (t = tab.toLowerCase()) =>
    api(`/api/admin/${t}`).then((d) => setData((x) => ({ ...x, [t]: d }))).catch((e) => setError(e.message));
  useEffect(() => { setError(''); load(); }, [tab]); // eslint-disable-line

  async function act(url, method, reload) {
    await api(url, { method }).catch((e) => setError(e.message));
    load(reload);
  }

  const o = data.overview, users = data.users, analyses = data.analyses, messages = data.messages;
  const maxDay = Math.max(1, ...(o?.perDay || []).map((d) => d.count));
  const maxMiss = Math.max(1, ...(o?.topMissing || []).map((m) => m.count));

  return (
    <div className="page-pad">
      <p className="eyebrow">Admin</p>
      <h1 className="page-title">Admin panel</h1>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t}{t === 'Messages' && o?.unread > 0 ? <b className="dot">{o.unread}</b> : null}
          </button>
        ))}
      </div>
      {error && <p className="error" role="alert">{error}</p>}

      {tab === 'Overview' && o && (
        <>
          <div className="stat-grid">
            <div className="card stat"><span>Total users</span><strong>{o.users}</strong></div>
            <div className="card stat"><span>Total analyses</span><strong>{o.analyses}</strong></div>
            <div className="card stat"><span>Average score</span><strong>{o.avg}%</strong></div>
            <div className="card stat"><span>Unread messages</span><strong>{o.unread}</strong></div>
          </div>
          <div className="split">
            <div className="panel">
              <h3>Analyses, last 7 days</h3>
              <div className="trend">{o.perDay.map((d) => <div key={d.day} className="bar high" style={{ height: `${Math.max((d.count / maxDay) * 100, 4)}%` }} title={d.day}><span>{d.count}</span></div>)}</div>
              <div className="axis">{o.perDay.map((d) => <small key={d.day}>{d.day.slice(0, 2)}</small>)}</div>
            </div>
            <div className="panel">
              <h3>Skills missing most (all users)</h3>
              {o.topMissing.length === 0 ? <p className="muted">No data yet.</p> : o.topMissing.map((m) => (
                <div className="hbar" key={m.skill}><span>{m.skill}</span><div><i style={{ width: `${(m.count / maxMiss) * 100}%` }} /></div><b>{m.count}</b></div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab === 'Users' && users && (
        <div className="panel tbl"><table>
          <thead><tr><th>Email</th><th>Role</th><th>Joined</th><th>Analyses</th><th>Avg</th><th>Last active</th><th /></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td><td><span className={`tag ${u.role === 'admin' ? '' : 'quiet'}`}>{u.role}</span></td>
              <td>{day(u.created_at)}</td><td>{u.analyses}</td><td>{u.analyses ? `${u.avg_score}%` : '-'}</td><td>{day(u.last_active)}</td>
              <td>{u.role !== 'admin' && <button className="del" onClick={() => window.confirm(`Delete ${u.email} and all their analyses?`) && act(`/api/admin/users/${u.id}`, 'DELETE', 'users')}>Delete</button>}</td>
            </tr>))}</tbody>
        </table></div>
      )}

      {tab === 'Analyses' && analyses && (
        <div className="panel tbl"><table>
          <thead><tr><th>User</th><th>Job</th><th>File</th><th>Score</th><th>Date</th><th /></tr></thead>
          <tbody>{analyses.map((a) => (
            <tr key={a.id}>
              <td>{a.email}</td><td>{a.job_title || 'Untitled'}</td><td>{a.file_name}</td>
              <td><span className={`badge ${tone(a.match_score)}`}>{a.match_score}%</span></td><td>{day(a.created_at)}</td>
              <td><Link className="btn small-btn" to={`/analyze?open=${a.id}`}>View</Link></td>
            </tr>))}</tbody>
        </table>{analyses.length === 0 && <p className="muted">No analyses yet.</p>}</div>
      )}

      {tab === 'Messages' && messages && (
        <div className="hist">
          {messages.length === 0 && <p className="muted">No messages yet.</p>}
          {messages.map((m) => (
            <div className={`card msg ${m.is_read ? '' : 'unread'}`} key={m.id}>
              <div className="msg-head"><strong>{m.name}</strong> <a href={`mailto:${m.email}`}>{m.email}</a> <small className="muted">{day(m.created_at)}</small></div>
              <p>{m.message}</p>
              <div className="msg-actions">
                {!m.is_read && <button className="ghost small-btn" onClick={() => act(`/api/admin/messages/${m.id}`, 'PATCH', 'messages')}>Mark as read</button>}
                <button className="del" onClick={() => act(`/api/admin/messages/${m.id}`, 'DELETE', 'messages')}>Delete</button>
              </div>
            </div>))}
        </div>
      )}
    </div>
  );
}
