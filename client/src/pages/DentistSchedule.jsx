import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const DentistSchedule = () => {
  const navigate = useNavigate();

  return (
    <main className="dashboard-main">
      <Header 
        title={<><Calendar size={28} /> Schedule Appointment</>}
        subtitle="Manage your upcoming appointments and schedule."
        onBack={() => navigate('/dashboard/dentist')}
        onForward={() => navigate('/dashboard/dentist/patients')}
      />
      
      <div className="dashboard-grid">
        {/* Empty for now as requested */}
      </div>
    </main>
  );
};

export default DentistSchedule;
