import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const DashboardRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      } else if (user.role === 'dentist') {
        navigate('/dashboard/dentist', { replace: true });
      } else if (user.role === 'assistant') {
        navigate('/dashboard/assistant', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="dashboard-loading-spinner">
      <div>Routing to dashboard...</div>
    </div>
  );
};

export default DashboardRedirect;
