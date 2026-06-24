import React from 'react';
import { Outlet } from 'react-router-dom';
import AssistantNavbar from './AssistantNavbar';
import Footer from './Footer';

const AssistantLayout = () => {
  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AssistantNavbar />
      <div className="bg-dental-pattern" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AssistantLayout;
