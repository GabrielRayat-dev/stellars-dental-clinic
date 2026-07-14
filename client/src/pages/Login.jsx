import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Modal from '../components/Modal';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password Modal States
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      setForgotMessage(data.message || 'OTP sent successfully');
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: forgotEmail, 
          otp: forgotOtp, 
          new_password: forgotNewPassword 
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to reset password');

      setForgotMessage('Password reset successfully. You can now log in.');
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotMessage('');
      }, 2000);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-page-container">
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
              onFooterLinkClick={() => {
                setIsForgotModalOpen(true);
                setForgotStep(1);
                setForgotError('');
                setForgotMessage('');
              }}
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

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <Modal 
          title="Forgot Password" 
          onClose={() => setIsForgotModalOpen(false)}
        >
          <div style={{ padding: '1rem' }}>
            {forgotError && (
              <div className="login-error-banner" style={{ marginBottom: '1rem' }}>
                {forgotError}
              </div>
            )}
            {forgotMessage && (
              <div style={{ color: 'green', marginBottom: '1rem', background: '#e6ffe6', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                {forgotMessage}
              </div>
            )}
            
            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp}>
                <FormInput
                  label="Enter your registered email"
                  id="forgotEmail"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="sample@gmail.com"
                  required
                />
                <div style={{ marginTop: '1.5rem' }}>
                  <Button type="submit" variant="primary" disabled={forgotLoading} style={{ width: '100%' }}>
                    {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <FormInput
                  label="OTP"
                  id="forgotOtp"
                  type="text"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  placeholder="Enter the OTP sent to your email"
                  required
                />
                <div style={{ marginTop: '1rem' }} />
                <FormInput
                  label="New Password"
                  id="forgotNewPassword"
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
                <div style={{ marginTop: '1.5rem' }}>
                  <Button type="submit" variant="primary" disabled={forgotLoading} style={{ width: '100%' }}>
                    {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Login;
