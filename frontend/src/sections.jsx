import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from './fx.jsx';
import { ScoreRing, Chips } from './components.jsx';

export function CtaBand() {
  return (
    <section className="cta-band">
      <i className="orb-a" /><i className="orb-b" />
      <Reveal className="wrap cta-in">
        <h2>Ready to see how your resume <span className="grad-text">really</span> scores?</h2>
        <p>Choose your resume, paste a job description and get your report in under a minute.</p>
        <div className="cta-row">
          <Link className="btn grad lg" to="/analyze">Analyze my resume</Link>
          <Link className="btn outline lg" to="/signup">Create free account</Link>
        </div>
        <ul className="cta-points"><li>Free account</li><li>PDF and DOCX</li><li>Delete your data anytime</li></ul>
      </Reveal>
    </section>
  );
}

export function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="wrap faq-grid">
        <Reveal className="from-left faq-side">
          <p className="eyebrow">FAQ</p>
          <h2 className="sec-title left">Questions, answered</h2>
          <p className="lead">Everything you might want to know before choosing your resume.</p>
          <Link className="btn outline" to="/contact">Still curious? Ask me</Link>
        </Reveal>
        <div className="faq-list">
          {items.map(([q, a], i) => (
            <Reveal key={q} delay={i * 80} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-q" aria-expanded={open === i} aria-controls={`faq-a-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="faq-n">{String(i + 1).padStart(2, '0')}</span><span>{q}</span><i className="faq-plus" aria-hidden="true" />
              </button>
              <div className="faq-a" id={`faq-a-${i}`} role="region"><div><p>{a}</p></div></div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const ROLES = {
  'Frontend Developer': { score: 82, have: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'], miss: ['TypeScript', 'Testing'], tip: 'Add TypeScript to your skills and mention how you test your components.' },
  'Backend Developer': { score: 64, have: ['Node.js', 'SQL', 'REST API', 'Git'], miss: ['Docker', 'AWS', 'CI/CD'], tip: 'Containerize one project with Docker and note where you deployed it.' },
  'Data Analyst': { score: 47, have: ['Python', 'SQL', 'Data Analysis'], miss: ['Power BI', 'Machine Learning', 'Agile'], tip: 'Build one dashboard in Power BI and link it on your resume.' },
};

export function InteractiveDemo() {
  const names = Object.keys(ROLES);
  const [role, setRole] = useState(names[0]);
  const d = ROLES[role];
  return (
    <section className="section">
      <div className="wrap">
        <Reveal><p className="eyebrow center">Try a sample</p><h2 className="sec-title">Pick a role and watch the match change</h2></Reveal>
        <Reveal className="card demo">
          <div className="demo-tabs" role="tablist">
            {names.map((n) => <button key={n} role="tab" aria-selected={role === n} className={`tab ${role === n ? 'on' : ''}`} onClick={() => setRole(n)}>{n}</button>)}
          </div>
          <div className="demo-body" key={role}>
            <ScoreRing score={d.score} />
            <div>
              <p className="label">Skills you have</p><Chips items={d.have} kind="good" />
              <p className="label">Skills to add</p><Chips items={d.miss} kind="bad" />
              <p className="demo-tip"><span className="tag">AI tip</span> {d.tip}</p>
            </div>
          </div>
          <p className="muted small">Sample data. <Link to="/analyze">Try it with your own resume</Link></p>
        </Reveal>
      </div>
    </section>
  );
}

const EX = [
  ['Worked on websites for clients', 'Built and launched business websites on WordPress, including a WooCommerce store with cart and checkout'],
  ['Made a fitness app', 'Built a full-stack MERN fitness tracker with a REST API, a MongoDB schema and a React interface'],
  ['Did marketing for my store', 'Ran Facebook and Instagram ad campaigns, adjusting targeting and budget based on what converted'],
];

export function BeforeAfter() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % EX.length), 4500);
    return () => clearInterval(t);
  }, [paused]);
  const [b, a] = EX[i];
  return (
    <section className="section">
      <div className="wrap split">
        <Reveal className="from-left">
          <p className="eyebrow">Better wording</p>
          <h2 className="sec-title left">Turn weak lines into strong ones</h2>
          <p className="lead">The AI rewrites vague bullet points so they show what you did and how. It only uses what is already on your resume.</p>
        </Reveal>
        <Reveal className="from-right">
          <div className="ba" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="ba-box before" key={`b${i}`}><small>Before</small><p>{b}</p></div>
            <span className="ba-arrow" aria-hidden="true">↓</span>
            <div className="ba-box after" key={`a${i}`}><small>After</small><p>{a}</p></div>
            <div className="dots">{EX.map((_, n) => <button key={n} aria-label={`Example ${n + 1}`} className={`dotbtn ${n === i ? 'on' : ''}`} onClick={() => setI(n)} />)}</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
