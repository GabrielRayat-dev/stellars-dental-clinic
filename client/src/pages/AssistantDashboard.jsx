import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const AssistantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="dashboard-main">
      <Header 
        title="Assistant Workspace"
        subtitle={`Welcome, ${user?.name || 'Dental Assistant'}. Manage patient check-ins and appointments.`}
        onForward={() => navigate('/dashboard/assistant/schedule')}
      />

      <div className="dashboard-grid">
        {['Patient Check-In', 'Appointment Scheduling', 'Clinic Inventory & Supplies', 'Queue Management'].map((title, i) => (
          <div key={i} className="dashboard-card">
            <h3 className="dashboard-card-title">{title}</h3>
            <p className="dashboard-card-desc">
              Access assistants workflow tools for {title.toLowerCase()}.
            </p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default AssistantDashboard;
