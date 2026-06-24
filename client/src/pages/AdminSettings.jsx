import React from 'react';
import { Settings } from 'lucide-react';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const AdminSettings = () => (
  <main className="dashboard-main">
    <Header 
      title={<><Settings size={28} /> Settings</>}
      subtitle="Configure clinic preferences and system settings."
    />
  </main>
);

export default AdminSettings;
