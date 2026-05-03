import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './EditPost.css';

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', overview: '', preparationTips: '', otherInsights: '',
    package: '', cgpa: '', resourcesUsed: ''
  });

  useEffect(() => {
    api.get(`/posts/${id}`).then(res => {
      const p = res.data.post;
      if (p.author?._id !== user?._id && p.author !== user?._id) {
        toast.error('Not authorized');
        navigate('/');
        return;
      }
      setPost(p);
      setForm({
        title: p.title || '',
        overview: p.overview || '',
        preparationTips: p.preparationTips || '',
        otherInsights: p.otherInsights || '',
        package: p.package || '',
        cgpa: p.cgpa || '',
        resourcesUsed: p.resourcesUsed?.join(', ') || ''
      });
    }).catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        resourcesUsed: form.resourcesUsed.split(',').map(s => s.trim()).filter(Boolean)
      };
      await api.put(`/posts/${id}`, payload);
      toast.success('Post updated!');
      navigate(`/posts/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="container" style={{ paddingTop: 60, textAlign: 'center' }}>
      <span className="spinner" />
    </div>
  );

  return (
    <div className="edit-post-page container">
      <h1>Edit Experience</h1>
      <p className="edit-sub">Update your campus drive experience. Verification will be reset after edits.</p>

      <form onSubmit={submit} className="edit-form">
        <div className="form-group">
          <label className="form-label">Post Title *</label>
          <input name="title" value={form.title} onChange={handle} required maxLength={150} />
        </div>

        <div className="form-group">
          <label className="form-label">Overview *</label>
          <textarea name="overview" value={form.overview} onChange={handle} rows={5} required maxLength={2000} />
          <span className="form-hint">{form.overview.length}/2000 characters</span>
        </div>

        <div className="edit-row">
          <div className="form-group">
            <label className="form-label">Package / Stipend</label>
            <input name="package" value={form.package} onChange={handle} placeholder="e.g. 6 LPA" />
          </div>
          <div className="form-group">
            <label className="form-label">CGPA at time of drive</label>
            <input name="cgpa" value={form.cgpa} onChange={handle} placeholder="e.g. 8.5" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Preparation Tips</label>
          <textarea name="preparationTips" value={form.preparationTips} onChange={handle} rows={4}
            placeholder="What helped you prepare? Any resources, books, platforms..." />
        </div>

        <div className="form-group">
          <label className="form-label">Resources Used <span style={{ color: 'var(--text3)' }}>(comma separated)</span></label>
          <input name="resourcesUsed" value={form.resourcesUsed} onChange={handle}
            placeholder="e.g. GeeksForGeeks, InterviewBit, LeetCode" />
        </div>

        <div className="form-group">
          <label className="form-label">Other Insights</label>
          <textarea name="otherInsights" value={form.otherInsights} onChange={handle} rows={3}
            placeholder="Company culture, dress code, interview environment..." />
        </div>

        <div className="edit-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
