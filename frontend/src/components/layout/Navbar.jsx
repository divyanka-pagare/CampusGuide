import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Shield, Menu, X, BookOpen, ChevronDown } from 'lucide-react';
import './Navbar.css';

const ROLE_COLORS = {
  admin:     { bg: '#f59e0b22', color: '#f59e0b', label: '👑 Owner/Admin' },
  principal: { bg: '#a78bfa22', color: '#a78bfa', label: '🎓 Principal' },
  tpo:       { bg: '#22c55e22', color: '#22c55e', label: '💼 TPO' },
  student:   { bg: '#4f8ef722', color: '#4f8ef7', label: '🎒 Student' },
};

const Navbar = ({ onOpenChatbot }) => {
  const { user, logout, isModerator } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roleInfo = ROLE_COLORS[user?.role] || ROLE_COLORS.student;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon"><BookOpen size={20} /></span>
          <span className="logo-text">Campus<strong>Guid</strong></span>
          <span className="logo-college">PVG</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/companies" onClick={() => setMenuOpen(false)}>Companies</NavLink>
          {user && <NavLink to="/my-posts" onClick={() => setMenuOpen(false)}>My Posts</NavLink>}
          {isModerator && <NavLink to="/admin" onClick={() => setMenuOpen(false)}>Admin</NavLink>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => { onOpenChatbot(); setMenuOpen(false); }}>
                + Add Experience
              </button>

              <div className="user-menu" ref={dropdownRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setDropdownOpen(o => !o)}
                >
                  <div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div>
                  <div className="user-avatar-info">
                    <span className="user-avatar-name">{user.name?.split(' ')[0]}</span>
                    <span className="user-avatar-role" style={{ color: roleInfo.color }}>
                      {roleInfo.label}
                    </span>
                  </div>
                  <ChevronDown size={14} style={{ color: 'var(--text3)', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown">
                    {/* Role badge */}
                    <div className="dropdown-role-badge" style={{ background: roleInfo.bg, borderColor: roleInfo.color + '44' }}>
                      <span style={{ color: roleInfo.color, fontWeight: 700, fontSize: '0.82rem' }}>
                        {roleInfo.label}
                      </span>
                      <span style={{ color: 'var(--text3)', fontSize: '0.72rem' }}>{user.email}</span>
                    </div>

                    <div className="divider" style={{ margin: '6px 0' }} />

                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <User size={14} /> My Profile
                    </Link>
                    <Link to="/my-posts" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <BookOpen size={14} /> My Posts
                    </Link>
                    {isModerator && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <Shield size={14} /> Admin Panel
                      </Link>
                    )}

                    <div className="divider" style={{ margin: '6px 0' }} />

                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
          <button className="menu-toggle" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;