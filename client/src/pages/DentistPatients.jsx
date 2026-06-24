import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Loader2, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import { TableWrap, Table } from '../components/Table';
import AdminPagination from '../components/AdminPagination';
import Modal from '../components/Modal';
import ModalConfirmation from '../components/ModalConfirmation';
import ButtonWithIcons from '../components/ButtonWithIcons';
import { useAuth } from '../context/AuthContext';
import '../styles/DentistSchedule.css'; // Reusing layout styles

const DentistPatients = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  // Data
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const ITEMS_PER_PAGE = 8;

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const emptyForm = {
    name: '', age: '', birthday: '', sex: '', civil_status: '',
    address: '', phone_number: '', emergency_contact: '', blood_type: ''
  };
  const [form, setForm] = useState(emptyForm);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch('/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch patients');
      setPatients(json.data || []);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPatients();
      setLoading(false);
    };
    loadData();
  }, [fetchPatients]);

  // Derived Data
  const filteredPatients = patients.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name?.toLowerCase().includes(q) || 
           p.phone_number?.includes(q) || 
           p.address?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE) || 1;
  const paginatedPatients = filteredPatients.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Form Handlers
  const handleAddClick = () => {
    setEditingPatient(null);
    setForm(emptyForm);
    setFormError('');
    setShowFormModal(true);
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name || '',
      age: patient.age || '',
      birthday: patient.birthday || '',
      sex: patient.sex || '',
      civil_status: patient.civil_status || '',
      address: patient.address || '',
      phone_number: patient.phone_number || '',
      emergency_contact: patient.emergency_contact || '',
      blood_type: patient.blood_type || ''
    });
    setFormError('');
    setShowFormModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const url = editingPatient ? `/api/patients/${editingPatient.id}` : '/api/patients';
      const method = editingPatient ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save patient record');
      
      await fetchPatients();
      setShowFormModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!patientToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/patients/${patientToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) await fetchPatients();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
      setPatientToDelete(null);
    }
  };

  return (
    <main className="ds-page">
      <Header 
        title={<><ClipboardList size={28} /> Patient Records</>}
        subtitle="view, add, and manage dental records of your patients"
        onBack={() => navigate('/dashboard/dentist/schedule')}
        onForward={() => navigate('/dashboard/dentist/services')}
      />
      
      <div className="ds-controls">
        <SearchBar 
          value={searchQuery}
          onChange={(val) => { setSearchQuery(val); setPage(1); }}
          placeholder="search patient name, phone, address..."
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <ButtonWithIcons
            iconName="Plus"
            label="Add Patient"
            variant="default"
            onClick={handleAddClick}
          />
          <ButtonWithIcons
            iconName="Edit2"
            label="Edit"
            variant="gold"
            onClick={() => handleEditClick(patients.find(p => p.id === selectedId))}
            disabled={!selectedId}
          />
          <ButtonWithIcons
            iconName="Trash2"
            label="Delete"
            variant="danger"
            onClick={() => setPatientToDelete(patients.find(p => p.id === selectedId))}
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
          <Table headers={['Name', 'Phone Number', 'Age', 'Sex', 'Blood Type', 'Actions']}>
            {paginatedPatients.length === 0 ? (
              <tr><td colSpan="6" className="st-table__empty">No patients found.</td></tr>
            ) : (
              paginatedPatients.map(p => (
                <tr 
                  key={p.id}
                  className={selectedId === p.id ? 'st-table__row--selected' : ''}
                  onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.phone_number}</td>
                  <td>{p.age}</td>
                  <td>{p.sex}</td>
                  <td>{p.blood_type}</td>
                  <td>
                    <div className="ds-action-btns" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="ds-action-btn ds-action-btn--approve" 
                        style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                        onClick={() => navigate(`/dashboard/dentist/patients/${p.id}`, { state: { activeTab: 'Profile' } })}
                      >
                        Personal Info
                      </button>
                      <button 
                        className="ds-action-btn ds-action-btn--approve" 
                        style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                        onClick={() => navigate(`/dashboard/dentist/patients/${p.id}`, { state: { activeTab: 'Diagnosis' } })}
                      >
                        Add Record
                      </button>
                      <button 
                        className="ds-action-btn ds-action-btn--approve"
                        style={{ padding: '0.4rem 0.8rem', display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                        onClick={() => navigate(`/dashboard/dentist/patients/${p.id}`, { state: { activeTab: 'Images' } })}
                      >
                        Upload Image
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </Table>
          {filteredPatients.length > 0 && (
            <AdminPagination 
              totalItems={filteredPatients.length} 
              itemName="patients"
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
          title={editingPatient ? 'Edit Patient Record' : 'Add New Patient'} 
          onClose={() => !formSubmitting && setShowFormModal(false)}
        >
          <form onSubmit={submitForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1.5rem 1.5rem' }}>
            {formError && <div style={{ color: 'var(--error-red)', fontSize: '0.9rem' }}><AlertCircle size={15}/> {formError}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleFormChange} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Phone Number</label>
                <input type="text" name="phone_number" value={form.phone_number} onChange={handleFormChange} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Age</label>
                <input type="number" name="age" value={form.age} onChange={handleFormChange} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Birthday</label>
                <input type="date" name="birthday" value={form.birthday} onChange={handleFormChange} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Sex</label>
                <select name="sex" value={form.sex} onChange={handleFormChange} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }}>
                  <option value="" disabled>Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Civil Status</label>
                <select name="civil_status" value={form.civil_status} onChange={handleFormChange} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }}>
                  <option value="" disabled>Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Blood Type</label>
                <select name="blood_type" value={form.blood_type} onChange={handleFormChange} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }}>
                  <option value="" disabled>Select...</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Emergency Contact</label>
                <input type="text" name="emergency_contact" value={form.emergency_contact} onChange={handleFormChange} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)' }}>Full Address</label>
              <textarea name="address" value={form.address} onChange={handleFormChange} required rows={2} style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none', resize: 'vertical' }} />
            </div>

            <button 
              type="submit" 
              disabled={formSubmitting}
              style={{
                marginTop: '0.5rem', padding: '0.75rem', background: 'var(--primary-green)',
                color: '#fff', border: 'none', fontWeight: 600, cursor: formSubmitting ? 'not-allowed' : 'pointer', opacity: formSubmitting ? 0.7 : 1
              }}
            >
              {formSubmitting ? 'Saving...' : 'Save Patient Record'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {patientToDelete && (
        <ModalConfirmation
          title="Delete Patient Record?"
          message={`Are you sure you want to delete the record for ${patientToDelete.name}? This action cannot be undone and will remove all their diagnosis history and files.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          loading={deleteLoading}
          danger={true}
          onConfirm={confirmDelete}
          onCancel={() => setPatientToDelete(null)}
        />
      )}
    </main>
  );
};

export default DentistPatients;
