import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, Activity, Image as ImageIcon, Loader2, AlertCircle, Trash2, X
} from 'lucide-react';
import Header from '../components/Header';
import ButtonWithIcons from '../components/ButtonWithIcons';
import { TableWrap, Table } from '../components/Table';
import Modal from '../components/Modal';
import ModalConfirmation from '../components/ModalConfirmation';
import { useAuth } from '../context/AuthContext';
import '../styles/DentistSchedule.css';

const DentistPatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [patient, setPatient] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab === 'Profile' ? 'Profile' : 'Diagnosis');

  // Modals & Forms
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState(null);
  const [diagnosisForm, setDiagnosisForm] = useState({
    date: '', time: '', chief_complaint: '', diagnosis: '', treatment: '', amount_paid: 0, balance: 0
  });

  const [showImageModal, setShowImageModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadTargetRecordId, setUploadTargetRecordId] = useState(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Selection state
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState(null);
  
  // Fullscreen Image Lightbox
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [patientRes, servicesRes] = await Promise.all([
        fetch(`/api/patients/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/services', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const patientJson = await patientRes.json();
      const servicesJson = await servicesRes.json();

      if (!patientRes.ok) throw new Error(patientJson.message || 'Failed to fetch patient details');
      
      setPatient(patientJson.data);
      if (servicesRes.ok) setServices(servicesJson.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle incoming location state for auto-opening tabs
  useEffect(() => {
    if (location.state?.activeTab) {
      // Since we removed 'Images' tab, map it to Diagnosis
      const tab = location.state.activeTab === 'Images' ? 'Diagnosis' : location.state.activeTab;
      setActiveTab(tab);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Diagnosis Record Handlers
  const openAddDiagnosis = () => {
    setEditingDiagnosis(null);
    setDiagnosisForm({
      date: new Date().toISOString().split('T')[0],
      time: '', chief_complaint: '', diagnosis: '', treatment: '', amount_paid: 0, balance: 0
    });
    setFormError('');
    setShowDiagnosisModal(true);
  };

  const openEditDiagnosis = (record) => {
    setEditingDiagnosis(record);
    setDiagnosisForm({
      date: record.date || '',
      time: record.time || '',
      chief_complaint: record.chief_complaint?.id || record.chief_complaint || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      amount_paid: record.amount_paid || 0,
      balance: record.balance || 0
    });
    setFormError('');
    setShowDiagnosisModal(true);
  };

  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const url = editingDiagnosis 
        ? `/api/patients/${id}/diagnosis/${editingDiagnosis.id}` 
        : `/api/patients/${id}/diagnosis`;
      const method = editingDiagnosis ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(diagnosisForm)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to save record');
      
      await fetchData();
      setShowDiagnosisModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Image Handlers
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile || !uploadTargetRecordId) return;
    
    setFormSubmitting(true);
    setFormError('');

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const res = await fetch(`/api/patients/${id}/diagnosis/${uploadTargetRecordId}/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // fetch handles boundary for FormData
        body: formData
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to upload image');
      
      await fetchData();
      setShowImageModal(false);
      setImageFile(null);
      setUploadTargetRecordId(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleteLoading(true);
    try {
      const { type, recordId } = itemToDelete;
      const url = type === 'diagnosis' 
        ? `/api/patients/${id}/diagnosis/${recordId}`
        : `/api/patients/${id}/images/${recordId}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) await fetchData();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleteLoading(false);
      setItemToDelete(null);
    }
  };

  if (loading) return <main className="ds-page"><div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 size={24} className="au-spin" /></div></main>;
  if (error || !patient) return <main className="ds-page"><div style={{ padding: '3rem', textAlign: 'center', color: 'red' }}><AlertCircle size={20} /> {error || 'Patient not found'}</div></main>;

  return (
    <main className="ds-page">
      <Header 
        title={<><User size={28} /> {patient.name}</>}
        subtitle={`Patient ID: ${patient.id.substring(0, 8).toUpperCase()} • ${patient.age} yrs • ${patient.phone_number}`}
        onBack={() => navigate('/dashboard/dentist/patients')}
      />

      <div style={{ display: 'flex', gap: '1rem', padding: '0 2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
        <button 
          onClick={() => setActiveTab('Profile')} 
          style={{ padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'Profile' ? '2px solid var(--primary-green)' : '2px solid transparent', color: activeTab === 'Profile' ? 'var(--primary-green)' : 'var(--text-muted)', fontWeight: activeTab === 'Profile' ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Personal Info
        </button>
        <button 
          onClick={() => setActiveTab('Diagnosis')} 
          style={{ padding: '1rem 0.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'Diagnosis' ? '2px solid var(--primary-green)' : '2px solid transparent', color: activeTab === 'Diagnosis' ? 'var(--primary-green)' : 'var(--text-muted)', fontWeight: activeTab === 'Diagnosis' ? 600 : 400, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          Diagnosis & Records
        </button>
      </div>

      <div style={{ padding: '0 2rem' }}>
        {/* ── PROFILE TAB ── */}
        {activeTab === 'Profile' && (
          <div style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ background: 'var(--primary-green)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="#fff" />
              <h3 style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: '1rem' }}>Personal Information</h3>
            </div>
            <div style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div><strong style={{ color: 'var(--text-muted)' }}>Full Name:</strong> <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{patient.name}</div></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Phone Number:</strong> <div>{patient.phone_number}</div></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Age & Sex:</strong> <div>{patient.age} / {patient.sex}</div></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Birthday:</strong> <div>{new Date(patient.birthday).toLocaleDateString()}</div></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Civil Status:</strong> <div>{patient.civil_status}</div></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Blood Type:</strong> <div>{patient.blood_type}</div></div>
              <div><strong style={{ color: 'var(--text-muted)' }}>Emergency Contact:</strong> <div>{patient.emergency_contact}</div></div>
              <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: 'var(--text-muted)' }}>Full Address:</strong> <div>{patient.address}</div></div>
            </div>
            </div>
          </div>
        )}

        {/* ── DIAGNOSIS TAB ── */}
        {activeTab === 'Diagnosis' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginBottom: '1rem' }}>
              <ButtonWithIcons
                iconName="Plus"
                label="Add Record"
                variant="default"
                onClick={openAddDiagnosis}
              />
              <ButtonWithIcons
                iconName="Edit2"
                label="Edit Record"
                variant="gold"
                disabled={!selectedDiagnosisId}
                onClick={() => {
                  const rec = patient.diagnosis_records.find(r => r.id === selectedDiagnosisId);
                  if (rec) openEditDiagnosis(rec);
                }}
              />
              <ButtonWithIcons
                iconName="Trash2"
                label="Delete Record"
                variant="danger"
                disabled={!selectedDiagnosisId}
                onClick={() => setItemToDelete({ type: 'diagnosis', recordId: selectedDiagnosisId })}
              />
            </div>
            <TableWrap>
              <Table headers={['Date/Time', 'Chief Complaint', 'Diagnosis', 'Treatment', 'Fees (Paid/Bal)']}>
                {(!patient.diagnosis_records || patient.diagnosis_records.length === 0) ? (
                  <tr><td colSpan="5" className="st-table__empty">No diagnosis records found.</td></tr>
                ) : (
                  patient.diagnosis_records.sort((a,b) => new Date(b.date) - new Date(a.date)).map(record => (
                    <React.Fragment key={record.id}>
                      <tr 
                        className={selectedDiagnosisId === record.id ? 'st-table__row--selected' : ''}
                        onClick={() => setSelectedDiagnosisId(record.id === selectedDiagnosisId ? null : record.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div style={{ fontWeight: 600 }}>{new Date(record.date).toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{record.time}</div>
                        </td>
                        <td style={{ maxWidth: '200px' }}>{record.chief_complaint?.name || record.chief_complaint || 'N/A'}</td>
                        <td style={{ maxWidth: '200px' }}>{record.diagnosis}</td>
                        <td style={{ maxWidth: '200px' }}>{record.treatment}</td>
                        <td>
                          <div style={{ color: 'var(--primary-green)', fontWeight: 600 }}>₱{record.amount_paid}</div>
                          <div style={{ fontSize: '0.8rem', color: record.balance > 0 ? 'var(--error-red)' : 'var(--text-muted)' }}>Bal: ₱{record.balance}</div>
                        </td>
                      </tr>
                      {/* Accordion Content (Images) */}
                      {selectedDiagnosisId === record.id && (
                        <tr style={{ backgroundColor: '#fafafa' }}>
                          <td colSpan="5" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <h4 style={{ margin: 0, color: 'var(--text-dark)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ImageIcon size={18} /> Images & X-Rays for this visit
                              </h4>
                              <ButtonWithIcons
                                iconName="Upload"
                                label="Upload Image"
                                variant="default"
                                onClick={() => { 
                                  setImageFile(null); 
                                  setFormError(''); 
                                  setUploadTargetRecordId(record.id);
                                  setShowImageModal(true); 
                                }}
                              />
                            </div>
                            
                            {(!record.patient_images || record.patient_images.length === 0) ? (
                              <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', border: '1px dashed var(--border-light)', color: 'var(--text-muted)' }}>
                                No images or X-rays uploaded for this diagnosis record yet.
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                                {record.patient_images.map(img => (
                                  <div 
                                    key={img.id} 
                                    style={{ 
                                      border: '1px solid var(--border-light)', 
                                      borderRadius: '8px', overflow: 'hidden', background: '#fff', 
                                      display: 'flex', flexDirection: 'column'
                                    }}
                                  >
                                    <div 
                                      onClick={() => setFullscreenImage(img.file_url)}
                                      style={{ cursor: 'pointer', display: 'block', height: '140px', background: '#f5f5f5', overflow: 'hidden' }}
                                    >
                                      <img src={img.file_url} alt={img.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }} title={img.file_name}>
                                        {img.file_name}
                                      </span>
                                      <button 
                                        onClick={() => setItemToDelete({ type: 'image', recordId: img.id })}
                                        style={{ background: 'none', border: 'none', color: 'var(--error-red)', cursor: 'pointer', padding: '0.2rem' }}
                                        title="Delete Image"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </Table>
            </TableWrap>
          </div>
        )}
      </div>

      {/* ── Diagnosis Modal ── */}
      {showDiagnosisModal && (
        <Modal 
          title={editingDiagnosis ? 'Edit Diagnosis Record' : 'Add Diagnosis Record'} 
          onClose={() => !formSubmitting && setShowDiagnosisModal(false)}
        >
          <form onSubmit={handleDiagnosisSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1.5rem 1.5rem' }}>
            {formError && <div style={{ color: 'var(--error-red)', fontSize: '0.9rem' }}><AlertCircle size={15}/> {formError}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Date</label>
                <input type="date" value={diagnosisForm.date} onChange={e => setDiagnosisForm({...diagnosisForm, date: e.target.value})} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Time</label>
                <input type="time" value={diagnosisForm.time} onChange={e => setDiagnosisForm({...diagnosisForm, time: e.target.value})} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Chief Complaint (Service)</label>
              <select value={diagnosisForm.chief_complaint} onChange={e => setDiagnosisForm({...diagnosisForm, chief_complaint: e.target.value})} required style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }}>
                <option value="" disabled>Select...</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Diagnosis</label>
              <textarea value={diagnosisForm.diagnosis} onChange={e => setDiagnosisForm({...diagnosisForm, diagnosis: e.target.value})} required rows={2} style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Treatment</label>
              <textarea value={diagnosisForm.treatment} onChange={e => setDiagnosisForm({...diagnosisForm, treatment: e.target.value})} required rows={2} style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Amount Paid (₱)</label>
                <input type="number" min="0" value={diagnosisForm.amount_paid} onChange={e => setDiagnosisForm({...diagnosisForm, amount_paid: e.target.value})} style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Balance (₱)</label>
                <input type="number" min="0" value={diagnosisForm.balance} onChange={e => setDiagnosisForm({...diagnosisForm, balance: e.target.value})} style={{ padding: '0.65rem', border: '1px solid var(--border-light)', outline: 'none' }} />
              </div>
            </div>

            <button type="submit" disabled={formSubmitting} style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--primary-green)', color: '#fff', border: 'none', fontWeight: 600, cursor: formSubmitting ? 'not-allowed' : 'pointer', opacity: formSubmitting ? 0.7 : 1 }}>
              {formSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Image Upload Modal ── */}
      {showImageModal && (
        <Modal title="Upload Image or X-Ray" onClose={() => !formSubmitting && setShowImageModal(false)}>
          <form onSubmit={handleImageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0 1.5rem 1.5rem' }}>
            {formError && <div style={{ color: 'var(--error-red)', fontSize: '0.9rem' }}><AlertCircle size={15}/> {formError}</div>}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select File (JPG, PNG, GIF)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => setImageFile(e.target.files[0])} 
                required 
                style={{ padding: '0.65rem', border: '1px solid var(--border-light)' }} 
              />
            </div>

            <button type="submit" disabled={!imageFile || formSubmitting} style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--primary-green)', color: '#fff', border: 'none', fontWeight: 600, cursor: (formSubmitting || !imageFile) ? 'not-allowed' : 'pointer', opacity: (formSubmitting || !imageFile) ? 0.7 : 1 }}>
              {formSubmitting ? 'Uploading...' : 'Upload Image'}
            </button>
          </form>
        </Modal>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {itemToDelete && (
        <ModalConfirmation
          title={itemToDelete.type === 'diagnosis' ? "Delete Record?" : "Delete Image?"}
          message={`Are you sure you want to delete this ${itemToDelete.type}? This action cannot be undone.`}
          confirmText="Yes, Delete"
          cancelText="Cancel"
          loading={deleteLoading}
          danger={true}
          onConfirm={confirmDelete}
          onCancel={() => setItemToDelete(null)}
        />
      )}

      {/* ── Fullscreen Image Modal (Lightbox) ── */}
      {fullscreenImage && (
        <div 
          onClick={() => setFullscreenImage(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'zoom-out'
          }}
        >
          <button 
            onClick={() => setFullscreenImage(null)}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <X size={32} />
          </button>
          <img 
            src={fullscreenImage} 
            alt="Fullscreen View" 
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} 
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
    </main>
  );
};

export default DentistPatientDetails;
