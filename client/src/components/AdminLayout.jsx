import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const AdminLayout = () => {
  return (
    <div className="dashboard-container">
      <AdminNavbar />
      <div className="bg-dental-pattern" />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
