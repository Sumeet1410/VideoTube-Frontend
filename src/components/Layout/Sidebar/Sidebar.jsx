import { NavLink } from 'react-router-dom';
import {
  HiHome,
  HiClock,
  HiThumbUp,
  HiCollection,
  HiCog,
  HiViewGrid,
  HiOutlineUpload,
  HiUserCircle,
  HiChatAlt2,
  HiUserGroup,
} from 'react-icons/hi';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';

const publicLinks = [
  { to: '/', icon: <HiHome size={20} />, label: 'Home' },
  { to: '/community', icon: <HiChatAlt2 size={20} />, label: 'Community' },
];

export default function Sidebar({ isOpen }) {
  const { user, isAuthenticated } = useAuth();

  const authLinks = [
    ...(user?.username ? [{ to: `/channel/${user.username}`, icon: <HiUserCircle size={20} />, label: 'Your Channel' }] : []),
    { to: '/subscriptions', icon: <HiUserGroup size={20} />, label: 'Subscriptions' },
    { to: '/history', icon: <HiClock size={20} />, label: 'History' },
    { to: '/liked-videos', icon: <HiThumbUp size={20} />, label: 'Liked Videos' },
    { to: '/playlists', icon: <HiCollection size={20} />, label: 'Playlists' },
    { to: '/upload', icon: <HiOutlineUpload size={20} />, label: 'Upload' },
    { to: '/dashboard', icon: <HiViewGrid size={20} />, label: 'Dashboard' },
    { to: '/settings', icon: <HiCog size={20} />, label: 'Settings' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-collapsed'}`} id="main-sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span className="sidebar-label">{link.label}</span>
            </NavLink>
          ))}
        </div>

        {isAuthenticated && (
          <>
            <div className="sidebar-divider" />
            <div className="sidebar-section">
              <span className="sidebar-section-title">You</span>
              {authLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                  }
                >
                  <span className="sidebar-icon">{link.icon}</span>
                  <span className="sidebar-label">{link.label}</span>
                </NavLink>
              ))}
            </div>
          </>
        )}

        <div className="sidebar-footer">
          <p className="sidebar-footer-text">© 2026 VideoTube</p>
        </div>
      </div>
    </aside>
  );
}
