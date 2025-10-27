import React, { createContext, useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

export const AuthContext = createContext({
  token: null,
  user: null,
  login: async () => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('authToken'); } catch (e) { return null; }
  });
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('authUser');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  });

  useEffect(() => {
    try {
      if (token) localStorage.setItem('authToken', token);
      else localStorage.removeItem('authToken');
    } catch (e) {}
  }, [token]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem('authUser', JSON.stringify(user));
      else localStorage.removeItem('authUser');
    } catch (e) {}
  }, [user]);

  async function login(phone, password) {
    const res = await apiFetch('/auth/login', { method: 'POST', body: { phone, password } });
    if (res && res.token) {
      setToken(res.token);
      setUser(res.user || null);
      return res;
    }
    throw new Error('Login failed');
  }

  function logout() {
    setToken(null);
    setUser(null);
    try { localStorage.removeItem('paymentDraft'); } catch (e) {}
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}