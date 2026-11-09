import { Link } from 'react-router-dom';
import { Reveal } from '../fx.jsx';
import { CtaBand } from '../sections.jsx';

const stack = ['React', 'Node.js', 'Express', 'PostgreSQL', 'JWT auth', 'Gemini / OpenAI', 'Vite'];
const layers = [
  ['1', 'Keyword matching', 'The job is scanned for known skills and compared with your resume. Fast, free and predictable.'],
  ['2', 'AI analysis', 'An AI model explains each gap, suggests improvements and rewrites weak bullets, without inventing experience.'],
  ['3', 'Your dashboard', 'Every analysis is saved to your account so you can watch your scores improve over time.'],
];

export default function About() {
  return (
    <>
      <section className="home-hero about-hero">
        <div className="blob b1" /><div className="blob b2" />
        <div className="wrap split">
          <Reveal className="from-left">
            <p className="eyebrow">About</p>
            <h1 className="page-title">Built to make resume tailoring simple.</h1>
            <p className="lead">Most applications fail before a person reads them, because the resume does not mention what the job asks for. CareerLens shows you that gap in seconds.</p>
            <Link className="btn grad" to="/analyze">Analyze my resume</Link>
          </Reveal>
          <Reveal className="from-right"><div className="frame"><img src="/images/career-path.svg" alt="Steps from learning to getting hired" /></div></Reveal>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap split">
          <Reveal className="from-left"><div className="frame"><img src="/images/ai-network.svg" alt="AI connecting skills and jobs" loading="lazy" /></div></Reveal>
          <Reveal className="from-right">
            <p className="eyebrow">Our mission</p>
            <h2 className="sec-title left">Make the hiring gap visible</h2>
            <p className="lead">Job seekers should not have to guess why they are not getting replies. We turn a job description into a clear checklist and show you how your resume measures up.</p>
            <ul className="ticks"><li>Honest scores, no inflated numbers</li><li>Advice based only on your real experience</li><li>Simple enough to use in a minute</li></ul>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal><h2 className="sec-title">How the matching works</h2></Reveal>
          <div className="grid3">
            {layers.map(([n, t, d], i) => <Reveal className="card" delay={i * 130} key={t}><span className="num">{n}</span><h3>{t}</h3><p>{d}</p></Reveal>)}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap split">
          <Reveal className="from-left">
            <p className="eyebrow">Privacy</p>
            <h2 className="sec-title left">Your resume stays yours</h2>
            <p className="lead">Your resume text is used for the analysis and is not stored by CareerLens. We keep only the score, the skills and the report, and you can delete any of them.</p>
            <ul className="ticks"><li>Passwords are hashed, never stored as text</li><li>Delete any analysis whenever you like</li><li>No resume files are kept on our servers</li></ul>
          </Reveal>
          <Reveal className="from-right"><div className="frame"><img src="/images/privacy-shield.svg" alt="A shield protecting your data" loading="lazy" /></div></Reveal>
        </div>
      </section>

      <section className="section">
        <div className="wrap narrow center-text">
          <Reveal>
            <h2 className="sec-title">Built with</h2>
            <div className="chips center-chips">{stack.map((s) => <span className="chip neutral" key={s}>{s}</span>)}</div>
          </Reveal>
          <Reveal delay={150} className="card dev-card">
            <span className="avatar big">F</span>
            <div>
              <h3>Fahad Ahmed</h3>
              <p>Full-stack developer from Karachi. CareerLens is a full-stack project built with React, Node.js and PostgreSQL. See more on <a href="https://github.com/fahadahmed098">GitHub</a>.</p>
              <Link className="btn outline small-btn" to="/contact">Get in touch</Link>
            </div>
          </Reveal>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
