import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../api';
import { useNavigate } from 'react-router-dom';
import { MessageCircleQuestion, Loader2, AlertCircle, Power, PowerOff } from 'lucide-react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { TableWrap, Table } from '../components/Table';
import AdminPagination from '../components/AdminPagination';
import Modal from '../components/Modal';
import ModalConfirmation from '../components/ModalConfirmation';
import ButtonWithIcons from '../components/ButtonWithIcons';
import { useAuth } from '../context/AuthContext';
import '../styles/DentistSchedule.css'; // Reusing layout styles

const DentistFaqs = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Data
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const ITEMS_PER_PAGE = 8;

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', is_active: true });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [pendingAction, setPendingAction] = useState(null); // { type: 'toggle', faq: object }
  const [actionLoading, setActionLoading] = useState(false);
  
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await apiFetch('/api/public/faqs/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch FAQs');
      setFaqs(json.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchFaqs();
      setLoading(false);
    };
    loadData();
  }, [fetchFaqs]);

  // Derived Data
  const filteredFaqs = faqs.filter(f => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return f.question?.toLowerCase().includes(q) || f.answer?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredFaqs.length / ITEMS_PER_PAGE) || 1;
  const paginatedFaqs = filteredFaqs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Form Handlers
  const handleAddClick = () => {
    setEditingFaq(null);
    setForm({ question: '', answer: '', is_active: true });
    setFormError('');
    setShowFormModal(true);
  };

  const handleEditClick = (faq) => {
    if (!faq) return;
    setEditingFaq(faq);
    setForm({ question: faq.question, answer: faq.answer, is_active: faq.is_active });
    setFormError('');
    setShowFormModal(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const url = editingFaq ? `/api/public/faqs/${editingFaq.id}` : '/api/public/faqs';
      const method = editingFaq ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save FAQ');
      
      await fetchFaqs();
      setShowFormModal(false);
      setSelectedId(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Action
  const requestToggle = (faq) => setPendingAction({ type: 'toggle', faq });

  const confirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    const { faq } = pendingAction;
    try {
      const res = await apiFetch(`/api/public/faqs/${faq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: faq.question, answer: faq.answer, is_active: !faq.is_active })
      });
      if (res.ok) await fetchFaqs();
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  };

  const confirmDelete = async () => {
    if (!faqToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await apiFetch(`/api/public/faqs/${faqToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchFaqs();
        setSelectedId(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
      setFaqToDelete(null);
    }
  };

  return (
    <main className="ds-page">
      <Header 
        title={<><MessageCircleQuestion size={28} /> FAQ Management</>}
        subtitle="view, add, edit, and manage public frequently asked questions"
        onBack={() => navigate('/dashboard/dentist')}
        onForward={() => navigate('/dashboard/dentist/logs')}
      />
      
      <div className="ds-controls">
        <SearchBar 
          value={searchQuery}
          onChange={(val) => { setSearchQuery(val); setPage(1); }}
          placeholder="search questions or answers..."
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ButtonWithIcons
            iconName="Plus"
            label="Add FAQ"
            variant="default"
            onClick={handleAddClick}
          />
          <ButtonWithIcons
            iconName="Edit2"
            label="Edit"
            variant="gold"
            onClick={() => handleEditClick(faqs.find(f => f.id === selectedId))}
            disabled={!selectedId}
          />
          <ButtonWithIcons
            iconName="Trash2"
            label="Delete"
            variant="danger"
            onClick={() => setFaqToDelete(faqs.find(f => f.id === selectedId))}
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
          <Table headers={['Question', 'Answer', 'Status', 'Date Created', 'Actions']}>
            {paginatedFaqs.length === 0 ? (
              <tr><td colSpan="5" className="st-table__empty">No FAQs found.</td></tr>
            ) : (
              paginatedFaqs.map(f => (
                <tr 
                  key={f.id}
                  className={selectedId === f.id ? 'st-table__row--selected' : ''}
                  onClick={() => setSelectedId(f.id === selectedId ? null : f.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 600, maxWidth: '250px' }}>{f.question}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.answer || <span style={{ color: 'var(--text-muted)' }}>No answer</span>}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600,
                      background: f.is_active ? 'rgba(61,118,85,0.1)' : 'rgba(217,83,79,0.1)',
                      color: f.is_active ? 'var(--primary-green)' : 'var(--error-red)'
                    }}>
                      {f.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(f.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="ds-action-btns" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className={`ds-action-btn ${f.is_active ? 'ds-action-btn--reject' : 'ds-action-btn--approve'}`}
                        style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                        onClick={() => requestToggle(f)}
                      >
                        {f.is_active ? <PowerOff size={14} /> : <Power size={14} />} 
                        {f.is_active ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>
          {filteredFaqs.length > 0 && (
            <AdminPagination 
              totalItems={filteredFaqs.length} 
              itemName="faqs"
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
          title={editingFaq ? 'Edit FAQ' : 'Add New FAQ'} 
          onClose={() => !formSubmitting && setShowFormModal(false)}
        >
          <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1.5rem 1.5rem' }}>
            {formError && <div style={{ color: 'var(--error-red)', fontSize: '0.9rem' }}><AlertCircle size={15}/> {formError}</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Question</label>
              <input 
                type="text" 
                value={form.question} 
                onChange={(e) => setForm({ ...form, question: e.target.value })} 
                required 
                placeholder="e.g. Do you offer teeth whitening?"
                style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Answer</label>
              <textarea 
                value={form.answer} 
                onChange={(e) => setForm({ ...form, answer: e.target.value })} 
                required
                rows={4}
                placeholder="Provide a clear, helpful answer..."
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
              {formSubmitting ? 'Saving...' : 'Save FAQ'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Toggle Confirmation Modal ── */}
      {pendingAction && (
        <ModalConfirmation
          title={pendingAction.faq.is_active ? 'Hide FAQ?' : 'Show FAQ?'}
          message={`Are you sure you want to ${pendingAction.faq.is_active ? 'hide' : 'show'} this FAQ? ${pendingAction.faq.is_active ? 'It will no longer appear on the public landing page.' : 'It will become visible on the public landing page.'}`}
          confirmText={pendingAction.faq.is_active ? 'Yes, Hide' : 'Yes, Show'}
          cancelText="Cancel"
          loading={actionLoading}
          danger={pendingAction.faq.is_active}
          onConfirm={confirmAction}
          onCancel={() => setPendingAction(null)}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {faqToDelete && (
        <ModalConfirmation
          title="Delete FAQ?"
          message={`Are you sure you want to permanently delete this FAQ? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          loading={deleteLoading}
          danger={true}
          onConfirm={confirmDelete}
          onCancel={() => setFaqToDelete(null)}
        />
      )}
    </main>
  );
};

export default DentistFaqs;

