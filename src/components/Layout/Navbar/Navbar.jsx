import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiMenu, HiSearch, HiUpload, HiOutlineBell, HiX } from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import Avatar from '../../UI/Avatar';
import Button from '../../UI/Button';
import './Navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    setSearchQuery(urlSearch);
  }, [urlSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    navigate('/');
  };

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="navbar glass" id="main-navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <HiMenu size={22} />
        </button>
        <Link to="/" className="navbar-logo" id="navbar-logo">
          <span className="logo-icon">▶</span>
          <span className="logo-text">VideoTube</span>
        </Link>
      </div>

      <form className="navbar-search" onSubmit={handleSearch} id="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            id="search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClearSearch}
              title="Clear search"
              aria-label="Clear search"
              id="search-clear-btn"
            >
              <HiX size={18} />
            </button>
          )}
          <button type="submit" className="search-btn" aria-label="Search" id="search-btn">
            <HiSearch size={18} />
          </button>
        </div>
      </form>

      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <Link to="/upload" className="navbar-icon-btn" title="Upload video" id="upload-btn">
              <HiUpload size={20} />
            </Link>
            <button className="navbar-icon-btn" title="Notifications">
              <HiOutlineBell size={20} />
            </button>
            <div className="user-menu-container">
              <button
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
                id="user-menu-trigger"
              >
                <Avatar src={user?.avatar} name={user?.fullName} size={34} />
              </button>
              {showUserMenu && (
                <div className="user-dropdown glass animate-fade-in-down" id="user-dropdown">
                  <div className="dropdown-header">
                    <Avatar src={user?.avatar} name={user?.fullName} size={44} />
                    <div className="dropdown-user-info">
                      <span className="dropdown-name">{user?.fullName}</span>
                      <span className="dropdown-username">@{user?.username}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to={`/channel/${user?.username}`} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    Your channel
                  </Link>
                  <Link to="/community" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    Community & Posts
                  </Link>
                  <Link to="/dashboard" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    Dashboard
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    Settings
                  </Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login">
            <Button variant="primary" size="sm" id="login-btn">Sign in</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
