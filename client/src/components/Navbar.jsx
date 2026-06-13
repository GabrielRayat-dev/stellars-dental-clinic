import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Info, Stethoscope, Calendar, HelpCircle, LogIn } from 'lucide-react';
import logo from '../assets/logo.jpg';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const isLoginPage = location.pathname === '/login';

  const navLinks = [
    { label: 'About Us', href: '#about', icon: Info },
    { label: 'Services', href: '#services', icon: Stethoscope },
    { label: 'Schedule Appointment', href: '#appointment', icon: Calendar },
    { label: 'FAQs', href: '#faqs', icon: HelpCircle }
  ];

  return (
    <nav className="navbar-container">
      {/* Logo Section */}
      <div onClick={() => navigate('/')} className="navbar-logo-section">
        <img src={logo} alt="Stellar's Logo" className="navbar-logo-img" />
        <span className="navbar-logo-text">Stellar's</span>
      </div>

      {/* Nav Links */}
      <div className="navbar-links-container">
        {navLinks.map((link) => {
          const IconComponent = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => {
                if (location.pathname !== '/') {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => {
                    const el = document.querySelector(link.href);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="navbar-link-item"
            >
              <IconComponent className="navbar-link-icon" size={16} />
              <span className="navbar-link-text" data-text={link.label}>
                {link.label}
              </span>
            </a>
          );
        })}
      </div>

      {/* Auth Action Button */}
      <div className="navbar-auth-section">
        {isAuthenticated ? (
          <>
            <span onClick={() => navigate('/dashboard')} className="navbar-profile-greeting">
              Hi, {user?.name || 'User'} ({user?.role})
            </span>
            <button onClick={logout} className="navbar-logout-btn">
              Log out
            </button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} className="navbar-login-btn">
            <LogIn size={16} />
            Log in
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
