import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const DentistPatients = () => {
  const navigate = useNavigate();

  return (
    <main className="dashboard-main">
      <Header 
        title={<><ClipboardList size={28} /> Patient Record</>}
        subtitle="View and manage dental records of your patients."
        onBack={() => navigate('/dashboard/dentist/schedule')}
      />
      
      <div className="dashboard-grid">
        {/* Empty for now as requested */}
      </div>
    </main>
  );
};

export default DentistPatients;
