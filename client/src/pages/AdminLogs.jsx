import React from 'react';
import { ClipboardList } from 'lucide-react';
import '../styles/Dashboard.css';

const AdminLogs = () => (
  <main className="dashboard-main">
    <div className="dashboard-welcome-banner">
      <h1 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <ClipboardList size={28} /> Logs
      </h1>
      <p className="dashboard-subtitle">View system and activity logs.</p>
    </div>
  </main>
);

export default AdminLogs;
