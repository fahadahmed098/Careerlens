import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || '';
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  del: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = store.get('token');
    return token ? { token, email: store.get('email'), role: store.get('role') || 'user' } : null;
  });

  const logout = useCallback(() => { ['token', 'email', 'role'].forEach((k) => store.del(k)); setUser(null); }, []);

  const api = useCallback(async (url, opts = {}) => {
    const { json, ...rest } = opts;
    const headers = { ...(rest.headers || {}) };
    if (user) headers.Authorization = `Bearer ${user.token}`;
    if (json) { headers['Content-Type'] = 'application/json'; rest.body = JSON.stringify(json); }
    const res = await fetch(API + url, { ...rest, headers });
    if (res.status === 401 && user) logout();
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data;
  }, [user, logout]);

  // Page khulte hi server se role confirm karte hain
  useEffect(() => {
    if (!user) return;
    api('/api/auth/me').then((d) => { store.set('role', d.role); setUser((u) => u && { ...u, email: d.email, role: d.role }); }).catch(() => {});
  }, []); // eslint-disable-line

  async function authenticate(mode, form) {
    const res = await fetch(`${API}/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    store.set('token', data.token); store.set('email', data.email); store.set('role', data.role);
    setUser({ token: data.token, email: data.email, role: data.role });
  }

  return <Ctx.Provider value={{ user, api, logout, authenticate }}>{children}</Ctx.Provider>;
}
