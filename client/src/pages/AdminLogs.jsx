import React from 'react';
import { ClipboardList } from 'lucide-react';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const AdminLogs = () => (
  <main className="dashboard-main">
    <Header 
      title={<><ClipboardList size={28} /> Logs</>}
      subtitle="View system and activity logs."
    />
  </main>
);

export default AdminLogs;
