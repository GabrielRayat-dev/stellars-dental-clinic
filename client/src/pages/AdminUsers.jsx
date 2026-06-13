import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  UserPen,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminUsers.css';

const ROWS_PER_PAGE = 8;

const ROLE_LABELS = { admin: 'Admin', dentist: 'Dentist', assistant: 'Assistant' };

/* ─── Modal ─────────────────────────────────── */
const Modal = ({ title, onClose, children }) => (
  <div className="au-modal-overlay" onClick={onClose}>
    <div className="au-modal" onClick={(e) => e.stopPropagation()}>
      <div className="au-modal__header">
        <h2 className="au-modal__title">{title}</h2>
        <button className="au-modal__close" onClick={onClose}><X size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

/* ─── Field ──────────────────────────────────── */
const Field = ({ label, required, children }) => (
  <div className="au-field">
    <label className="au-field__label">{label}{required && <span className="au-field__req">*</span>}</label>
    {children}
  </div>
);

/* ─── Main Component ─────────────────────────── */
const AdminUsers = () => {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  // Selection
  const [selectedId, setSelectedId] = useState(null);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Form state
  const emptyForm = { name: '', email: '', password: '', role: 'assistant', phone_number: '', receive_emails: false, status: true };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  /* ── Fetch ───────────────────────────────── */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/staff', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load users');
      setUsers(json.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  /* ── Pagination ──────────────────────────── */
  const totalPages = Math.max(1, Math.ceil(users.length / ROWS_PER_PAGE));
  const pageUsers = users.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const selectedUser = users.find((u) => u.id === selectedId) || null;

  /* ── Helpers ─────────────────────────────── */
  const authHeader = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });

  const handleField = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  /* ── Add ─────────────────────────────────── */
  const openAdd = () => { setForm(emptyForm); setFormError(''); setShowAdd(true); };
  const submitAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create user');
      setShowAdd(false);
      setSelectedId(null);
      await fetchUsers();
    } catch (err) { setFormError(err.message); }
    finally { setSubmitting(false); }
  };

  /* ── Edit ────────────────────────────────── */
  const openEdit = () => {
    if (!selectedUser) return;
    setForm({
      name: selectedUser.name || '',
      email: '',
      password: '',
      role: selectedUser.role || 'assistant',
      phone_number: selectedUser.phone_number || '',
      receive_emails: selectedUser.receive_emails || false,
      status: selectedUser.status ?? true,
    });
    setFormError('');
    setShowEdit(true);
  };
  const submitEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true); setFormError('');
    const payload = { name: form.name, role: form.role, phone_number: form.phone_number, receive_emails: form.receive_emails, status: form.status };
    try {
      const res = await fetch(`/api/admin/staff/${selectedId}`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to update user');
      setShowEdit(false);
      await fetchUsers();
    } catch (err) { setFormError(err.message); }
    finally { setSubmitting(false); }
  };

  /* ── Delete ──────────────────────────────── */
  const submitDelete = async () => {
    setSubmitting(true); setFormError('');
    try {
      const res = await fetch(`/api/admin/staff/${selectedId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete user');
      setShowDelete(false);
      setSelectedId(null);
      await fetchUsers();
    } catch (err) { setFormError(err.message); }
    finally { setSubmitting(false); }
  };

  /* ── Render ──────────────────────────────── */
  return (
    <main className="au-page">
      {/* Header */}
      <div className="au-header">
        <div>
          <h1 className="au-header__title">User Management</h1>
          <p className="au-header__subtitle">Create, update, deactivate, delete users</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="au-actions">
        <button className="au-btn au-btn--add" onClick={openAdd}>
          <UserPlus size={15} /> Add User
        </button>
        <button className="au-btn au-btn--edit" onClick={openEdit} disabled={!selectedId}>
          <UserPen size={15} /> Edit User
        </button>
        <button
          className="au-btn au-btn--delete"
          onClick={() => { setFormError(''); setShowDelete(true); }}
          disabled={!selectedId || selectedId === currentUser?.id}
        >
          <UserMinus size={15} /> Delete User
        </button>
      </div>

      {/* Table */}
      <div className="au-table-wrap">
        {loading ? (
          <div className="au-state au-state--loading">
            <Loader2 size={24} className="au-spin" />
            <span>Loading users…</span>
          </div>
        ) : error ? (
          <div className="au-state au-state--error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        ) : (
          <table className="au-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Receive Emails</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.length === 0 ? (
                <tr><td colSpan={6} className="au-table__empty">No users found.</td></tr>
              ) : (
                pageUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={`au-table__row ${selectedId === u.id ? 'au-table__row--selected' : ''}`}
                    onClick={() => setSelectedId(u.id === selectedId ? null : u.id)}
                  >
                    <td>{u.name || '—'}</td>
                    <td>{ROLE_LABELS[u.role] || u.role}</td>
                    <td>{u.phone_number || '—'}</td>
                    <td>{u.email || '—'}</td>
                    <td className="au-table__center">
                      <span className={`au-checkbox-dot ${u.receive_emails ? 'au-checkbox-dot--on' : ''}`} />
                    </td>
                    <td>
                      <span className={`au-badge ${u.status ? 'au-badge--active' : 'au-badge--inactive'}`}>
                        <span className="au-badge__dot" />
                        {u.status ? 'active' : 'not active'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && users.length > 0 && (
        <div className="au-pagination">
          <span className="au-pagination__count">{users.length} users</span>
          <div className="au-pagination__controls">
            <button
              className="au-pagination__btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} />
            </button>
            <span className="au-pagination__info">{page} / {totalPages}</span>
            <button
              className="au-pagination__btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── ADD MODAL ───────────────────────── */}
      {showAdd && (
        <Modal title="Add New User" onClose={() => setShowAdd(false)}>
          <form className="au-form" onSubmit={submitAdd}>
            {formError && <div className="au-form__error"><AlertCircle size={15}/>{formError}</div>}
            <div className="au-form__grid">
              <Field label="Full Name" required>
                <input className="au-input" name="name" value={form.name} onChange={handleField} required />
              </Field>
              <Field label="Email" required>
                <input className="au-input" type="email" name="email" value={form.email} onChange={handleField} required />
              </Field>
              <Field label="Password" required>
                <input className="au-input" type="password" name="password" value={form.password} onChange={handleField} required />
              </Field>
              <Field label="Role" required>
                <select className="au-input au-select" name="role" value={form.role} onChange={handleField} required>
                  <option value="assistant">Assistant</option>
                  <option value="dentist">Dentist</option>
                </select>
              </Field>
              <Field label="Phone Number">
                <input className="au-input" name="phone_number" value={form.phone_number} onChange={handleField} />
              </Field>
            </div>
            <div className="au-form__row">
              <label className="au-toggle">
                <input type="checkbox" name="receive_emails" checked={form.receive_emails} onChange={handleField} />
                <span className="au-toggle__track" />
                <span className="au-toggle__label">Receive email notifications</span>
              </label>
              <label className="au-toggle">
                <input type="checkbox" name="status" checked={form.status} onChange={handleField} />
                <span className="au-toggle__track" />
                <span className="au-toggle__label">Active account</span>
              </label>
            </div>
            <div className="au-form__actions">
              <button type="button" className="au-btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="au-btn-primary" disabled={submitting}>
                {submitting ? <><Loader2 size={14} className="au-spin" /> Saving…</> : 'Add User'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── EDIT MODAL ──────────────────────── */}
      {showEdit && selectedUser && (
        <Modal title={`Edit — ${selectedUser.name}`} onClose={() => setShowEdit(false)}>
          <form className="au-form" onSubmit={submitEdit}>
            {formError && <div className="au-form__error"><AlertCircle size={15}/>{formError}</div>}
            <div className="au-form__grid">
              <Field label="Full Name" required>
                <input className="au-input" name="name" value={form.name} onChange={handleField} required />
              </Field>
              <Field label="Role" required>
                <select className="au-input au-select" name="role" value={form.role} onChange={handleField}>
                  <option value="assistant">Assistant</option>
                  <option value="dentist">Dentist</option>
                </select>
              </Field>
              <Field label="Phone Number">
                <input className="au-input" name="phone_number" value={form.phone_number} onChange={handleField} />
              </Field>
            </div>
            <div className="au-form__row">
              <label className="au-toggle">
                <input type="checkbox" name="receive_emails" checked={form.receive_emails} onChange={handleField} />
                <span className="au-toggle__track" />
                <span className="au-toggle__label">Receive email notifications</span>
              </label>
              <label className="au-toggle">
                <input type="checkbox" name="status" checked={form.status} onChange={handleField} />
                <span className="au-toggle__track" />
                <span className="au-toggle__label">Active account</span>
              </label>
            </div>
            <div className="au-form__actions">
              <button type="button" className="au-btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
              <button type="submit" className="au-btn-primary" disabled={submitting}>
                {submitting ? <><Loader2 size={14} className="au-spin" /> Saving…</> : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── DELETE MODAL ────────────────────── */}
      {showDelete && selectedUser && (
        <Modal title="Delete User" onClose={() => setShowDelete(false)}>
          <div className="au-form">
            {formError && <div className="au-form__error"><AlertCircle size={15}/>{formError}</div>}
            <p className="au-delete__msg">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>? This action cannot be undone.
            </p>
            <div className="au-form__actions">
              <button type="button" className="au-btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              <button type="button" className="au-btn-danger" onClick={submitDelete} disabled={submitting}>
                {submitting ? <><Loader2 size={14} className="au-spin" /> Deleting…</> : 'Delete User'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default AdminUsers;
