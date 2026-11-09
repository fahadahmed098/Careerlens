import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { Reveal } from '../fx.jsx';

const CONTACT_EMAIL = 'fahadahmed90800@gmail.com'; // apna email yahan likhein
const TOPICS = ['Feedback', 'Bug report', 'Idea', 'Other'];
const ICONS = {
  mail: 'M4 6h16v12H4zM4 7l8 6 8-6',
  pin: 'M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14',
};
const INFO = [
  ['mail', 'Email', CONTACT_EMAIL, `mailto:${CONTACT_EMAIL}`],
  ['pin', 'Location', 'Karachi, Pakistan'],
  ['code', 'GitHub', 'github.com/fahadahmed098', 'https://github.com/fahadahmed098'],
];

export default function Contact() {
  const { api } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [topic, setTopic] = useState('Feedback');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setSending(true); setError('');
    try {
      await api('/api/contact', { method: 'POST', json: { ...form, message: `[${topic}] ${form.message}` } });
      setSent(true); setForm({ name: '', email: '', message: '' });
    } catch (err) { setError(err.message); }
    finally { setSending(false); }
  }

  return (
    <>
      <section className="contact-hero">
        <div className="blob b1" /><div className="blob b2" />
        <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h1 className="page-title">Let us <span className="grad-text">talk</span></h1>
            <p className="lead">Found a bug, missing a skill in the matcher, or have an idea? Send a message and I will reply by email.</p>
          </Reveal>
        </div>
      </section>

      <section className="wrap contact-grid page-pad" style={{ paddingTop: 24 }}>
        <div>
          {INFO.map(([icon, title, text, href], i) => (
            <Reveal key={title} delay={i * 110} className="card info-card">
              <span className="ico"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[icon]} /></svg></span>
              <div><h3>{title}</h3>{href ? <a href={href}>{text}</a> : <p>{text}</p>}</div>
            </Reveal>
          ))}
        </div>

        <Reveal className="from-right">
          <div className="gborder">
            <div className="panel">
              {sent ? (
                <div className="sent" role="status">
                  <svg viewBox="0 0 84 84" fill="none" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><circle cx="42" cy="42" r="40" /><path d="M26 43l11 11 21-24" /></svg>
                  <h2>Message sent</h2>
                  <p className="muted">Thanks for reaching out. I will get back to you by email.</p>
                  <button className="ghost" onClick={() => setSent(false)}>Send another</button>
                </div>
              ) : (
                <form className="cform" onSubmit={submit}>
                  <div>
                    <p className="label" style={{ marginTop: 0 }}>What is this about?</p>
                    <div className="topics">{TOPICS.map((t) => <button type="button" key={t} className={`topic ${topic === t ? 'on' : ''}`} onClick={() => setTopic(t)}>{t}</button>)}</div>
                  </div>
                  <label>Your name<input placeholder="Ali Khan" value={form.name} onChange={set('name')} required /></label>
                  <label>Your email<input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required /></label>
                  <label>Message<textarea rows={6} maxLength={1900} placeholder="Tell me what is on your mind" value={form.message} onChange={set('message')} required /></label>
                  <div className="counter">{form.message.length} / 1900</div>
                  <button type="submit" className="grad-btn" disabled={sending}>{sending ? 'Sending...' : 'Send message'}</button>
                  {error && <p className="error" role="alert">{error}</p>}
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
