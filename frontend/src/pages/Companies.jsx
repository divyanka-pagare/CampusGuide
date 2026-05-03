import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, Search } from 'lucide-react';
import api from '../utils/api';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/companies').then(r => setCompanies(r.data.companies)).finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>All Companies</h1>
        <p style={{ color: 'var(--text3)', marginTop: 6, fontSize: '0.875rem' }}>
          {companies.length} companies with shared experiences
        </p>
      </div>

      <div style={{ position: 'relative', maxWidth: 400, marginBottom: 28 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search companies..."
          style={{ paddingLeft: 40 }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} style={{ height: 80, background: 'var(--surface)', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text3)' }}>
          <Building2 size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p>No companies found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {filtered.map(c => (
            <Link
              key={c._id}
              to={`/companies/${c.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 18px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s',
              }}
              className="company-link-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 11,
                  background: 'var(--accent-glow)',
                  border: '1px solid rgba(79,142,247,0.2)',
                  color: 'var(--accent2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
                  flexShrink: 0
                }}>
                  {c.name[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: 2 }}>
                    {c.postCount} experience{c.postCount !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text3)' }} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
