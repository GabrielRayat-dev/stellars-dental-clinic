import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard } from 'lucide-react';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <main className="dashboard-main">
      <Header 
        title={<><LayoutDashboard size={28} /> Admin Control Center</>}
        subtitle={`Welcome back, ${user?.name || 'Administrator'}! You have full access to management tools.`}
      />

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
