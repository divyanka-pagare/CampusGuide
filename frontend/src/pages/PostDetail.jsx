import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, ArrowLeft, Shield, Briefcase, Calendar, GraduationCap, Star, CheckCircle, XCircle, Edit, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './PostDetail.css';

const ROUND_COLORS = {
  aptitude: '#4f8ef7',
  coding: '#22c55e',
  technical: '#f59e0b',
  hr: '#a78bfa',
  group_discussion: '#06b6d4',
  case_study: '#f472b6',
  other: '#9ba3b5'
};

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isModerator } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then(res => {
        const p = res.data.post;
        setPost(p);
        setLikes(p.likeCount || p.likes?.length || 0);
        setDislikes(p.dislikeCount || p.dislikes?.length || 0);
        setUserLiked(p.likes?.includes(user?._id));
        setUserDisliked(p.dislikes?.includes(user?._id));
      })
      .catch(() => toast.error('Post not found'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleLike = async () => {
    if (!user) { toast.error('Login to like'); return; }
    if (voting) return;
    setVoting(true);
    try {
      const res = await api.post(`/posts/${id}/like`);
      setLikes(res.data.likeCount); setDislikes(res.data.dislikeCount);
      setUserLiked(res.data.liked);
      if (res.data.liked) setUserDisliked(false);
    } finally { setVoting(false); }
  };

  const handleDislike = async () => {
    if (!user) { toast.error('Login to vote'); return; }
    if (voting) return;
    setVoting(true);
    try {
      const res = await api.post(`/posts/${id}/dislike`);
      setLikes(res.data.likeCount); setDislikes(res.data.dislikeCount);
      setUserDisliked(res.data.disliked);
      if (res.data.disliked) setUserLiked(false);
    } finally { setVoting(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post deleted');
      navigate(-1);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleVerify = async () => {
    try {
      const res = await api.patch(`/admin/posts/${id}/verify`);
      setPost(p => ({ ...p, isVerified: res.data.isVerified }));
      toast.success(res.data.message);
    } catch { toast.error('Failed to verify'); }
  };

  if (loading) return (
    <div className="post-detail container">
      <div className="post-detail-skeleton">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton-line" style={{ width: `${90 - i*15}%`, height: i === 0 ? 32 : 16 }} />)}
      </div>
    </div>
  );

  if (!post) return (
    <div className="post-detail container">
      <p style={{ color: 'var(--text3)', padding: '60px 0', textAlign: 'center' }}>Post not found.</p>
    </div>
  );

  const isAuthor = user?._id === (post.author?._id || post.author);

  return (
    <div className="post-detail">
      <div className="container post-detail-inner">
        {/* Back button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="post-detail-layout">
          {/* Main content */}
          <article className="post-main">
            {/* Header */}
            <div className="post-detail-header">
              <div className="post-detail-badges">
                <span className={`badge ${post.isSelected ? 'badge-green' : 'badge-red'}`}>
                  {post.isSelected ? <><CheckCircle size={11} /> Selected</> : <><XCircle size={11} /> Not Selected</>}
                </span>
                <span className="badge badge-blue">{post.driveType}</span>
                {post.isVerified && (
                  <span className="badge badge-amber">
                    <Shield size={10} /> Verified by {post.verifiedBy?.name || 'Admin'}
                  </span>
                )}
              </div>

              <h1 className="post-detail-title">{post.title}</h1>

              <div className="post-detail-meta">
                <span><Briefcase size={14} /> {post.role}</span>
                <span><Calendar size={14} /> Drive {post.driveYear}</span>
                <span><GraduationCap size={14} /> {post.studentPassingYear} Batch · {post.studentBranch}</span>
                {post.package && <span><Star size={14} /> {post.package}</span>}
              </div>

              <div className="post-author-full">
                <div className="author-avatar">{post.author?.name?.[0]?.toUpperCase()}</div>
                <div>
                  <span className="author-name">{post.author?.name}</span>
                  <span className="author-branch">{post.author?.branch} · {post.author?.graduationYear} Batch</span>
                </div>
              </div>
            </div>

            {/* Overview */}
            <section className="detail-section">
              <h2>Overview</h2>
              <p>{post.overview}</p>
            </section>

            {/* Rounds */}
            {post.rounds?.length > 0 && (
              <section className="detail-section">
                <h2>Interview Rounds ({post.rounds.length})</h2>
                <div className="rounds-list">
                  {post.rounds.map((round, i) => (
                    <div key={i} className="round-card">
                      <div className="round-header">
                        <div className="round-number" style={{ background: ROUND_COLORS[round.roundType] + '22', color: ROUND_COLORS[round.roundType] }}>
                          R{i + 1}
                        </div>
                        <div>
                          <div className="round-name">{round.roundName}</div>
                          <div className="round-type">{round.roundType?.replace('_', ' ')}</div>
                        </div>
                        {round.difficulty && (
                          <span className={`badge badge-${round.difficulty === 'hard' ? 'red' : round.difficulty === 'easy' ? 'green' : 'amber'}`} style={{ marginLeft: 'auto' }}>
                            {round.difficulty}
                          </span>
                        )}
                      </div>
                      {round.description && <p className="round-desc">{round.description}</p>}
                      {round.questionsAsked?.length > 0 && (
                        <div className="round-questions">
                          <strong>Questions asked:</strong>
                          <ul>{round.questionsAsked.map((q, j) => <li key={j}>{q}</li>)}</ul>
                        </div>
                      )}
                      {round.tips && (
                        <div className="round-tip">
                          💡 <strong>Tip:</strong> {round.tips}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Prep tips */}
            {post.preparationTips && (
              <section className="detail-section">
                <h2>Preparation Tips</h2>
                <div className="tips-box">{post.preparationTips}</div>
              </section>
            )}

            {/* Resources */}
            {post.resourcesUsed?.length > 0 && (
              <section className="detail-section">
                <h2>Resources Used</h2>
                <div className="tags-list">
                  {post.resourcesUsed.map((r, i) => <span key={i} className="tag-chip">{r}</span>)}
                </div>
              </section>
            )}

            {/* Other insights */}
            {post.otherInsights && (
              <section className="detail-section">
                <h2>Other Insights</h2>
                <p>{post.otherInsights}</p>
              </section>
            )}

            {/* Vote bar */}
            <div className="vote-bar">
              <button className={`vote-btn-lg ${userLiked ? 'active-like' : ''}`} onClick={handleLike} disabled={voting}>
                <ThumbsUp size={18} /> {likes} Helpful
              </button>
              <button className={`vote-btn-lg ${userDisliked ? 'active-dislike' : ''}`} onClick={handleDislike} disabled={voting}>
                <ThumbsDown size={18} /> {dislikes} Not Helpful
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="post-sidebar">
            <div className="sidebar-card">
              <h3>Quick Info</h3>
              <div className="info-rows">
                <div className="info-row"><span>Company</span><strong>{post.companyName}</strong></div>
                <div className="info-row"><span>Role</span><strong>{post.role}</strong></div>
                <div className="info-row"><span>Type</span><strong style={{ textTransform: 'capitalize' }}>{post.driveType}</strong></div>
                <div className="info-row"><span>Year</span><strong>{post.driveYear}</strong></div>
                <div className="info-row"><span>Result</span>
                  <strong style={{ color: post.isSelected ? 'var(--green)' : 'var(--red)' }}>
                    {post.isSelected ? '✓ Selected' : '✗ Not Selected'}
                  </strong>
                </div>
                {post.package && <div className="info-row"><span>Package</span><strong>{post.package}</strong></div>}
                {post.cgpa && <div className="info-row"><span>CGPA</span><strong>{post.cgpa}</strong></div>}
                <div className="info-row"><span>Branch</span><strong>{post.studentBranch}</strong></div>
                <div className="info-row"><span>Batch</span><strong>{post.studentPassingYear}</strong></div>
                <div className="info-row"><span>Rounds</span><strong>{post.rounds?.length || 0}</strong></div>
              </div>
            </div>

            {/* Actions */}
            {(isAuthor || isModerator) && (
              <div className="sidebar-card">
                <h3>Actions</h3>
                <div className="action-btns">
                  {isAuthor && (
                    <Link to={`/posts/${post._id}/edit`} className="btn btn-ghost btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      <Edit size={14} /> Edit Post
                    </Link>
                  )}
                  {isModerator && (
                    <button
                      className={`btn btn-sm ${post.isVerified ? 'btn-ghost' : 'btn-primary'}`}
                      style={{ width: '100%', justifyContent: 'center' }}
                      onClick={handleVerify}
                    >
                      <Shield size={14} /> {post.isVerified ? 'Unverify' : 'Verify Post'}
                    </button>
                  )}
                  {isAuthor && (
                    <button className="btn btn-danger btn-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDelete}>
                      <Trash2 size={14} /> Delete Post
                    </button>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
