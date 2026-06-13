import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardRedirect from './pages/DashboardRedirect';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLogs from './pages/AdminLogs';
import AdminSettings from './pages/AdminSettings';
import DentistDashboard from './pages/DentistDashboard';
import AssistantDashboard from './pages/AssistantDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Role-based Dashboard routing */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes — nested under AdminLayout so navbar persists */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route
            path="/dashboard/dentist"
            element={
              <ProtectedRoute allowedRoles={['dentist']}>
                <DentistDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/assistant"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Route redirects to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
