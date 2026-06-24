import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import logo from '../assets/logo.jpg';
import '../styles/Navbar.css';

const assistantNavLinks = [
  { label: 'Dashboard',            path: '/dashboard/assistant',          icon: LayoutDashboard },
  { label: 'Schedule Appointment', path: '/dashboard/assistant/schedule', icon: Calendar        },
];

const AssistantNavbar = () => {
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
    : 'AS';

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__brand" onClick={() => navigate('/dashboard/assistant')}>
        <img src={logo} alt="Stellar's Logo" className="navbar__logo" />
        <span className="navbar__brand-text">Stellar's Dentist Clinic</span>
      </div>

      {/* Nav Links */}
      <ul className="navbar__links">
        {assistantNavLinks.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <li key={label}>
              <button
                className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                onClick={() => navigate(path)}
              >
                <Icon size={16} className="navbar__link-icon" />
                <span>{label}</span>
                {isActive && <span className="navbar__link-indicator" />}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Profile — click to toggle dropdown */}
      <div
        ref={profileRef}
        className={`navbar__profile ${dropdownOpen ? 'navbar__profile--open' : ''}`}
        onClick={() => setDropdownOpen((prev) => !prev)}
      >
        <div className="navbar__avatar">{initials}</div>
        <div className="navbar__profile-info">
          <span className="navbar__profile-name">{user?.name || 'Assistant'}</span>
          <span className="navbar__profile-role">Assistant</span>
        </div>
        <ChevronDown
          size={14}
          className={`navbar__chevron ${dropdownOpen ? 'navbar__chevron--open' : ''}`}
        />

        {/* Dropdown — controlled by state */}
        {dropdownOpen && (
          <div className="navbar__dropdown">
            <div className="navbar__dropdown-info">
              <span className="navbar__dropdown-name">{user?.name || 'Assistant'}</span>
              <span className="navbar__dropdown-role">{user?.role || 'Assistant'}</span>
              {user?.email && <span className="navbar__dropdown-detail">{user.email}</span>}
              {user?.phone_number && <span className="navbar__dropdown-detail">{user.phone_number}</span>}
            </div>
            <button
              className="navbar__dropdown-item"
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

export default AssistantNavbar;
