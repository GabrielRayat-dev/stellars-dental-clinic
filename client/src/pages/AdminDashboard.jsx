import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="bg-dental-pattern" />

      <main className="dashboard-main">
        <div className="dashboard-welcome-banner">
          <h1 className="dashboard-title">Admin Control Center</h1>
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
    </div>
  );
};

export default AdminDashboard;
