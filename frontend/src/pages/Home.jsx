import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, TrendingUp, Users, BookOpen, ArrowRight, Star } from 'lucide-react';
import api from '../utils/api';
import './Home.css';

const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: color }}>
      <Icon size={18} />
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const CompanyButton = ({ company }) => (
  <Link to={`/companies/${company.slug}`} className="company-btn">
    <div className="company-btn-inner">
      <div className="company-btn-icon">
        {company.name[0].toUpperCase()}
      </div>
      <div className="company-btn-info">
        <span className="company-btn-name">{company.name}</span>
        <span className="company-btn-count">{company.postCount} experience{company.postCount !== 1 ? 's' : ''}</span>
      </div>
    </div>
    <ArrowRight size={14} className="company-btn-arrow" />
  </Link>
);

const Home = ({ onOpenChatbot }) => {
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/companies'),
      api.get('/admin/stats').catch(() => ({ data: { stats: {} } }))
    ]).then(([compRes, statsRes]) => {
      setCompanies(compRes.data.companies);
      setStats(statsRes.data.stats || {});
    }).finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <Star size={12} /> PVG College • Campus Placements
          </div>
          <h1 className="hero-title">
            Learn from <span className="hero-accent">real experiences</span> of your seniors
          </h1>
          <p className="hero-sub">
            CampusGuid collects and shares authentic campus drive experiences — both selected and non-selected — so you know exactly what to prepare and what to avoid.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary hero-cta" onClick={onOpenChatbot}>
              + Share Your Experience
            </button>
            <Link to="/companies" className="btn btn-ghost">
              Browse Companies <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats.totalPosts > 0 && (
        <section className="stats-section container">
          <StatCard icon={BookOpen} value={stats.totalPosts} label="Experiences shared" color="rgba(79,142,247,0.15)" />
          <StatCard icon={Building2} value={stats.totalCompanies} label="Companies covered" color="rgba(34,197,94,0.1)" />
          <StatCard icon={Users} value={stats.totalUsers} label="Students contributing" color="rgba(245,158,11,0.1)" />
          <StatCard icon={TrendingUp} value={stats.selectedPosts} label="Selection experiences" color="rgba(168,85,247,0.1)" />
        </section>
      )}

      {/* Companies Section */}
      <section className="companies-section container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Browse by Company</h2>
            <p className="section-sub">Click on a company to see all student experiences</p>
          </div>
          <Link to="/companies" className="btn btn-ghost btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="🔍  Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="company-search"
          />
        </div>

        {loading ? (
          <div className="companies-skeleton">
            {[...Array(6)].map((_, i) => <div key={i} className="company-btn-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Building2 size={40} />
            <p>{search ? `No companies matching "${search}"` : 'No companies yet. Be the first to share an experience!'}</p>
            <button className="btn btn-primary" onClick={onOpenChatbot}>+ Add Your Experience</button>
          </div>
        ) : (
          <div className="companies-grid">
            {filtered.map(c => <CompanyButton key={c._id} company={c} />)}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="cta-banner container">
        <div className="cta-content">
          <h2>Placed recently? Help your juniors!</h2>
          <p>Your experience — selected or not — is incredibly valuable. Share it in 5 minutes via our guided chatbot.</p>
          <button className="btn btn-primary" onClick={onOpenChatbot}>
            Share Experience <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
