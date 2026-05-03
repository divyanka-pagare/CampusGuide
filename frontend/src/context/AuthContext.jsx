import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cg_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('cg_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => { localStorage.removeItem('cg_token'); localStorage.removeItem('cg_user'); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('cg_token', res.data.token);
    localStorage.setItem('cg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('cg_token', res.data.token);
    localStorage.setItem('cg_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('cg_token');
    localStorage.removeItem('cg_user');
    setUser(null);
    toast.success('Logged out');
  }, []);

  const isAdmin = user?.role === 'admin';
  const isModerator = ['admin', 'tpo', 'principal'].includes(user?.role);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isModerator }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
