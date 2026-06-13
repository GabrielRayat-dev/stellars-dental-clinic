import React from 'react';
import { Settings } from 'lucide-react';
import '../styles/Dashboard.css';

const AdminSettings = () => (
  <main className="dashboard-main">
    <div className="dashboard-welcome-banner">
      <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Settings size={28} /> Settings
      </h1>
      <p className="dashboard-subtitle">Configure clinic preferences and system settings.</p>
    </div>
  </main>
);

export default AdminSettings;
