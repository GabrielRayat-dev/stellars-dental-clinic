import React from 'react';
import { Outlet } from 'react-router-dom';
import DentistNavbar from './DentistNavbar';
import Footer from './Footer';

const DentistLayout = () => {
  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DentistNavbar />
      <div className="bg-dental-pattern" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default DentistLayout;
