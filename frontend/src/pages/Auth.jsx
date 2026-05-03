import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import './Auth.css';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <BookOpen size={24} />
          <span>CampusGuid</span>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in with your PVG college email</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">College Email</label>
            <input
              name="email" type="email" value={form.email}
              onChange={handle} placeholder="yourname@pvgcoet.ac.in"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pass-input">
              <input
                name="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={handle}
                placeholder="Enter password" required
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', graduationYear: '', branch: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.endsWith('@pvgcoet.ac.in') && !form.email.endsWith('@pvg.edu.in')) {
      setError('Only PVG college email IDs are allowed');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <BookOpen size={24} />
          <span>CampusGuid</span>
        </div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Use your official PVG college email to join</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label className="form-label">College Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="yourname@pvgcoet.ac.in" required />
          </div>
          <div className="auth-row">
            <div className="form-group">
              <label className="form-label">Branch</label>
              <select name="branch" value={form.branch} onChange={handle} required>
                <option value="">Select branch</option>
                {['CSE','IT','ECE','EEE','ME','CE','OTHER'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input name="graduationYear" type="number" value={form.graduationYear} onChange={handle} placeholder="e.g. 2025" min="2020" max="2035" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="pass-input">
              <input
                name="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={handle}
                placeholder="Minimum 6 characters" required minLength={6}
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
