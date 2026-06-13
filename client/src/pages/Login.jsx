import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const role = result.profile.role;
      if (role === 'admin') {
        navigate('/dashboard/admin');
      } else if (role === 'dentist') {
        navigate('/dashboard/dentist');
      } else if (role === 'assistant') {
        navigate('/dashboard/assistant');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <Navbar />

      {/* Repeating mint dental pattern background */}
      <div className="bg-dental-pattern" />

      {/* Main Container */}
      <main className="login-main">
        {/* Login Card */}
        <div className="login-card animate-fade-in">
          {/* Header */}
          <h1 className="login-card-title">Log In</h1>
          
          <p className="login-card-subtitle">
            Hi! Please enter your details to login to your account
          </p>

          {/* Form Error Banner */}
          {error && (
            <div className="login-error-banner">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <FormInput
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sample@gmail.com"
              required
              footerLinkText="Forgot email"
              onFooterLinkClick={() => alert('Forgot email clicked')}
            />

            <FormInput
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              required
              footerLinkText="Forgot password"
              onFooterLinkClick={() => alert('Forgot password clicked')}
            />

            <div className="login-submit-wrapper">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="login-submit-btn-custom"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Text Matching Mockup */}
      <footer className="login-footer">
        Not too sure what to put here lmao
      </footer>
    </div>
  );
};

export default Login;
