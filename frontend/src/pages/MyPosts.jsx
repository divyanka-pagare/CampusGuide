import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_INFO = {
  pending:  { icon: Clock,        color: 'var(--amber)', bg: 'var(--amber-bg)',  label: '⏳ Pending Verification',  tip: 'Waiting for admin to review'       },
  approved: { icon: CheckCircle,  color: 'var(--green)', bg: 'var(--green-bg)',  label: '✅ Approved & Public',       tip: 'Visible to all students'           },
  rejected: { icon: XCircle,      color: 'var(--red)',   bg: 'var(--red-bg)',    label: '❌ Rejected',                tip: 'Edit and resubmit for re-review'   },
};

const MyPostCard = ({ post, onDelete }) => {
  const statusInfo = STATUS_INFO[post.status] || STATUS_INFO.pending;
  const StatusIcon = statusInfo.icon;

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post deleted');
      onDelete(post._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="my-post-card" style={{ borderLeft: `3px solid ${statusInfo.color}` }}>
      {/* Status bar */}
      <div className="my-post-status" style={{ background: statusInfo.bg }}>
        <StatusIcon size={14} style={{ color: statusInfo.color }} />
        <span style={{ color: statusInfo.color, fontWeight: 600, fontSize: '0.82rem' }}>
          {statusInfo.label}
        </span>
        <span style={{ color: 'var(--text3)', fontSize: '0.75rem', marginLeft: 'auto' }}>
          {statusInfo.tip}
        </span>
      </div>

      {/* Rejection reason */}
      {post.status === 'rejected' && post.rejectionReason && (
        <div className="rejection-reason">
          <strong>Admin feedback:</strong> {post.rejectionReason}
        </div>
      )}

      <div className="my-post-body">
        <div className="my-post-badges">
          <span className={`badge ${post.isSelected ? 'badge-green' : 'badge-red'}`}>
            {post.isSelected ? '✓ Selected' : '✗ Not Selected'}
          </span>
          <span className="badge badge-blue">{post.driveType}</span>
        </div>

        <h3 className="my-post-title">{post.title}</h3>
        <p className="my-post-overview">{post.overview?.slice(0, 120)}...</p>

        <div className="my-post-meta">
          <span>🏢 {post.companyName}</span>
          <span>💼 {post.role}</span>
          <span>📅 {post.driveYear}</span>
          <span>🎓 {post.studentBranch}</span>
        </div>

        <div className="my-post-actions">
          <Link to={`/posts/${post._id}`} className="btn btn-ghost btn-sm">
            👁 View
          </Link>
          <Link to={`/posts/${post._id}/edit`} className="btn btn-ghost btn-sm">
            <Edit size={13} /> Edit
            {post.status === 'approved' && (
              <span style={{ fontSize: '0.7rem', color: 'var(--amber)', marginLeft: 4 }}>(will need re-verification)</span>
            )}
          </Link>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const MyPosts = ({ onOpenChatbot }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/posts/my-posts')
      .then(res => setPosts(res.data.posts))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setPosts(p => p.filter(post => post._id !== id));

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter);

  const counts = {
    all: posts.length,
    pending: posts.filter(p => p.status === 'pending').length,
    approved: posts.filter(p => p.status === 'approved').length,
    rejected: posts.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Experiences</h1>
          <p style={{ color: 'var(--text3)', fontSize: '0.875rem', marginTop: 4 }}>
            {posts.length} post{posts.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
        <button className="btn btn-primary" onClick={onOpenChatbot}>
          <PlusCircle size={16} /> Share New Experience
        </button>
      </div>

      {/* How it works info box */}
      <div style={{
        background: 'var(--accent-glow)', border: '1px solid rgba(79,142,247,0.2)',
        borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 24,
        fontSize: '0.85rem', color: 'var(--text2)', lineHeight: 1.6
      }}>
        📋 <strong>How it works:</strong> After you submit an experience, it goes to <strong style={{ color: 'var(--amber)' }}>⏳ Pending</strong> review.
        Once admin (TPO/Principal/Owner) approves it, it becomes <strong style={{ color: 'var(--green)' }}>✅ Public</strong> and visible to all students.
        If edited, it goes back to pending for re-review.
      </div>

      {/* Filter tabs */}
      {posts.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { key: 'all',      label: 'All',      color: 'var(--text2)'  },
            { key: 'pending',  label: '⏳ Pending', color: 'var(--amber)' },
            { key: 'approved', label: '✅ Approved', color: 'var(--green)' },
            { key: 'rejected', label: '❌ Rejected', color: 'var(--red)'  },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '6px 14px', borderRadius: 20,
                border: `1px solid ${filter === key ? color : 'var(--border2)'}`,
                background: filter === key ? color + '22' : 'var(--surface)',
                color: filter === key ? color : 'var(--text3)',
                fontSize: '0.82rem', cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: filter === key ? 600 : 400,
              }}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ height: 180, background: 'var(--surface)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text3)' }}>
          <FileText size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <h2 style={{ fontSize: '1.1rem', marginBottom: 8 }}>
            {posts.length === 0 ? 'No experiences yet' : `No ${filter} posts`}
          </h2>
          <p style={{ fontSize: '0.875rem', marginBottom: 24 }}>
            {posts.length === 0 ? 'Share your campus drive experience to help juniors!' : 'Try a different filter.'}
          </p>
          {posts.length === 0 && (
            <button className="btn btn-primary" onClick={onOpenChatbot}>+ Share Your First Experience</button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(p => (
            <MyPostCard key={p._id} post={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <style>{`
        .my-post-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
          transition: box-shadow 0.2s;
        }
        .my-post-card:hover { box-shadow: var(--shadow); }
        .my-post-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
        }
        .rejection-reason {
          padding: 10px 16px;
          background: var(--red-bg);
          border-bottom: 1px solid rgba(239,68,68,0.15);
          font-size: 0.82rem;
          color: var(--text2);
        }
        .my-post-body { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .my-post-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .my-post-title { font-size: 1rem; font-weight: 700; color: var(--text); }
        .my-post-overview { font-size: 0.85rem; color: var(--text3); line-height: 1.5; }
        .my-post-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.78rem; color: var(--text3); }
        .my-post-actions { display: flex; gap: 8px; flex-wrap: wrap; padding-top: 6px; border-top: 1px solid var(--border); }
      `}</style>
    </div>
  );
};

export default MyPosts;
