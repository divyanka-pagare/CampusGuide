import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, CheckCircle, Briefcase, GraduationCap, Edit, Trash2, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import './PostCard.css';

const PostCard = ({ post, onDelete, onUpdate }) => {
  const { user, isModerator } = useAuth();
  const [likes, setLikes] = useState(post.likeCount || post.likes?.length || 0);
  const [dislikes, setDislikes] = useState(post.dislikeCount || post.dislikes?.length || 0);
  const [userLiked, setUserLiked] = useState(post.likes?.includes(user?._id));
  const [userDisliked, setUserDisliked] = useState(post.dislikes?.includes(user?._id));
  const [voting, setVoting] = useState(false);

  const isAuthor = user?._id === (post.author?._id || post.author);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to like posts'); return; }
    if (voting) return;
    setVoting(true);
    try {
      const res = await api.post(`/posts/${post._id}/like`);
      setLikes(res.data.likeCount);
      setDislikes(res.data.dislikeCount);
      setUserLiked(res.data.liked);
      if (res.data.liked) setUserDisliked(false);
    } catch { toast.error('Failed to like'); }
    finally { setVoting(false); }
  };

  const handleDislike = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to vote'); return; }
    if (voting) return;
    setVoting(true);
    try {
      const res = await api.post(`/posts/${post._id}/dislike`);
      setLikes(res.data.likeCount);
      setDislikes(res.data.dislikeCount);
      setUserDisliked(res.data.disliked);
      if (res.data.disliked) setUserLiked(false);
    } catch { toast.error('Failed to vote'); }
    finally { setVoting(false); }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post deleted');
      onDelete?.(post._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAdminDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm('Remove this post as admin?')) return;
    try {
      await api.delete(`/admin/posts/${post._id}`);
      toast.success('Post removed');
      onDelete?.(post._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/admin/posts/${post._id}/verify`);
      toast.success(res.data.message);
      onUpdate?.({ ...post, isVerified: res.data.isVerified });
    } catch (err) {
      toast.error('Failed to verify');
    }
  };

  return (
    <Link to={`/posts/${post._id}`} className="post-card card">
      <div className="post-card-header">
        <div className="post-card-badges">
          <span className={`badge ${post.isSelected ? 'badge-green' : 'badge-red'}`}>
            {post.isSelected ? '✓ Selected' : '✗ Not Selected'}
          </span>
          <span className="badge badge-blue">{post.driveType}</span>
          {post.isVerified && (
            <span className="badge badge-amber" title={`Verified by ${post.verifiedBy?.name || 'admin'}`}>
              <Shield size={10} /> Verified
            </span>
          )}
        </div>
        {(isAuthor || isModerator) && (
          <div className="post-card-actions" onClick={e => e.preventDefault()}>
            {isAuthor && (
              <Link to={`/posts/${post._id}/edit`} className="icon-btn" title="Edit">
                <Edit size={14} />
              </Link>
            )}
            {isAuthor && (
              <button className="icon-btn danger" onClick={handleDelete} title="Delete">
                <Trash2 size={14} />
              </button>
            )}
            {isModerator && (
              <button
                className={`icon-btn ${post.isVerified ? 'active' : ''}`}
                onClick={handleVerify}
                title={post.isVerified ? 'Unverify' : 'Verify'}
              >
                <Shield size={14} />
              </button>
            )}
            {isModerator && !isAuthor && (
              <button className="icon-btn danger" onClick={handleAdminDelete} title="Admin Remove">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>

      <h3 className="post-card-title">{post.title}</h3>
      <p className="post-card-overview">{post.overview?.slice(0, 120)}...</p>

      <div className="post-card-meta">
        <span><Briefcase size={13} /> {post.role}</span>
        <span><GraduationCap size={13} /> {post.studentPassingYear} batch</span>
        <span className="meta-branch">{post.studentBranch}</span>
        {post.driveYear && <span>Drive: {post.driveYear}</span>}
      </div>

      <div className="post-card-footer">
        <div className="post-author">
          <div className="author-avatar">{post.author?.name?.[0]?.toUpperCase()}</div>
          <span>{post.author?.name || 'Student'}</span>
        </div>
        <div className="post-votes" onClick={e => e.preventDefault()}>
          <button
            className={`vote-btn ${userLiked ? 'active-like' : ''}`}
            onClick={handleLike}
            disabled={voting}
          >
            <ThumbsUp size={14} /> {likes}
          </button>
          <button
            className={`vote-btn ${userDisliked ? 'active-dislike' : ''}`}
            onClick={handleDislike}
            disabled={voting}
          >
            <ThumbsDown size={14} /> {dislikes}
          </button>
        </div>
      </div>

      {post.rounds?.length > 0 && (
        <div className="post-rounds-preview">
          {post.rounds.slice(0, 3).map((r, i) => (
            <span key={i} className="round-chip">{r.roundName}</span>
          ))}
          {post.rounds.length > 3 && <span className="round-chip muted">+{post.rounds.length - 3} more</span>}
        </div>
      )}
    </Link>
  );
};

export default PostCard;
