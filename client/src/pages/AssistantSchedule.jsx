import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import Header from '../components/Header';
import '../styles/Dashboard.css';

const AssistantSchedule = () => {
  const navigate = useNavigate();

  return (
    <main className="dashboard-main">
      <Header 
        title={<><Calendar size={28} /> Schedule Appointment</>}
        subtitle="Manage upcoming appointments and schedule."
        onBack={() => navigate('/dashboard/assistant')}
      />
      
      <div className="dashboard-grid">
        {/* Empty for now as requested */}
      </div>
    </main>
  );
};

export default AssistantSchedule;
