import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';
import { useNavigate } from 'react-router-dom';
import { Activity, Loader2, AlertCircle, Power, PowerOff } from 'lucide-react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { TableWrap, Table } from '../components/Table';
import AdminPagination from '../components/AdminPagination';
import Modal from '../components/Modal';
import ModalConfirmation from '../components/ModalConfirmation';
import ButtonWithIcons from '../components/ButtonWithIcons';
import { useAuth } from '../context/AuthContext';
import '../styles/DentistSchedule.css'; // Reusing layout styles

const DentistServices = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Data
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const ITEMS_PER_PAGE = 8;

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [pendingAction, setPendingAction] = useState(null); // { type: 'toggle', service: object }
  const [actionLoading, setActionLoading] = useState(false);
  
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      const res = await apiFetch('/api/services', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch services');
      setServices(json.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchServices();
      setLoading(false);
    };
    loadData();
  }, [fetchServices]);

  // Derived Data
  const filteredServices = services.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE) || 1;
  const paginatedServices = filteredServices.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Form Handlers
  const handleAddClick = () => {
    setEditingService(null);
    setForm({ name: '', description: '' });
    setFormError('');
    setShowFormModal(true);
  };

  const handleEditClick = (service) => {
    setEditingService(service);
    setForm({ name: service.name, description: service.description || '' });
    setFormError('');
    setShowFormModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save service');
      
      await fetchServices();
      setShowFormModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Action
  const requestToggle = (service) => setPendingAction({ type: 'toggle', service });

  const confirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    const { service } = pendingAction;
    try {
      const res = await apiFetch(`/api/services/${service.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !service.is_active })
      });
      if (res.ok) await fetchServices();
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await apiFetch(`/api/services/${serviceToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) await fetchServices();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
      setServiceToDelete(null);
    }
  };

  return (
    <main className="ds-page">
      <Header 
        title={<><Activity size={28} /> Services Management</>}
        subtitle="view, add, edit, and manage clinic services"
        onBack={() => navigate('/dashboard/dentist')}
        onForward={() => navigate('/dashboard/dentist/faqs')}
      />
      
      <div className="ds-controls">
        <SearchBar 
          value={searchQuery}
          onChange={(val) => { setSearchQuery(val); setPage(1); }}
          placeholder="search services..."
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ButtonWithIcons
            iconName="Plus"
            label="Add Service"
            variant="default"
            onClick={handleAddClick}
          />
          <ButtonWithIcons
            iconName="Edit2"
            label="Edit"
            variant="gold"
            onClick={() => handleEditClick(services.find(s => s.id === selectedId))}
            disabled={!selectedId}
          />
          <ButtonWithIcons
            iconName="Trash2"
            label="Delete"
            variant="danger"
            onClick={() => setServiceToDelete(services.find(s => s.id === selectedId))}
            disabled={!selectedId}
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
        <TableWrap>
          <Table headers={['Service Name', 'Description', 'Status', 'Date Created', 'Actions']}>
            {paginatedServices.length === 0 ? (
              <tr><td colSpan="5" className="st-table__empty">No services found.</td></tr>
            ) : (
              paginatedServices.map(s => (
                <tr 
                  key={s.id}
                  className={selectedId === s.id ? 'st-table__row--selected' : ''}
                  onClick={() => setSelectedId(s.id === selectedId ? null : s.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td style={{ maxWidth: '300px' }}>{s.description || <span style={{ color: 'var(--text-muted)' }}>No description</span>}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                      background: s.is_active ? 'rgba(61,118,85,0.1)' : 'rgba(217,83,79,0.1)',
                      color: s.is_active ? 'var(--primary-green)' : 'var(--error-red)'
                    }}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="ds-action-btns" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className={`ds-action-btn ${s.is_active ? 'ds-action-btn--reject' : 'ds-action-btn--approve'}`}
                        style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                        onClick={() => requestToggle(s)}
                      >
                        {s.is_active ? <PowerOff size={14} /> : <Power size={14} />} 
                        {s.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>
          {filteredServices.length > 0 && (
            <AdminPagination 
              totalItems={filteredServices.length} 
              itemName="services"
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </TableWrap>
      )}

      {/* ── Add/Edit Modal ── */}
      {showFormModal && (
        <Modal 
          title={editingService ? 'Edit Service' : 'Add New Service'} 
          onClose={() => !formSubmitting && setShowFormModal(false)}
        >
          <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1.5rem 1.5rem' }}>
            {formError && <div style={{ color: 'var(--error-red)', fontSize: '0.9rem' }}><AlertCircle size={15}/> {formError}</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Service Name</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                placeholder="e.g. Tooth Extraction"
                style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Description (Optional)</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={3}
                placeholder="Brief description of the service..."
                style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={formSubmitting}
              style={{
                marginTop: '0.5rem', padding: '0.75rem', background: 'var(--primary-green)',
                color: '#fff', border: 'none', fontWeight: 600, cursor: formSubmitting ? 'not-allowed' : 'pointer', opacity: formSubmitting ? 0.7 : 1
              }}
            >
              {formSubmitting ? 'Saving...' : 'Save Service'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Toggle Confirmation Modal ── */}
      {pendingAction && (
        <ModalConfirmation
          title={pendingAction.service.is_active ? 'Deactivate Service?' : 'Activate Service?'}
          message={`Are you sure you want to ${pendingAction.service.is_active ? 'deactivate' : 'activate'} the service "${pendingAction.service.name}"? ${pendingAction.service.is_active ? 'It will no longer appear as an option for patients.' : 'It will become available for patients to select.'}`}
          confirmText={pendingAction.service.is_active ? 'Yes, Deactivate' : 'Yes, Activate'}
          cancelText="Cancel"
          loading={actionLoading}
          danger={pendingAction.service.is_active}
          onConfirm={confirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {serviceToDelete && (
        <ModalConfirmation
          title="Delete Service?"
          message={`Are you sure you want to permanently delete "${serviceToDelete.name}"? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          loading={deleteLoading}
          danger={true}
          onConfirm={confirmDelete}
          onCancel={() => setServiceToDelete(null)}
        />
      )}
    </main>
  );
};

export default DentistServices;
