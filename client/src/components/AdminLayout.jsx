import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { LayoutDashboard, Users, ClipboardList, Settings } from 'lucide-react';

const adminNavLinks = [
  { label: 'Dashboard',       path: '/dashboard/admin',          icon: LayoutDashboard },
  { label: 'User Management', path: '/dashboard/admin/users',    icon: Users           },
  { label: 'Logs',            path: '/dashboard/admin/logs',     icon: ClipboardList   },
  { label: 'Settings',        path: '/dashboard/admin/settings', icon: Settings        },
];

const AdminLayout = () => {
  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar customNavLinks={adminNavLinks} />
      <div className="bg-dental-pattern" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;
