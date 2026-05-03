import { useState, useEffect } from 'react';
import { Shield, Users, BookOpen, Building2, CheckCircle, XCircle, Clock, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Admin.css';

const STATUS_TABS = [
  { key: 'pending',  label: 'Pending',  icon: Clock,        color: 'var(--amber)'  },
  { key: 'approved', label: 'Approved', icon: CheckCircle,  color: 'var(--green)'  },
  { key: 'rejected', label: 'Rejected', icon: XCircle,      color: 'var(--red)'    },
  { key: '',         label: 'All',      icon: BookOpen,      color: 'var(--text2)'  },
];

const ROLE_OPTIONS = [
  { value: 'student',   label: '🎒 Student'       },
  { value: 'tpo',       label: '💼 TPO'            },
  { value: 'principal', label: '🎓 Principal'      },
  { value: 'admin',     label: '👑 Owner / Admin'  },
];

const Admin = () => {
  const { isAdmin, user } = useAuth();
  const [tab, setTab] = useState('posts');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [stats, setStats] = useState({});
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null); // postId
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.stats)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    if (tab === 'posts') {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      api.get(`/admin/posts${params}&limit=50`)
        .then(r => setPosts(r.data.posts))
        .finally(() => setLoading(false));
    } else if (tab === 'users' && isAdmin) {
      api.get('/admin/users')
        .then(r => setUsers(r.data.users))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab, statusFilter, isAdmin]);

  const handleApprove = async (postId) => {
    try {
      await api.patch(`/admin/posts/${postId}/approve`);
      setPosts(p => p.filter(post => post._id !== postId));
      setStats(s => ({
        ...s,
        pendingPosts: (s.pendingPosts || 1) - 1,
        approvedPosts: (s.approvedPosts || 0) + 1
      }));
      toast.success('Post approved and is now public!');
    } catch { toast.error('Failed to approve'); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await api.patch(`/admin/posts/${rejectModal}/reject`, { reason: rejectReason });
      setPosts(p => p.filter(post => post._id !== rejectModal));
      setStats(s => ({
        ...s,
        pendingPosts: (s.pendingPosts || 1) - 1,
        rejectedPosts: (s.rejectedPosts || 0) + 1
      }));
      toast.success('Post rejected');
      setRejectModal(null);
      setRejectReason('');
    } catch { toast.error('Failed to reject'); }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Permanently remove this post?')) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      setPosts(p => p.filter(post => post._id !== postId));
      toast.success('Post removed');
    } catch { toast.error('Failed'); }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      setUsers(u => u.map(usr => usr._id === userId ? { ...usr, role } : usr));
      toast.success(`Role updated to ${role}`);
    } catch { toast.error('Failed to update role'); }
  };

  const pendingCount = stats.pendingPosts || 0;

  return (
    <div className="admin-page container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1><Shield size={22} /> Admin Panel</h1>
          <p>Logged in as <strong style={{ color: 'var(--accent2)' }}>{user?.name}</strong> · Role: <strong style={{ textTransform: 'capitalize' }}>{user?.role}</strong></p>
        </div>
        {pendingCount > 0 && (
          <div className="pending-alert">
            <Clock size={16} />
            <strong>{pendingCount}</strong> post{pendingCount !== 1 ? 's' : ''} waiting for verification
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="admin-stats">
        {[
          { label: 'Pending Review', value: stats.pendingPosts,  color: 'var(--amber-bg)',  icon: Clock,        textColor: 'var(--amber)' },
          { label: 'Approved',       value: stats.approvedPosts, color: 'var(--green-bg)',  icon: CheckCircle,  textColor: 'var(--green)' },
          { label: 'Rejected',       value: stats.rejectedPosts, color: 'var(--red-bg)',    icon: XCircle,      textColor: 'var(--red)'   },
          { label: 'Total Users',    value: stats.totalUsers,    color: 'var(--accent-glow)',icon: Users,       textColor: 'var(--accent2)'},
          { label: 'Companies',      value: stats.totalCompanies,color: 'rgba(168,85,247,0.1)',icon: Building2, textColor: '#a78bfa'      },
        ].map(({ label, value, color, icon: Icon, textColor }) => (
          <div key={label} className="admin-stat" style={{ background: color, borderColor: textColor + '33' }}>
            <Icon size={18} style={{ color: textColor }} />
            <div className="admin-stat-value" style={{ color: textColor }}>{value ?? '–'}</div>
            <div className="admin-stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Main Tabs */}
      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'posts' ? 'active' : ''}`} onClick={() => setTab('posts')}>
          <BookOpen size={15} /> Posts
          {pendingCount > 0 && <span className="tab-badge">{pendingCount}</span>}
        </button>
        {isAdmin && (
          <button className={`admin-tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
            <Users size={15} /> Users & Roles
          </button>
        )}
      </div>

      {/* Posts Tab */}
      {tab === 'posts' && (
        <>
          {/* Status Filter */}
          <div className="status-tabs">
            {STATUS_TABS.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                className={`status-tab ${statusFilter === key ? 'active' : ''}`}
                style={statusFilter === key ? { borderColor: color, color } : {}}
                onClick={() => setStatusFilter(key)}
              >
                <Icon size={13} /> {label}
                {key === 'pending' && pendingCount > 0 && (
                  <span className="tab-badge" style={{ background: color }}>{pendingCount}</span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="admin-loading">
              {[...Array(5)].map((_, i) => <div key={i} className="admin-row-skeleton" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="admin-empty">
              <CheckCircle size={40} style={{ opacity: 0.3 }} />
              <p>No {statusFilter} posts</p>
            </div>
          ) : (
            <div className="posts-review-list">
              {posts.map(post => (
                <div key={post._id} className={`review-card ${post.status}`}>
                  <div className="review-card-header">
                    <div className="review-status-badge">
                      {post.status === 'pending'  && <span className="badge badge-amber"><Clock size={10}/> Pending</span>}
                      {post.status === 'approved' && <span className="badge badge-green"><CheckCircle size={10}/> Approved</span>}
                      {post.status === 'rejected' && <span className="badge badge-red"><XCircle size={10}/> Rejected</span>}
                      <span className={`badge ${post.isSelected ? 'badge-green' : 'badge-red'}`}>
                        {post.isSelected ? '✓ Selected' : '✗ Not Selected'}
                      </span>
                      <span className="badge badge-blue">{post.driveType}</span>
                    </div>
                    <div className="review-card-actions">
                      <Link to={`/posts/${post._id}`} className="btn btn-ghost btn-sm" target="_blank">
                        <Eye size={13} /> Preview
                      </Link>
                      {post.status === 'pending' && (
                        <>
                          <button className="btn btn-sm" style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)' }}
                            onClick={() => handleApprove(post._id)}>
                            <CheckCircle size={13} /> Approve
                          </button>
                          <button className="btn btn-danger btn-sm"
                            onClick={() => { setRejectModal(post._id); setRejectReason(''); }}>
                            <XCircle size={13} /> Reject
                          </button>
                        </>
                      )}
                      {post.status === 'rejected' && (
                        <button className="btn btn-sm" style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.2)' }}
                          onClick={() => handleApprove(post._id)}>
                          <CheckCircle size={13} /> Approve Anyway
                        </button>
                      )}
                      {post.status === 'approved' && (
                        <button className="btn btn-danger btn-sm"
                          onClick={() => { setRejectModal(post._id); setRejectReason(''); }}>
                          <XCircle size={13} /> Revoke
                        </button>
                      )}
                      {isAdmin && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(post._id)}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="review-title">{post.title}</h3>
                  <p className="review-overview">{post.overview?.slice(0, 150)}...</p>

                  <div className="review-meta">
                    <span>🏢 {post.companyName}</span>
                    <span>👤 {post.author?.name} ({post.author?.branch} · {post.author?.graduationYear} batch)</span>
                    <span>📧 {post.author?.email}</span>
                    <span>📅 Drive: {post.driveYear}</span>
                    {post.status === 'rejected' && post.rejectionReason && (
                      <span style={{ color: 'var(--red)' }}>❌ Reason: {post.rejectionReason}</span>
                    )}
                    {post.verifiedBy && (
                      <span style={{ color: 'var(--text3)' }}>
                        {post.status === 'approved' ? '✓ Approved' : '✗ Rejected'} by {post.verifiedBy?.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Users Tab */}
      {tab === 'users' && isAdmin && (
        <>
          <div className="role-info-cards">
            {ROLE_OPTIONS.map(({ value, label }) => (
              <div key={value} className="role-info-card">
                <div className="role-info-label">{label}</div>
                <div className="role-info-count">
                  {users.filter(u => u.role === value).length} users
                </div>
              </div>
            ))}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ opacity: u._id === user?._id ? 0.7 : 1 }}>
                    <td style={{ fontWeight: 600 }}>
                      {u.name}
                      {u._id === user?._id && <span style={{ color: 'var(--text3)', fontSize: '0.75rem', marginLeft: 6 }}>(you)</span>}
                    </td>
                    <td><span className="admin-cell-muted">{u.email}</span></td>
                    <td><span className="admin-cell-muted">{u.branch || '–'}</span></td>
                    <td><span className="admin-cell-muted">{u.graduationYear || '–'}</span></td>
                    <td>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        disabled={u._id === user?._id}
                        style={{ width: 'auto', padding: '5px 10px', fontSize: '0.82rem' }}
                      >
                        {ROLE_OPTIONS.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Reject Post</h3>
            <p style={{ color: 'var(--text3)', fontSize: '0.875rem', marginBottom: 14 }}>
              Provide a reason so the student knows what to improve:
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete round details, please add more information about each round..."
              rows={4}
              style={{ marginBottom: 16 }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger btn-sm" onClick={handleReject}>Reject Post</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
