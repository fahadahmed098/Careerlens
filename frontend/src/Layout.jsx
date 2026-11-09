import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './auth.jsx';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
const CONTACT_EMAIL = 'fahadahmed90800@gmail.com';

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    setOpen(false);
    if (hash) setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  // Sidebar sirf admin ke liye (/dashboard aur /admin)
  if (isAdmin && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return (
      <div className="shell">
        <aside className="sidebar">
          <Link to="/" className="brand"><i className="logo" />CareerLens</Link>
          <nav>
            <p className="side-label">Admin</p>
            <NavLink to="/dashboard">My overview</NavLink>
            <NavLink to="/admin">Admin panel</NavLink>
            <p className="side-label">Website</p>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/analyze">Resume analyzer</NavLink>
          </nav>
          <div className="user-card">
            <span className="avatar">{(user.email || '?')[0].toUpperCase()}</span>
            <div><strong>{user.email}</strong><span className="tag">Admin</span></div>
            <button className="ghost small-btn" onClick={logout}>Log out</button>
          </div>
        </aside>
        <div className="app-main">
          <div className="topbar"><span>{greeting()}</span><Link className="btn small-btn grad" to="/analyze">New analysis</Link></div>
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <Link to="/" className="brand"><i className="logo" />CareerLens</Link>
          <button className="ghost burger" onClick={() => setOpen(!open)} aria-expanded={open}>Menu</button>
          <nav className={`nav-links ${open ? 'open' : ''}`}>
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/signup">Analyzer</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
            {user ? (
              <span className="nav-user"><span className="avatar" title={user.email}>{(user.email || '?')[0].toUpperCase()}</span><button className="ghost small-btn" onClick={logout}>Log out</button></span>
            ) : (
              <>
                <NavLink to="/login">Log in</NavLink>
                <Link className="btn grad small-btn" to="/signup">Start free</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
      <footer className="footer">
        <div className="foot-glow" />
        <div className="wrap foot-grid">
          <div className="foot-brand">
            <Link to="/" className="brand"><i className="logo" />CareerLens</Link>
            <p>Match your resume to any job, see the skills you are missing and get AI-written ways to improve.</p>
            <div className="socials"><a href="https://github.com/fahadahmed098" target="_blank" rel="noreferrer">GitHub</a><a href={`mailto:${CONTACT_EMAIL}`}>Email</a></div>
          </div>
          <div><h4>Product</h4><Link to="/analyze">Resume analyzer</Link><Link to="/#how">How it works</Link><Link to="/#faq">FAQ</Link></div>
          <div><h4>Company</h4><Link to="/about">About</Link><Link to="/contact">Contact</Link></div>
          <div><h4>Account</h4>{user ? <button className="linklike" onClick={logout}>Log out</button> : <><Link to="/login">Log in</Link><Link to="/signup">Create account</Link></>}</div>
        </div>
        <div className="wrap foot-bottom">
          <span>© 2026 CareerLens. Built by Fahad Ahmed.</span>
          <span>React · Node.js · PostgreSQL</span>
          <button className="ghost small-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</button>
        </div>
      </footer>
    </>
  );
}
