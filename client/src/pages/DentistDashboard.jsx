import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ClipboardList,
  UserCheck,
  XCircle,
  Loader2,
  Activity,
  AlertCircle,
  Users
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Button from '../components/Button';
import ButtonWithIcons from '../components/ButtonWithIcons';
import Pagination from '../components/Pagination';
import CalendarView from '../components/CalendarView';
import '../styles/Dashboard.css';
import '../styles/DentistDashboard.css';

const DentistDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Data States
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [patients, setPatients] = useState([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination States (Page size = 5 items per page)
  const ITEMS_PER_PAGE = 5;
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [patientsPage, setPatientsPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Stats, Appointments, Audit logs, and Patients in parallel
      const [statsRes, appRes, logsRes, patientsRes] = await Promise.all([
        apiFetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
        apiFetch('/api/patients', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!statsRes.ok || !appRes.ok || !logsRes.ok || !patientsRes.ok) {
        throw new Error('Failed to load dashboard data');
      }

      const statsJson = await statsRes.json();
      const appJson = await appRes.json();
      const logsJson = await logsRes.json();
      const patientsJson = await patientsRes.json();

      setStats(statsJson.data || null);
      setAppointments(appJson.data || []);
      setLogs(logsJson.data || []);
      setPatients(patientsJson.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  // Reset pages on new fetch
  useEffect(() => {
    setAppointmentsPage(1);
    setPatientsPage(1);
    setLogsPage(1);
  }, [appointments, patients, logs]);

  // Render Loading
  if (loading) {
    return (
      <div className="dashboard-loading-spinner">
        <Loader2 className="animate-spin" size={32} style={{ marginRight: '0.5rem' }} />
        <span>Loading Stellar Portal...</span>
      </div>
    );
  }

  // Render Error
  if (error) {
    return (
      <main className="dentist-dashboard">
        <div style={{ color: 'var(--error-red)', padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
          <h3>Error loading dashboard data</h3>
          <p>{error}</p>
          <Button onClick={fetchDashboardData} variant="primary" style={{ marginTop: '1rem' }}>
            Retry
          </Button>
        </div>
      </main>
    );
  }

  const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return 'N/A';
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const minStr = minutes > 0 ? `:${parts[1]}` : '';
      return `${hours}${minStr}${ampm}`;
    }
    return timeStr;
  };

  // Paginated Slices
  const pendingApps = appointments.filter(app => app.status === 'pending');
  const totalAppPages = Math.ceil(pendingApps.length / ITEMS_PER_PAGE);
  const displayedAppointments = pendingApps.slice(
    (appointmentsPage - 1) * ITEMS_PER_PAGE,
    appointmentsPage * ITEMS_PER_PAGE
  );

  const totalPatientPages = Math.ceil(patients.length / ITEMS_PER_PAGE);
  const displayedPatients = patients.slice(
    (patientsPage - 1) * ITEMS_PER_PAGE,
    patientsPage * ITEMS_PER_PAGE
  );

  const totalLogPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const displayedLogs = logs.slice(
    (logsPage - 1) * ITEMS_PER_PAGE,
    logsPage * ITEMS_PER_PAGE
  );

  return (
    <main className="dentist-dashboard">
      <Header
        title="Dentist Dashboard"
        subtitle={`Welcome back, Dr. ${user?.name || 'Dentist'}. Here is your overview for today.`}
        onForward={() => navigate('/dashboard/dentist/schedule')}
      />

      {/* Row 1: Stats Cards */}
      <div className="stats-row animate-fade-in">
        <div className="stat-card pending" onClick={() => navigate('/dashboard/dentist/schedule')}>
          <div className="stat-info">
            <h3>Pending Appointments</h3>
            <div className="stat-value">{stats?.appointments?.pending_total ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper">
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card approved" onClick={() => navigate('/dashboard/dentist/schedule')}>
          <div className="stat-info">
            <h3>Approved Appointments</h3>
            <div className="stat-value">{stats?.appointments?.approved_total ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="stat-card records" onClick={() => navigate('/dashboard/dentist/patients')}>
          <div className="stat-info">
            <h3>Medical Records</h3>
            <div className="stat-value">{stats?.records?.record_count ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper">
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="stat-card rejected" onClick={() => navigate('/dashboard/dentist/schedule')}>
          <div className="stat-info">
            <h3>Rejected Appointments</h3>
            <div className="stat-value">{stats?.appointments?.rejected_total ?? 0}</div>
          </div>
          <div className="stat-icon-wrapper">
            <XCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Content: Stacked Rows */}
      <div className="dashboard-content-grid animate-fade-in">

        {/* Row 2: Appointment Calendar (full width) */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h4 className="panel-title">
              <Calendar size={18} />
              Appointment Schedule
            </h4>
          </div>
          <CalendarView appointments={appointments} />
        </div>

        {/* Row 3: Upcoming Appointments List (full width) */}
        <div className="dashboard-panel" style={{ marginTop: 0 }}>
          <div className="panel-header">
            <h4 className="panel-title">
              <Calendar size={18} />
              Upcoming Appointments List
            </h4>
            <ButtonWithIcons
              iconName="Calendar"
              label="View Schedule"
              variant="default"
              onClick={() => navigate('/dashboard/dentist/schedule')}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            {displayedAppointments.length > 0 ? (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      <th style={{ padding: '0.75rem' }}>Patient Name</th>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Time</th>
                      <th style={{ padding: '0.75rem' }}>Service</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedAppointments.map((app) => (
                      <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 500 }}>{app.patient_name || 'N/A'}</td>
                        <td style={{ padding: '0.75rem' }}>{app.preferred_date ? new Date(app.preferred_date).toLocaleDateString() : 'N/A'}</td>
                        <td style={{ padding: '0.75rem' }}>{formatTimeForDisplay(app.preferred_time)}</td>
                        <td style={{ padding: '0.75rem' }}>{app.service?.name || 'N/A'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={`appointment-status-badge ${app.status}`}>
                            {app.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <ButtonWithIcons
                            iconName="Calendar"
                            label="Manage"
                            variant="default"
                            onClick={() => navigate(`/dashboard/dentist/schedule`)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  currentPage={appointmentsPage}
                  totalPages={totalAppPages}
                  onPageChange={setAppointmentsPage}
                />
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
                No pending appointments scheduled.
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Recent Patients + Logs Feed (50/50) */}
        <div className="split-row">

          {/* Recent Patients Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h4 className="panel-title">
                <Users size={18} />
                Recent Patients
              </h4>
              <ButtonWithIcons
                iconName="Users"
                label="All"
                variant="default"
                onClick={() => navigate('/dashboard/dentist/patients')}
              />
            </div>
            <div className="patients-container">
              {displayedPatients.length > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {displayedPatients.map(pat => (
                      <div key={pat.id} className="patient-list-item">
                        <div className="patient-list-left">
                          <span className="patient-list-name">{pat.name}</span>
                          <span className="patient-list-sub">
                            {pat.gender ? `${pat.gender}, ` : ''}{pat.phone_number || 'No contact info'}
                          </span>
                        </div>
                        <ButtonWithIcons
                          iconName="ClipboardList"
                          label="View"
                          variant="default"
                          onClick={() => navigate(`/dashboard/dentist/patients/${pat.id}`)}
                        />
                      </div>
                    ))}
                  </div>
                  <Pagination
                    currentPage={patientsPage}
                    totalPages={totalPatientPages}
                    onPageChange={setPatientsPage}
                  />
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1.5rem 0', textAlign: 'center' }}>
                  No patients registered.
                </p>
              )}
            </div>
          </div>

          {/* Recent Logs Feed Panel */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h4 className="panel-title">
                <Activity size={18} />
                Recent Logs Feed
              </h4>
              <ButtonWithIcons
                iconName="Activity"
                label="Logs"
                variant="default"
                onClick={() => navigate('/dashboard/dentist/logs')}
              />
            </div>
            <div className="newsfeed-container">
              {displayedLogs.length > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {displayedLogs.map((log) => (
                      <div key={log.id} className="newsfeed-item">
                        <div className="newsfeed-meta">
                          <span>{log.ip_address || 'System'}</span>
                          <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="newsfeed-action">
                          <span className="newsfeed-user">{log.user_name || 'User'}</span> {log.action}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    currentPage={logsPage}
                    totalPages={totalLogPages}
                    onPageChange={setLogsPage}
                  />
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>
                  No recent activity logged.
                </p>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  );
};

export default DentistDashboard;
