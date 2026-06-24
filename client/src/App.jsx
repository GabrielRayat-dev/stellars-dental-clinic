import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import DentistLayout from './components/DentistLayout';
import AssistantLayout from './components/AssistantLayout';
import PublicLayout from './components/PublicLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import DashboardRedirect from './pages/DashboardRedirect';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminLogs from './pages/AdminLogs';
import AdminSettings from './pages/AdminSettings';
import DentistDashboard from './pages/DentistDashboard';
import DentistSchedule from './pages/DentistSchedule';
import DentistPatients from './pages/DentistPatients';
import DentistPatientDetails from './pages/DentistPatientDetails';
import DentistServices from './pages/DentistServices';
import AssistantDashboard from './pages/AssistantDashboard';
import AssistantSchedule from './pages/AssistantSchedule';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes with universal Navbar and Footer */}
          <Route element={<PublicLayout />}>
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

          </Route>

          {/* Dentist Routes — nested under DentistLayout */}
          <Route
            path="/dashboard/dentist"
            element={
              <ProtectedRoute allowedRoles={['dentist']}>
                <DentistLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DentistDashboard />} />
            <Route path="schedule" element={<DentistSchedule />} />
            <Route path="patients" element={<DentistPatients />} />
            <Route path="patients/:id" element={<DentistPatientDetails />} />
            <Route path="services" element={<DentistServices />} />
          </Route>

          {/* Assistant Routes — nested under AssistantLayout */}
          <Route
            path="/dashboard/assistant"
            element={
              <ProtectedRoute allowedRoles={['assistant']}>
                <AssistantLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AssistantDashboard />} />
            <Route path="schedule" element={<AssistantSchedule />} />
          </Route>

          {/* Admin Routes — nested under AdminLayout */}
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

          {/* Catch-all Route redirects to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
