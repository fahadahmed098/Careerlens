import { Link } from 'react-router-dom';
import { ScoreRing, Chips } from '../components.jsx';
import { Reveal, CountUp } from '../fx.jsx';
import { CtaBand, Faq, InteractiveDemo, BeforeAfter } from '../sections.jsx';

const skills = ['React', 'Node.js', 'Python', 'PostgreSQL', 'TypeScript', 'Docker', 'AWS', 'Git', 'MongoDB', 'Next.js', 'Django', 'SQL', 'WordPress', 'Kubernetes', 'GraphQL', 'Figma', 'Agile', 'Linux'];
const steps = [
  ['Upload your resume', 'PDF or DOCX. We read the text and nothing else.'],
  ['Paste the job description', 'Copy it from any job board or company page.'],
  ['Get your report', 'A match score, missing skills and AI suggestions in seconds.'],
];
const ICONS = {
  score: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  spark: 'M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z',
  pen: 'M4 20h4L19 9l-4-4L4 16z',
  bars: 'M5 20V10M12 20V4M19 20v-7',
  down: 'M12 4v11M7 11l5 5 5-5M5 20h14',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
};
const features = [
  ['score', 'Match score', 'Your resume is compared with the job across 45+ tracked skills, including tricky names like Node.js and REST API.', true],
  ['spark', 'AI gap analysis', 'Learn why the job wants each missing skill and one practical way to show it.'],
  ['pen', 'Bullet rewrites', 'Weak lines come back as stronger before and after versions, based only on what you wrote.'],
  ['bars', 'Personal dashboard', 'Track every analysis, your average score and the skills you keep missing.', true],
  ['down', 'PDF reports', 'Download a clean report to keep, print or share with a mentor.'],
  ['shield', 'Private by design', 'We store scores and skills, never your resume text.'],
];
const faqs = [
  ['Do I need an account?', 'You can open the analyzer and choose your file without one. To run the analysis you log in or create a free account, right on the same page, and your file stays put.'],
  ['Which files can I upload?', 'PDF and DOCX files up to 4 MB. Scanned image PDFs are not supported yet.'],
  ['Do you store my resume?', 'No. The text is sent to an AI provider to write the review and is not saved by CareerLens. Only the score, skills and report go into your history.'],
  ['How is the score calculated?', 'The job description is scanned for known skills, and the score is the share of them found in your resume. The AI review then explains the gaps.'],
  ['Can I delete my data?', 'Yes. Delete any analysis from your dashboard at any time.'],
];

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="blob b1" /><div className="blob b2" />
        <div className="wrap hero-center">
          <span className="pill-badge">AI-powered resume analysis</span>
          <h1>Your resume. Your next opportunity. <span className="grad-text">Powered by AI.</span></h1>
          <p className="lead">Upload your resume, paste a job description, and get a match score, the skills you are missing and AI-written ways to improve.</p>
          <div className="cta-row">
            <Link className="btn grad lg" to="/analyze">Analyze my resume</Link>
            <a className="btn outline lg" href="#how">Explore features</a>
          </div>
          <p className="muted small">Free account. Takes 30 seconds.</p>
          <div className="mock" aria-label="Sample report">
            <span className="float f1">React.js</span>
            <span className="float f2">87% Match</span>
            <span className="float f3">AI tip: add numbers to your achievements</span>
            <div className="mock-in">
              <div className="mock-ring"><ScoreRing score={87} /><span className="tag">Sample report</span></div>
              <div className="mock-side">
                <p className="label">Skills you have</p><Chips items={['React', 'Node.js', 'Git']} kind="good" />
                <p className="label">Skills to add</p><Chips items={['Docker', 'AWS']} kind="bad" />
                {[['React', 92], ['Node.js', 78], ['Docker', 35]].map(([n, v]) => (
                  <div className="meter" key={n}><span>{n}</span><div><i style={{ width: v + '%' }} /></div><b>{v}%</b></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="strip">
        <div className="wrap strip-in">
          <Reveal className="stat-item"><strong><CountUp to={45} suffix="+" /></strong><span>skills tracked</span></Reveal>
          <Reveal className="stat-item" delay={100}><strong><CountUp to={2} /></strong><span>file formats</span></Reveal>
          <Reveal className="stat-item" delay={200}><strong><CountUp to={20} suffix="s" /></strong><span>for a full AI review</span></Reveal>
          <Reveal className="stat-item" delay={300}><strong>1-click</strong><span>PDF report</span></Reveal>
        </div>
        <div className="marquee" aria-hidden="true">
          <div className="track">{[...skills, ...skills].map((s, i) => <span className="chip neutral" key={i}>{s}</span>)}</div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <Reveal><h2 className="sec-title">From resume to results in three steps</h2></Reveal>
          <div className="timeline">
            <i className="tl-line" />
            {steps.map(([t, d], i) => (
              <Reveal className="tl-step" delay={i * 160} key={t}><span className="num">{i + 1}</span><h3>{t}</h3><p>{d}</p></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="wrap split">
          <Reveal className="from-left"><div className="frame"><img src="/images/resume-scan.svg" alt="A resume being scanned by AI" loading="lazy" /></div></Reveal>
          <Reveal className="from-right">
            <p className="eyebrow">Smart scanning</p>
            <h2 className="sec-title left">It reads your resume the way a recruiter would</h2>
            <p className="lead">Every skill the job asks for is checked against your resume, so you see what is already working and what is missing.</p>
            <ul className="ticks"><li>Matched skills highlighted in green</li><li>Missing skills flagged in red</li><li>Bonus skills the job did not ask for</li></ul>
            <Link className="btn grad" to="/analyze">Try it now</Link>
          </Reveal>
        </div>
      </section>

      <InteractiveDemo />

      <section className="section alt">
        <div className="wrap split">
          <Reveal className="from-left">
            <p className="eyebrow">Skill gaps</p>
            <h2 className="sec-title left">See exactly where you fall short</h2>
            <p className="lead">The AI explains why each gap matters and gives one practical way to close it, plus stronger wording for your weak bullet points.</p>
            <ul className="ticks"><li>Gap-by-gap explanations</li><li>Before and after bullet rewrites</li><li>Specific resume improvements</li></ul>
          </Reveal>
          <Reveal className="from-right card gapcard">
            <h3>Skill match <span className="tag">Sample</span></h3>
            {[['React', 92], ['Node.js', 78], ['SQL', 64], ['Docker', 30], ['AWS', 18]].map(([n, v]) => (
              <div className="mb" key={n}><span>{n}</span><div><i className={v >= 70 ? 'g' : v >= 40 ? 'w' : 'r'} style={{ '--w': v + '%' }} /></div><b>{v}%</b></div>
            ))}
          </Reveal>
        </div>
      </section>

      <BeforeAfter />

      <section className="section alt">
        <div className="wrap">
          <Reveal><h2 className="sec-title">Everything you need to tailor a resume</h2></Reveal>
          <div className="bento">
            {features.map(([icon, t, d, wide], i) => (
              <Reveal key={t} delay={i * 90} className={`card bento-card ${wide ? 'wide' : ''}`}>
                <span className="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[icon]} /></svg></span>
                <h3>{t}</h3><p>{d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Faq items={faqs} />

      <CtaBand />
    </>
  );
}
