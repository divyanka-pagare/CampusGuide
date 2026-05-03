import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, GraduationCap, Cpu } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    branch: user?.branch || '',
    graduationYear: user?.graduationYear || ''
  });
  const [saving, setSaving] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      // Update local storage user
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('cg_user', JSON.stringify(updatedUser));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80, maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6 }}>My Profile</h1>
      <p style={{ color: 'var(--text3)', fontSize: '0.875rem', marginBottom: 32 }}>
        Manage your account details
      </p>

      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 18, padding: 28, marginBottom: 24
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--accent-glow)', border: '2px solid var(--accent)',
            color: 'var(--accent2)', fontFamily: 'var(--font-display)',
            fontWeight: 700, fontSize: '1.4rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{user?.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-amber' : user?.role !== 'student' ? 'badge-blue' : ''}`}
              style={{ marginTop: 6, textTransform: 'capitalize', ...(user?.role === 'student' ? { background: 'var(--surface2)', color: 'var(--text3)' } : {}) }}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label"><User size={13} /> Full Name</label>
            <input name="name" value={form.name} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label"><Mail size={13} /> Email</label>
            <input value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label"><Cpu size={13} /> Branch</label>
              <select name="branch" value={form.branch} onChange={handle}>
                <option value="">Select</option>
                {['CSE','IT','ECE','EEE','ME','CE','OTHER'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label"><GraduationCap size={13} /> Graduation Year</label>
              <input name="graduationYear" type="number" value={form.graduationYear} onChange={handle} min="2020" max="2035" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
