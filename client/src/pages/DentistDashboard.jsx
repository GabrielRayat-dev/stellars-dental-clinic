import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const DentistDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="dashboard-main">
      <Header 
        title="Dentist Portal"
        subtitle={`Welcome, Dr. ${user?.name || 'Dentist'}. View your appointments and dental patients here.`}
        onForward={() => navigate('/dashboard/dentist/schedule')}
      />

      <div className="dashboard-grid">
        {['Today\'s Appointments', 'Patient Dental Records', 'Treatment Plans', 'My Work Schedule'].map((title, i) => (
          <div key={i} className="dashboard-card">
            <h3 className="dashboard-card-title">{title}</h3>
            <p className="dashboard-card-desc">
              Access and update dental treatment logs and lists for {title.toLowerCase()}.
            </p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default DentistDashboard;
