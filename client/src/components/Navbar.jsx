import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Info, Stethoscope, Calendar, HelpCircle, LogIn, ChevronDown, LogOut, UserCog } from 'lucide-react';
import { apiFetch } from '../api';
import Modal from './Modal';
import FormInput from './FormInput';
import Button from './Button';
import logo from '../assets/logo.jpg';
import '../styles/Navbar.css';

const Navbar = ({ customNavLinks }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);
  const navRef = useRef(null);

  // Update Profile Modal States
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateName, setUpdateName] = useState(user?.name || '');
  const [updatePhone, setUpdatePhone] = useState(user?.phone_number || '');
  const [updateError, setUpdateError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const defaultNavLinks = [
    { label: 'About Us', href: '#about', icon: Info },
    { label: 'Services', href: '#services', icon: Stethoscope },
    { label: 'Schedule Appointment', href: '#appointment', icon: Calendar },
    { label: 'FAQs', href: '#faqs', icon: HelpCircle }
  ];

  const displayLinks = customNavLinks || defaultNavLinks;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'US';

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setUpdateLoading(true);
    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
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
    <nav className="navbar" ref={navRef}>
      {/* Logo Section */}
      <div onClick={() => navigate('/')} className="navbar__brand">
        <img src={logo} alt="Stellar's Logo" className="navbar__logo" />
        <span className="navbar__brand-text">Stellar's Dentist Clinic</span>
      </div>

      {/* Mobile Menu Wrapper */}
      <div className={`navbar__menu ${mobileMenuOpen ? 'navbar__menu--open' : ''}`}>
        <ul className="navbar__links">
          {displayLinks.map((link) => {
            const IconComponent = link.icon;
            const isActive = link.path ? location.pathname === link.path : false;
            return (
              <li key={link.label}>
                {link.path ? (
                  <button
                    className={`navbar__link ${isActive ? 'navbar__link--active' : ''}`}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate(link.path);
                    }}
                  >
                    <IconComponent size={16} className="navbar__link-icon" />
                    <span>{link.label}</span>
                    {isActive && <span className="navbar__link-indicator" />}
                  </button>
                ) : (
                  <a
                    href={link.href}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (location.pathname !== '/') {
                        e.preventDefault();
                        navigate('/');
                        setTimeout(() => {
                          const el = document.querySelector(link.href);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }
                    }}
                    className="navbar__link"
                  >
                    <IconComponent className="navbar__link-icon" size={16} />
                    <span>{link.label}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Actions: Hamburger + Profile / Login */}
      <div className="navbar__actions">
        {/* Hamburger Icon for Mobile */}
        <button 
          className="navbar__mobile-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? 'hamburger--open' : ''}`}></span>
        </button>

        {isAuthenticated ? (
          <div
            ref={profileRef}
            className={`navbar__profile ${dropdownOpen ? 'navbar__profile--open' : ''}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="navbar__avatar">{initials}</div>
            <div className="navbar__profile-info">
              <span className="navbar__profile-name">{user?.name || 'User'}</span>
              <span className="navbar__profile-role">{user?.role || 'Guest'}</span>
            </div>
            <ChevronDown
              size={14}
              className={`navbar__chevron ${dropdownOpen ? 'navbar__chevron--open' : ''}`}
            />

            {dropdownOpen && (
              <div className="navbar__dropdown">
                <div className="navbar__dropdown-info">
                  <span className="navbar__dropdown-name">{user?.name || 'User'}</span>
                  <span className="navbar__dropdown-role">{user?.role || 'Guest'}</span>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                    navigate('/');
                  }}
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/login');
            }} 
            className="navbar__login-btn"
          >
            <LogIn size={16} />
            Log in
          </button>
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

export default Navbar;
