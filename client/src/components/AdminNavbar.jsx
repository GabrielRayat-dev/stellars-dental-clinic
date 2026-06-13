import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import logo from '../assets/logo.jpg';
import '../styles/AdminNavbar.css';

const adminNavLinks = [
  { label: 'Dashboard',       path: '/dashboard/admin',          icon: LayoutDashboard },
  { label: 'User Management', path: '/dashboard/admin/users',    icon: Users           },
  { label: 'Logs',            path: '/dashboard/admin/logs',     icon: ClipboardList   },
  { label: 'Settings',        path: '/dashboard/admin/settings', icon: Settings        },
];

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';

  return (
    <nav className="admin-navbar">
      {/* Logo */}
      <div className="admin-navbar__brand" onClick={() => navigate('/dashboard/admin')}>
        <img src={logo} alt="Stellar's Logo" className="admin-navbar__logo" />
        <span className="admin-navbar__brand-text">Stellar's Dentist Clinic</span>
      </div>

      {/* Nav Links */}
      <ul className="admin-navbar__links">
        {adminNavLinks.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <li key={label}>
              <button
                className={`admin-navbar__link ${isActive ? 'admin-navbar__link--active' : ''}`}
                onClick={() => navigate(path)}
              >
                <Icon size={16} className="admin-navbar__link-icon" />
                <span>{label}</span>
                {isActive && <span className="admin-navbar__link-indicator" />}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Profile — click to toggle dropdown */}
      <div
        ref={profileRef}
        className={`admin-navbar__profile ${dropdownOpen ? 'admin-navbar__profile--open' : ''}`}
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        <div className="admin-navbar__avatar">{initials}</div>
        <div className="admin-navbar__profile-info">
          <span className="admin-navbar__profile-name">{user?.name || 'Admin'}</span>
          <span className="admin-navbar__profile-role">Admin</span>
        </div>
        <ChevronDown
          size={14}
          className={`admin-navbar__chevron ${dropdownOpen ? 'admin-navbar__chevron--open' : ''}`}
        />

        {/* Dropdown — controlled by state */}
        {dropdownOpen && (
          <div className="admin-navbar__dropdown">
            <button
              className="admin-navbar__dropdown-item"
              onClick={(e) => { e.stopPropagation(); logout(); }}
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
