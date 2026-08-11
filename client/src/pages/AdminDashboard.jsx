import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';
import { useNavigate } from 'react-router-dom';
import {
  UserCog,
  Users,
  Stethoscope,
  FileText,
  Loader2,
  TrendingUp,
  Activity,
  ShieldCheck,
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

const ROLE_BADGE_STYLE = {
  admin:     { background: 'rgba(189, 39, 47, 0.12)', color: '#bd272f' },
  dentist:   { background: 'rgba(39, 128, 78, 0.12)', color: 'var(--primary-green)' },
  assistant: { background: 'rgba(199, 153, 35, 0.12)', color: 'var(--gold-accent)' },
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data
  const [stats, setStats] = useState(null);
  const [staff, setStaff] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [staffPage, setStaffPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, staffRes, logsRes] = await Promise.all([
        apiFetch('/api/stats'),
        apiFetch('/api/admin/staff'),
        apiFetch('/api/audit-logs'),
      ]);

      if (!statsRes.ok || !staffRes.ok || !logsRes.ok) throw new Error('Failed to load dashboard data');

      const statsJson = await statsRes.json();
      const staffJson = await staffRes.json();
      const logsJson = await logsRes.json();

      setStats(statsJson.data || null);
      setStaff(staffJson.data || []);
      setLogs(logsJson.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);

  useEffect(() => {
    setStaffPage(1);
    setLogsPage(1);
  }, [staff, logs]);

  if (loading) {
    return (
      <div className="dashboard-loading-spinner">
        <Loader2 className="animate-spin" size={32} style={{ marginRight: '0.5rem' }} />
        <span>Loading Control Center...</span>
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

  const adminCount   = stats?.staff?.admin_count     ?? 0;
  const dentistCount = stats?.staff?.dentist_count   ?? 0;
  const assistantCount = stats?.staff?.assistant_count ?? 0;
  const recordCount  = stats?.records?.record_count  ?? 0;

  // Pending trend from stats
  const pendingTrend = stats?.appointments?.pending_per_day || [];

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
  const totalStaffPages = Math.ceil(staff.length / ITEMS_PER_PAGE);
  const displayedStaff = staff.slice((staffPage - 1) * ITEMS_PER_PAGE, staffPage * ITEMS_PER_PAGE);

  const totalLogPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const displayedLogs = logs.slice((logsPage - 1) * ITEMS_PER_PAGE, logsPage * ITEMS_PER_PAGE);

  return (
    <main className="dentist-dashboard">
      <Header
        title={<><ShieldCheck size={28} /> Admin Control Center</>}
        subtitle={`Welcome back, ${user?.name || 'Administrator'}. Full system oversight is available.`}
        onForward={() => navigate('/dashboard/admin/users')}
      />

      {/* Stat Cards */}
      <div className="stats-row animate-fade-in">
        <div className="stat-card pending" onClick={() => navigate('/dashboard/admin/users')}>
          <div className="stat-info">
            <h3>Admin Users</h3>
            <div className="stat-value">{adminCount}</div>
          </div>
          <div className="stat-icon-wrapper"><ShieldCheck size={24} /></div>
        </div>

        <div className="stat-card approved" onClick={() => navigate('/dashboard/admin/users')}>
          <div className="stat-info">
            <h3>Dentists</h3>
            <div className="stat-value">{dentistCount}</div>
          </div>
          <div className="stat-icon-wrapper"><Stethoscope size={24} /></div>
        </div>

        <div className="stat-card records" onClick={() => navigate('/dashboard/admin/users')}>
          <div className="stat-info">
            <h3>Assistants</h3>
            <div className="stat-value">{assistantCount}</div>
          </div>
          <div className="stat-icon-wrapper"><Users size={24} /></div>
        </div>

        <div className="stat-card" style={{ background: 'var(--card-bg)', boxShadow: 'var(--card-shadow)' }}>
          <div className="stat-info">
            <h3>Medical Records</h3>
            <div className="stat-value">{recordCount}</div>
          </div>
          <div className="stat-icon-wrapper"><FileText size={24} /></div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-content-grid animate-fade-in">

        {/* Left: Chart + Staff Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Trend Chart */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h4 className="panel-title"><TrendingUp size={18} />Appointment Booking Trend</h4>
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
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No trend data available yet</div>
              )}
            </div>
          </div>

          {/* Staff Table */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <h4 className="panel-title"><UserCog size={18} />Staff Overview</h4>
              <ButtonWithIcons iconName="UserCog" label="Manage Staff" variant="default" onClick={() => navigate('/dashboard/admin/users')} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              {displayedStaff.length > 0 ? (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <th style={{ padding: '0.75rem' }}>Name</th>
                        <th style={{ padding: '0.75rem' }}>Email</th>
                        <th style={{ padding: '0.75rem' }}>Role</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedStaff.map(member => (
                        <tr key={member.id} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 500 }}>{member.name}</td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              ...(ROLE_BADGE_STYLE[member.role] || {})
                            }}>
                              {member.role}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '20px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              background: member.status ? 'rgba(39, 128, 78, 0.12)' : 'rgba(180,40,40,0.10)',
                              color: member.status ? 'var(--primary-green)' : 'var(--error-red)',
                            }}>
                              {member.status ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Pagination currentPage={staffPage} totalPages={totalStaffPages} onPageChange={setStaffPage} />
                </>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem 0' }}>No staff members found.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right: Logs Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h4 className="panel-title"><Activity size={18} />Recent Logs Feed</h4>
              <ButtonWithIcons iconName="Activity" label="All Logs" variant="default" onClick={() => navigate('/dashboard/admin/logs')} />
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

export default AdminDashboard;
