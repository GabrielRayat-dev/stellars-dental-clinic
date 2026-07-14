import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import ScheduleForm from '../components/ScheduleForm';
import AdminPagination from '../components/AdminPagination';
import ButtonWithIcons from '../components/ButtonWithIcons';
import SearchBar from '../components/SearchBar';
import ModalConfirmation from '../components/ModalConfirmation';
import { TableWrap, Table } from '../components/Table';
import '../styles/DentistSchedule.css';

const AssistantSchedule = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'schedule'
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => setPage(1), [activeTab, searchQuery]);

  // Data
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Confirmation modal state
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch('/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch appointments');
      setAppointments(json.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAppointments();
      setLoading(false);
    };
    loadData();
  }, [fetchAppointments]);

  // Derived Data
  const filteredAppointments = appointments.filter(app => {
    if (app.status !== activeTab) return false;
    if (!searchQuery) return true;

    const q = searchQuery.toLowerCase();
    return (
      app.patient_name?.toLowerCase().includes(q) ||
      app.phone_number?.includes(q) ||
      app.service?.name?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE) || 1;
  const paginatedAppointments = filteredAppointments.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Actions — go through confirmation
  const requestApprove = (app) => setPendingAction({ type: 'approve', app });
  const requestReject  = (app) => setPendingAction({ type: 'reject',  app });

  const confirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    const { type, app } = pendingAction;
    try {
      if (type === 'approve') {
        const res = await fetch(`/api/appointments/${app.id}/approve`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });
        if (res.ok) fetchAppointments();
      } else {
        const res = await fetch(`/api/appointments/${app.id}/reject`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ rejected_reason: 'Rejected by Assistant' })
        });
        if (res.ok) fetchAppointments();
      }
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  const cancelAction = () => setPendingAction(null);

  return (
    <main className="ds-page">
      <Header
        title={<><Calendar size={28} /> Schedule Appointments</>}
        subtitle="manage appointment requests and schedule patients"
        onBack={() => navigate('/dashboard/assistant')}
      />

      <div className="ds-controls">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="search name, number, service, etc..."
        />
        <div className="ds-tabs">
          <ButtonWithIcons
            iconName="Clock"
            label="Pending Requests"
            active={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
          />
          <ButtonWithIcons
            iconName="CheckCircle"
            label="Appointments"
            active={activeTab === 'approved'}
            onClick={() => setActiveTab('approved')}
          />
          <ButtonWithIcons
            iconName="CalendarPlus"
            label="Schedule Patient"
            active={activeTab === 'schedule'}
            onClick={() => setActiveTab('schedule')}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="au-spin" style={{ display: 'inline' }} /> Loading...
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--error-red)' }}>
          <AlertCircle size={20} /> {error}
        </div>
      ) : (
        <>
          {/* ── Pending & Approved Tables ── */}
          {(activeTab === 'pending' || activeTab === 'approved') && (
            <TableWrap>
              <Table headers={['Patient Name', 'Phone Number', 'Service', 'Preferred Date', 'Preferred Time', 'Date / Time Submitted', 'Actions']}>
                {paginatedAppointments.length === 0 ? (
                  <tr><td colSpan="7" className="st-table__empty">No {activeTab} appointments found.</td></tr>
                ) : (
                  paginatedAppointments.map(app => (
                    <tr key={app.id}>
                      <td>{app.patient_name}</td>
                      <td>{app.phone_number}</td>
                      <td>{app.service?.name || '—'}</td>
                      <td>{formatDateForDisplay(app.preferred_date)}</td>
                      <td>{app.preferred_time || '—'}</td>
                      <td>{new Date(app.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).replace(',', ' -')}</td>
                      <td>
                        <div className="ds-action-btns">
                          {activeTab === 'pending' && (
                            <>
                              <button className="ds-action-btn ds-action-btn--approve" onClick={() => requestApprove(app)}>Approve</button>
                              <button className="ds-action-btn ds-action-btn--reject" onClick={() => requestReject(app)}>Reject</button>
                            </>
                          )}
                          {activeTab === 'approved' && (
                            <button className="ds-action-btn ds-action-btn--reject" onClick={() => requestReject(app)}>Remove</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </Table>
              {filteredAppointments.length > 0 && (
                <AdminPagination
                  totalItems={filteredAppointments.length}
                  itemName={`${activeTab} appointments`}
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </TableWrap>
          )}

          {/* ── Schedule Form ── */}
          {activeTab === 'schedule' && (
            <ScheduleForm onSuccess={() => {
              setActiveTab('pending');
              fetchAppointments();
            }} />
          )}
        </>
      )}

      {/* ── Action Confirmation Modal ── */}
      {pendingAction && (
        <ModalConfirmation
          title={
            pendingAction.type === 'approve'
              ? 'Approve Appointment?'
              : activeTab === 'approved'
              ? 'Remove Appointment?'
              : 'Reject Appointment?'
          }
          message={
            pendingAction.type === 'approve'
              ? `Approve the appointment for ${pendingAction.app.patient_name} on ${formatDateForDisplay(pendingAction.app.preferred_date)} at ${pendingAction.app.preferred_time || '—'}?`
              : activeTab === 'approved'
              ? `Remove the approved appointment for ${pendingAction.app.patient_name}? This will mark it as rejected.`
              : `Reject the appointment for ${pendingAction.app.patient_name} on ${formatDateForDisplay(pendingAction.app.preferred_date)} at ${pendingAction.app.preferred_time || '—'}?`
          }
          confirmText={
            pendingAction.type === 'approve' ? 'Yes, Approve' : activeTab === 'approved' ? 'Yes, Remove' : 'Yes, Reject'
          }
          cancelText="Go Back"
          loading={actionLoading}
          danger={pendingAction.type === 'reject'}
          onConfirm={confirmAction}
          onCancel={cancelAction}
        />
      )}
    </main>
  );
};

export default AssistantSchedule;
