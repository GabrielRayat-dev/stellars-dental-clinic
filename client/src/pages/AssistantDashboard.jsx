import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  UserCheck,
  XCircle,
  ClipboardList,
  Loader2,
  TrendingUp,
  Activity,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Button from '../components/Button';
import ButtonWithIcons from '../components/ButtonWithIcons';
import Pagination from '../components/Pagination';
import '../styles/Dashboard.css';
import '../styles/DentistDashboard.css';

const ITEMS_PER_PAGE = 5;

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

const AssistantDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Data
  const [appointments, setAppointments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [appRes, logsRes] = await Promise.all([
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/audit-logs', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!appRes.ok || !logsRes.ok) throw new Error('Failed to load dashboard data');

      const appJson = await appRes.json();
      const logsJson = await logsRes.json();

      setAppointments(appJson.data || []);
      setLogs(logsJson.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token, fetchDashboardData]);

  // Reset pages on data change
  useEffect(() => {
    setAppointmentsPage(1);
    setLogsPage(1);
  }, [appointments, logs]);

  if (loading) {
    return (
      <div className="dashboard-loading-spinner">
        <Loader2 className="animate-spin" size={32} style={{ marginRight: '0.5rem' }} />
        <span>Loading Workspace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <main className="dentist-dashboard">
        <div style={{ color: 'var(--error-red)', padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
          <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
          <h3>Error loading dashboard data</h3>
          <p>{error}</p>
          <Button onClick={fetchDashboardData} variant="primary" style={{ marginTop: '1rem' }}>Retry</Button>
        </div>
      </main>
    );
  }

  // Derived stats from appointments list
  const pendingCount = appointments.filter(a => a.status === 'pending').length;
  const approvedCount = appointments.filter(a => a.status === 'approved').length;
  const rejectedCount = appointments.filter(a => a.status === 'rejected').length;
  const totalCount = appointments.length;

  // Last 7 days trend (pending by day from client-side)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const dayMap = new Map();
  appointments
    .filter(a => a.status === 'pending' && new Date(a.created_at) >= sevenDaysAgo)
    .forEach(a => {
      const date = a.created_at?.slice(0, 10);
      if (date) dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });
  const pendingTrend = [...dayMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }));

  // SVG chart
  const chartWidth = 500;
  const chartHeight = 160;
  const paddingX = 40;
  const paddingY = 20;
  let polylinePoints = '';
  if (pendingTrend.length > 1) {
    const maxVal = Math.max(...pendingTrend.map(d => d.count), 1);
    polylinePoints = pendingTrend.map((d, i) => {
      const x = paddingX + (i * (chartWidth - 2 * paddingX)) / (pendingTrend.length - 1);
      const y = chartHeight - paddingY - (d.count / maxVal) * (chartHeight - 2 * paddingY);
      return `${x},${y}`;
    }).join(' ');
  }

  // Paginated slices
  const pendingApps = appointments.filter(a => a.status === 'pending');
  const totalAppPages = Math.ceil(pendingApps.length / ITEMS_PER_PAGE);
  const displayedApps = pendingApps.slice((appointmentsPage - 1) * ITEMS_PER_PAGE, appointmentsPage * ITEMS_PER_PAGE);

  const totalLogPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const displayedLogs = logs.slice((logsPage - 1) * ITEMS_PER_PAGE, logsPage * ITEMS_PER_PAGE);

  return (
    <main className="dentist-dashboard">
      <Header
        title="Assistant Workspace"
        subtitle={`Welcome, ${user?.name || 'Assistant'}. Manage patient appointments and check-ins.`}
        onForward={() => navigate('/dashboard/assistant/schedule')}
      />

      {/* Stats Row */}
      <div className="stats-row animate-fade-in">
        <div className="stat-card pending" onClick={() => navigate('/dashboard/assistant/schedule')}>
          <div className="stat-info">
            <h3>Pending Appointments</h3>
            <div className="stat-value">{pendingCount}</div>
          </div>
          <div className="stat-icon-wrapper"><Calendar size={24} /></div>
        </div>

        <div className="stat-card approved" onClick={() => navigate('/dashboard/assistant/schedule')}>
          <div className="stat-info">
            <h3>Approved Appointments</h3>
            <div className="stat-value">{approvedCount}</div>
          </div>
          <div className="stat-icon-wrapper"><UserCheck size={24} /></div>
        </div>

        <div className="stat-card rejected" onClick={() => navigate('/dashboard/assistant/schedule')}>
          <div className="stat-info">
            <h3>Rejected Appointments</h3>
            <div className="stat-value">{rejectedCount}</div>
          </div>
          <div className="stat-icon-wrapper"><XCircle size={24} /></div>
        </div>

        <div className="stat-card records">
          <div className="stat-info">
            <h3>Total Appointments</h3>
            <div className="stat-value">{totalCount}</div>
          </div>
          <div className="stat-icon-wrapper"><ClipboardList size={24} /></div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-content-grid animate-fade-in">

        {/* Left: Trend + Appointments Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Trend Chart */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h4 className="panel-title"><TrendingUp size={18} />Booking Trend (Last 7 Days)</h4>
            </div>
            <div className="chart-container">
              {pendingTrend.length > 0 ? (
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} width="100%" height="100%">
                  <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} className="chart-grid-line" />
                  <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} className="chart-grid-line" />
                  <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} className="chart-grid-line" />
                  {polylinePoints && (
                    <polyline fill="none" stroke="var(--primary-green)" strokeWidth="3" points={polylinePoints} />
                  )}
                  {pendingTrend.map((d, i) => {
                    const maxVal = Math.max(...pendingTrend.map(v => v.count), 1);
                    const x = paddingX + (i * (chartWidth - 2 * paddingX)) / (pendingTrend.length - 1);
                    const y = chartHeight - paddingY - (d.count / maxVal) * (chartHeight - 2 * paddingY);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="5" fill="var(--gold-accent)" stroke="var(--primary-green)" strokeWidth="2" />
                        <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text-dark)">{d.count}</text>
                        <text x={x} y={chartHeight - 4} textAnchor="middle" className="chart-axis-label">{d.date.slice(5)}</text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No recent pending appointments to chart</div>
              )}
            </div>
          </div>

          {/* Pending Appointments Table */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h4 className="panel-title"><Calendar size={18} />Pending Appointments</h4>
              <ButtonWithIcons iconName="Calendar" label="Manage Schedule" variant="default" onClick={() => navigate('/dashboard/assistant/schedule')} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              {displayedApps.length > 0 ? (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '0.75rem' }}>Patient Name</th>
                        <th style={{ padding: '0.75rem' }}>Phone</th>
                        <th style={{ padding: '0.75rem' }}>Date</th>
                        <th style={{ padding: '0.75rem' }}>Time</th>
                        <th style={{ padding: '0.75rem' }}>Service</th>
                        <th style={{ padding: '0.75rem' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedApps.map(app => (
                        <tr key={app.id} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 500 }}>{app.patient_name || 'N/A'}</td>
                          <td style={{ padding: '0.75rem' }}>{app.phone_number || 'N/A'}</td>
                          <td style={{ padding: '0.75rem' }}>{app.preferred_date ? new Date(app.preferred_date).toLocaleDateString() : 'N/A'}</td>
                          <td style={{ padding: '0.75rem' }}>{formatTimeForDisplay(app.preferred_time)}</td>
                          <td style={{ padding: '0.75rem' }}>{app.service?.name || 'N/A'}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <ButtonWithIcons iconName="Calendar" label="Manage" variant="default" onClick={() => navigate('/dashboard/assistant/schedule')} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination currentPage={appointmentsPage} totalPages={totalAppPages} onPageChange={setAppointmentsPage} />
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>No pending appointments.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right: Logs Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h4 className="panel-title"><Activity size={18} />Recent Logs Feed</h4>
              <ButtonWithIcons iconName="Activity" label="All Logs" variant="default" onClick={() => navigate('/dashboard/assistant/logs')} />
            </div>
            <div className="newsfeed-container">
              {displayedLogs.length > 0 ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {displayedLogs.map(log => (
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
                  <Pagination currentPage={logsPage} totalPages={totalLogPages} onPageChange={setLogsPage} />
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>No recent activity logged.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default AssistantDashboard;
