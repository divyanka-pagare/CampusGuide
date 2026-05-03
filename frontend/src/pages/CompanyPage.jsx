import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Filter, SortAsc, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import PostCard from '../components/common/PostCard';
import './CompanyPage.css';

const CompanyPage = () => {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Filters
  const [filters, setFilters] = useState({
    isSelected: '',
    driveType: '',
    passingYear: '',
    branch: '',
    sort: '-createdAt'
  });

  const fetchCompany = useCallback(async () => {
    try {
      const res = await api.get(`/companies/${slug}`);
      setCompany(res.data.company);
    } catch { setCompany(null); }
  }, [slug]);

  const fetchPosts = useCallback(async () => {
    if (!company) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        company: company._id,
        page,
        limit: 12,
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
      });
      const res = await api.get(`/posts?${params}`);
      setPosts(res.data.posts);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }, [company, filters, page]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);
  useEffect(() => { if (company) fetchPosts(); }, [fetchPosts, company]);

  const setFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const handleDelete = (id) => setPosts(p => p.filter(post => post._id !== id));
  const handleUpdate = (updated) => setPosts(p => p.map(post => post._id === updated._id ? updated : post));

  const selectedPosts = posts.filter(p => p.isSelected);
  const notSelectedPosts = posts.filter(p => !p.isSelected);

  if (!company && !loading) return (
    <div className="company-page container">
      <div className="empty-state" style={{ paddingTop: 80 }}>
        <Building2 size={48} />
        <p>Company not found.</p>
      </div>
    </div>
  );

  return (
    <div className="company-page">
      {/* Company Header */}
      <div className="company-header">
        <div className="container company-header-inner">
          <div className="company-icon-lg">
            {company?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="company-page-title">{company?.name || 'Loading...'}</h1>
            <p className="company-page-sub">{company?.postCount || 0} experiences shared</p>
          </div>
        </div>
      </div>

      <div className="container company-page-body">
        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-group">
            <Filter size={14} />
            <select value={filters.isSelected} onChange={e => setFilter('isSelected', e.target.value)}>
              <option value="">All Results</option>
              <option value="true">✓ Selected</option>
              <option value="false">✗ Not Selected</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={filters.driveType} onChange={e => setFilter('driveType', e.target.value)}>
              <option value="">All Types</option>
              <option value="placement">Placement</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className="filter-group">
            <select value={filters.passingYear} onChange={e => setFilter('passingYear', e.target.value)}>
              <option value="">All Batches</option>
              {[2024, 2025, 2026, 2027, 2028].map(y => (
                <option key={y} value={y}>{y} Batch</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select value={filters.branch} onChange={e => setFilter('branch', e.target.value)}>
              <option value="">All Branches</option>
              {['CSE','IT','ECE','EEE','ME','CE','OTHER'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <SortAsc size={14} />
            <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}>
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="-likeCount">Most Liked</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="posts-loading">
            {[...Array(6)].map((_, i) => <div key={i} className="post-skeleton" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p>No experiences found with these filters.</p>
          </div>
        ) : filters.isSelected === '' ? (
          /* Split view: Selected / Not Selected */
          <div className="split-view">
            <div className="split-section">
              <div className="split-header selected">
                <CheckCircle size={18} />
                <h2>Selected ({selectedPosts.length})</h2>
                <span className="split-tip">Learn what worked ✨</span>
              </div>
              {selectedPosts.length === 0
                ? <p className="split-empty">No selected experiences yet.</p>
                : <div className="posts-grid">
                    {selectedPosts.map(p => (
                      <PostCard key={p._id} post={p} onDelete={handleDelete} onUpdate={handleUpdate} />
                    ))}
                  </div>
              }
            </div>

            <div className="split-section">
              <div className="split-header not-selected">
                <XCircle size={18} />
                <h2>Not Selected ({notSelectedPosts.length})</h2>
                <span className="split-tip">Learn what to avoid 🔍</span>
              </div>
              {notSelectedPosts.length === 0
                ? <p className="split-empty">No non-selected experiences yet.</p>
                : <div className="posts-grid">
                    {notSelectedPosts.map(p => (
                      <PostCard key={p._id} post={p} onDelete={handleDelete} onUpdate={handleUpdate} />
                    ))}
                  </div>
              }
            </div>
          </div>
        ) : (
          /* Filtered single view */
          <div className="posts-grid">
            {posts.map(p => (
              <PostCard key={p._id} post={p} onDelete={handleDelete} onUpdate={handleUpdate} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                className={`page-btn ${page === i+1 ? 'active' : ''}`}
                onClick={() => setPage(i+1)}
              >{i+1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyPage;
