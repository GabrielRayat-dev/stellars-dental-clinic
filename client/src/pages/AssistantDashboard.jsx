import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const AssistantDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="bg-dental-pattern" />

      <main className="dashboard-main">
        <div className="dashboard-welcome-banner">
          <h1 className="dashboard-title">Assistant Workspace</h1>
          <p className="dashboard-subtitle">
            Welcome, {user?.name || 'Dental Assistant'}. Manage patient check-ins and appointments.
          </p>
        </div>

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
    </div>
  );
};

export default AssistantDashboard;
