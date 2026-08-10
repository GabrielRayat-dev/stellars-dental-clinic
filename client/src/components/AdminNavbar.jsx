import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  ChevronDown,
  LogOut,
  UserCog,
} from 'lucide-react';
import Modal from './Modal';
import FormInput from './FormInput';
import Button from './Button';
import logo from '../assets/logo.jpg';
import '../styles/Navbar.css';

const adminNavLinks = [
  { label: 'Dashboard',       path: '/dashboard/admin',          icon: LayoutDashboard },
  { label: 'User Management', path: '/dashboard/admin/users',    icon: Users           },
  { label: 'Logs',            path: '/dashboard/admin/logs',     icon: ClipboardList   },
  { label: 'Settings',        path: '/dashboard/admin/settings', icon: Settings        },
];

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef(null);

  // Update Profile Modal States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateName, setUpdateName] = useState(user?.name || '');
  const [updatePhone, setUpdatePhone] = useState(user?.phone_number || '');
  const [updateError, setUpdateError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateLoading(true);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: updateName, phone_number: updatePhone })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update profile');
      
      // Reload page to refresh AuthContext and reflect changes
      window.location.reload(); 
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="navbar__brand" onClick={() => navigate('/dashboard/admin')}>
        <img src={logo} alt="Stellar's Logo" className="navbar__logo" />
        <span className="navbar__brand-text">Stellar's Dentist Clinic</span>
      </div>

      {/* Nav Links */}
      <ul className="navbar__links">
        {adminNavLinks.map(({ label, path, icon: Icon }) => {
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
          <span className="navbar__profile-name">{user?.name || 'Admin'}</span>
          <span className="navbar__profile-role">Admin</span>
        </div>
        <ChevronDown
          size={14}
          className={`navbar__chevron ${dropdownOpen ? 'navbar__chevron--open' : ''}`}
        />

        {/* Dropdown — controlled by state */}
        {dropdownOpen && (
          <div className="navbar__dropdown">
            <div className="navbar__dropdown-info">
              <span className="navbar__dropdown-name">{user?.name || 'Admin'}</span>
              <span className="navbar__dropdown-role">{user?.role || 'Admin'}</span>
              {user?.email && <span className="navbar__dropdown-detail">{user.email}</span>}
              {user?.phone_number && <span className="navbar__dropdown-detail">{user.phone_number}</span>}
            </div>
            <button
              className="navbar__dropdown-item"
              onClick={(e) => { 
                e.stopPropagation(); 
                setUpdateName(user?.name || '');
                setUpdatePhone(user?.phone_number || '');
                setUpdateError('');
                setIsUpdateModalOpen(true);
                setDropdownOpen(false);
              }}
            >
              <UserCog size={14} />
              Update Profile
            </button>
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

      {/* Update Profile Modal */}
      {isUpdateModalOpen && (
        <Modal title="Update Profile" onClose={() => setIsUpdateModalOpen(false)}>
          <form style={{ padding: '1rem' }} onSubmit={handleUpdateProfile}>
            {updateError && (
              <div style={{ color: '#d32f2f', marginBottom: '1rem', background: '#ffebee', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                {updateError}
              </div>
            )}
            <FormInput
              label="Full Name"
              value={updateName}
              onChange={(e) => setUpdateName(e.target.value)}
              required
            />
            <div style={{ marginTop: '1rem' }} />
            <FormInput
              label="Phone Number"
              value={updatePhone}
              onChange={(e) => setUpdatePhone(e.target.value)}
            />
            <div style={{ marginTop: '1.5rem' }}>
              <Button type="submit" variant="primary" style={{ width: '100%' }} disabled={updateLoading}>
                {updateLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </nav>
  );
};

export default AdminNavbar;
