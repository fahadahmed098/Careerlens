import { useEffect, useId, useState } from 'react';

// Gradient score ring: 0 se score tak count-up hota hai
export function ScoreRing({ score }) {
  const id = 'g' + useId().replace(/:/g, '');
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setV(score); return; }
    let raf, start;
    const tick = (ts) => {
      if (start === undefined) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      setV(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);
  const r = 88, c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 220 220" className="ring" role="img" aria-label={`Match score ${score} percent`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7867FF" /><stop offset="1" stopColor="#20D6C2" />
        </linearGradient>
      </defs>
      <circle cx="110" cy="110" r={r} fill="none" stroke="#1F2940" strokeWidth="16" />
      <circle cx="110" cy="110" r={r} fill="none" stroke={`url(#${id})`} strokeWidth="16" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} transform="rotate(-90 110 110)" />
      <text x="110" y="120" textAnchor="middle" className="ring-num">{v}%</text>
      <text x="110" y="146" textAnchor="middle" className="ring-label">Job match</text>
    </svg>
  );
}

export const Chips = ({ items, kind }) =>
  items.length ? <div className="chips">{items.map((s) => <span key={s} className={`chip ${kind}`}>{s}</span>)}</div>
               : <p className="muted">Nothing here.</p>;

export function AiReport({ ai }) {
  return (
    <div className="ai">
      {ai.strengths?.length > 0 && (
        <div><h3>Your strengths for this job</h3><ul>{ai.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
      )}
      {ai.gaps?.length > 0 && (
        <div><h3>Gaps to close</h3>
          {ai.gaps.map((g, i) => (
            <div className="gap" key={i}><strong>{g.skill}</strong><p>{g.why}</p><p className="muted">{g.how}</p></div>
          ))}
        </div>
      )}
      {ai.suggestions?.length > 0 && (
        <div><h3>What to improve</h3><ul>{ai.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
      )}
      {ai.rewrites?.length > 0 && (
        <div><h3>Stronger bullet points</h3>
          {ai.rewrites.map((r, i) => (
            <div className="rewrite" key={i}>
              <div className="before"><small>Before</small>{r.before}</div>
              <div className="after"><small>After</small>{r.after}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
