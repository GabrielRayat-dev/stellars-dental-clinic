import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';

const DentistDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="bg-dental-pattern" />

      <main className="dashboard-main">
        <div className="dashboard-welcome-banner">
          <h1 className="dashboard-title">Dentist Portal</h1>
          <p className="dashboard-subtitle">
            Welcome, Dr. {user?.name || 'Dentist'}. View your appointments and dental patients here.
          </p>
        </div>

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
    </div>
  );
};

export default DentistDashboard;
