import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard } from 'lucide-react';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <main className="dashboard-main">
      <div className="dashboard-welcome-banner">
        <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <LayoutDashboard size={28} /> Admin Control Center
        </h1>
        <p className="dashboard-subtitle">
          Welcome back, {user?.name || 'Administrator'}! You have full access to management tools.
        </p>
      </div>

      <div className="dashboard-grid">
        {['Manage Dentists & Staff', 'Patient Directories', 'Clinic Schedules', 'Financial Reports'].map((title, i) => (
          <div key={i} className="dashboard-card">
            <h3 className="dashboard-card-title">{title}</h3>
            <p className="dashboard-card-desc">
              Access details and configuration parameters for {title.toLowerCase()}.
            </p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AdminDashboard;
