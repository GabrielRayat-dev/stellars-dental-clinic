import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import ModalConfirmation from './ModalConfirmation';
import { useAuth } from '../context/AuthContext';
import '../styles/ScheduleForm.css';

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const ScheduleForm = ({ onSuccess, publicMode = false }) => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);

  // Success state (public mode shows tracking number)
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  
  // Form State
  const emptyForm = {
    patient_name: '',
    phone_number: '',
    service_id: '',
    preferred_date: '',
    preferred_time: ''
  };
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Date/Time Selection
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempDate, setTempDate] = useState(null);
  const dateScrollRef = useRef(null);


  // Generate 90 days starting from today (no past dates)
  const datesList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [];
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const url = publicMode ? '/api/services/public' : '/api/services/public';
        const headers = publicMode ? {} : { Authorization: `Bearer ${token}` };
        const res = await fetch(url, { headers });
        const json = await res.json();
        if (res.ok && json.data) {
          setServices(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };
    fetchServices();
  }, [token, publicMode]);

  const handleScroll = () => {
    if (!dateScrollRef.current) return;
    const container = dateScrollRef.current;
    const children = Array.from(container.children);
    
    let firstIdx = 0;
    for (let i = 0; i < children.length; i++) {
      if (children[i].offsetLeft - container.offsetLeft >= container.scrollLeft - 5) {
        firstIdx = i;
        break;
      }
    }

    const visibleDateStr = children[firstIdx]?.getAttribute('data-date');
    if (visibleDateStr) {
      const visibleDate = new Date(visibleDateStr);
      if (visibleDate.getMonth() !== currentMonthDate.getMonth() || visibleDate.getFullYear() !== currentMonthDate.getFullYear()) {
        setCurrentMonthDate(new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1));
      }
    }
  };

  const navigateToMonth = (direction) => {
    const targetMonth = new Date(currentMonthDate);
    targetMonth.setMonth(targetMonth.getMonth() + direction);
    
    const targetIdx = datesList.findIndex(d => d.getMonth() === targetMonth.getMonth() && d.getFullYear() === targetMonth.getFullYear());
    
    if (targetIdx !== -1 && dateScrollRef.current) {
      const container = dateScrollRef.current;
      const targetElement = container.children[targetIdx];
      if (targetElement) {
        container.scroll({
          left: targetElement.offsetLeft - container.offsetLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const scrollToDate = (dateObj, smooth = true) => {
    if (!dateScrollRef.current) return;
    const container = dateScrollRef.current;
    const targetDate = formatDateForBackend(dateObj);
    const targetEl = Array.from(container.children).find(
      (el) => el.getAttribute('data-date') === targetDate
    );
    if (targetEl) {
      container.scroll({
        left: targetEl.offsetLeft - container.offsetLeft,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  const scrollToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scrollToDate(today, true);
    const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonthDate(todayMonth);
  };

  // Ref-based mouse drag with momentum/inertia
  const dragState = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
    velX: 0,          // current velocity (px/ms)
    lastX: 0,
    lastTime: 0,
    rafId: null,      // animation frame id for momentum
  });

  const stopMomentum = () => {
    if (dragState.current.rafId) {
      cancelAnimationFrame(dragState.current.rafId);
      dragState.current.rafId = null;
    }
  };

  const applyMomentum = () => {
    const ds = dragState.current;
    const el = dateScrollRef.current;
    if (!el || Math.abs(ds.velX) < 0.3) {
      stopMomentum();
      return;
    }
    el.scrollLeft += ds.velX * 16; // 16ms ≈ one frame
    ds.velX *= 0.92;               // friction — higher = slides longer
    ds.rafId = requestAnimationFrame(applyMomentum);
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    stopMomentum();
    const ds = dragState.current;
    ds.active    = true;
    ds.moved     = false;
    ds.startX    = e.pageX;
    ds.lastX     = e.pageX;
    ds.lastTime  = performance.now();
    ds.velX      = 0;
    ds.scrollLeft = dateScrollRef.current.scrollLeft;
    dateScrollRef.current.style.cursor = 'grabbing';
    dateScrollRef.current.style.scrollBehavior = 'auto';
    e.preventDefault();
  };

  const onMouseMove = (e) => {
    const ds = dragState.current;
    if (!ds.active) return;
    const now = performance.now();
    const dx  = e.pageX - ds.startX;
    if (Math.abs(dx) > 3) ds.moved = true;

    // Track velocity (px per ms)
    const dt = now - ds.lastTime;
    if (dt > 0) {
      ds.velX = (ds.lastX - e.pageX) / dt;
    }
    ds.lastX    = e.pageX;
    ds.lastTime = now;

    dateScrollRef.current.scrollLeft = ds.scrollLeft - dx;
  };

  const onMouseUp = () => {
    const ds = dragState.current;
    ds.active = false;
    if (dateScrollRef.current) {
      dateScrollRef.current.style.cursor = '';
      dateScrollRef.current.style.scrollBehavior = '';
    }
    // Kick off momentum if the user was moving fast enough
    if (Math.abs(ds.velX) > 0.3) {
      ds.rafId = requestAnimationFrame(applyMomentum);
    }
  };

  const onMouseLeave = () => {
    const ds = dragState.current;
    if (!ds.active) return;
    ds.active = false;
    if (dateScrollRef.current) {
      dateScrollRef.current.style.cursor = '';
      dateScrollRef.current.style.scrollBehavior = '';
    }
    if (Math.abs(ds.velX) > 0.3) {
      ds.rafId = requestAnimationFrame(applyMomentum);
    }
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const formatDateForBackend = (dateObj) => {
    const d = new Date(dateObj);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleDateClick = (dateObj) => {
    if (dragState.current.moved) return; // ignore click if user was dragging
    setTempDate(dateObj);
    setShowTimeModal(true);
  };

  const selectTime = (timeSlot) => {
    setForm(f => ({
      ...f,
      preferred_date: formatDateForBackend(tempDate),
      preferred_time: timeSlot
    }));
    setShowTimeModal(false);
  };

  // Show confirmation modal instead of submitting directly
  const handleSubmitClick = (e) => {
    e.preventDefault();
    setFormError('');
    setShowConfirm(true);
  };

  const submitAppointment = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setFormError('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (!publicMode && token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers,
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create appointment');

      setForm(emptyForm);

      if (publicMode) {
        // Show inline success with tracking number instead of calling onSuccess
        setTrackingNumber(json.data?.tracking_number || json.data?.id || '');
        setSubmitted(true);
      } else {
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && publicMode) {
    return (
      <div className="sf-container">
        <div className="sf-card">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
            <CheckCircle2 size={52} color="var(--primary-green)" />
            <h2 className="sf-title">Appointment Submitted!</h2>
            <p className="sf-subtitle" style={{ marginBottom: 0 }}>Your appointment request has been received. We'll confirm it shortly.</p>
            {trackingNumber && (
              <div style={{ background: 'var(--primary-green-light)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '0.6rem 1.5rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                Tracking #: <strong>{trackingNumber}</strong>
              </div>
            )}
            <button
              className="sf-submit-btn"
              style={{ marginTop: '0.5rem', maxWidth: '220px' }}
              onClick={() => { setSubmitted(false); setTrackingNumber(''); }}
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sf-container">
      <div className="sf-card">
        <h2 className="sf-title">{publicMode ? 'Book an Appointment' : 'Schedule a Patient'}</h2>
        <p className="sf-subtitle">{publicMode ? 'Fill in your details, choose a date and time, and we\'ll confirm your appointment.' : "Please enter the patient's name, phone number, service, and its date and time!"}</p>
        
        <form className="sf-form" onSubmit={handleSubmitClick}>
          {formError && <div style={{ color: 'var(--error-red)', fontSize: '0.9rem', marginBottom: '1rem' }}><AlertCircle size={15}/> {formError}</div>}
          
          <div className="sf-field">
            <label>Patient Name</label>
            <input className="sf-input" name="patient_name" value={form.patient_name} onChange={handleFormChange} placeholder="Juan Cruz" required />
          </div>
          
          <div className="sf-field">
            <label>Phone Number</label>
            <input className="sf-input" name="phone_number" value={form.phone_number} onChange={handleFormChange} placeholder="09123456789" required />
          </div>
          
          <div className="sf-field">
            <label>Service</label>
            <select className="sf-input" name="service_id" value={form.service_id} onChange={handleFormChange} required>
              <option value="" disabled>Select a service</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="sf-date-picker-wrap">
            <div className="sf-date-header">
              <span>Choose a Date and Time</span>
              <div className="sf-month-nav">
                <button type="button" className="sf-today-btn" onClick={scrollToToday}>Today</button>
                <button type="button" onClick={() => navigateToMonth(-1)}><ChevronLeft size={16}/></button>
                <span style={{ minWidth: '100px', textAlign: 'center' }}>
                  {currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button type="button" onClick={() => navigateToMonth(1)}><ChevronRight size={16}/></button>
              </div>
            </div>
            <div className="sf-date-carousel-wrap">
              <div 
                className="sf-date-grid" 
                ref={dateScrollRef}
                onScroll={handleScroll}
                onMouseDown={onMouseDown}
                onMouseLeave={onMouseLeave}
                onMouseUp={onMouseUp}
                onMouseMove={onMouseMove}
              >
                {datesList.map((d) => {
                  const dateStr = formatDateForBackend(d);
                  const isSelected = form.preferred_date === dateStr;
                  const todayStr = formatDateForBackend(new Date());
                  const isToday = dateStr === todayStr;
                  
                  return (
                    <div 
                      key={dateStr} 
                      data-date={dateStr}
                      className={`sf-date-box ${isSelected ? 'sf-date-box--selected' : ''} ${isToday ? 'sf-date-box--today' : ''}`}
                      onClick={() => {
                    if (!dragState.current.moved) handleDateClick(d);
                  }}
                    >
                      <span className="sf-date-box__month">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="sf-date-box__day">{d.getDate()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {form.preferred_time && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--primary-green)', fontWeight: 'bold' }}>
                Selected Time: {form.preferred_time} on {formatDateForDisplay(form.preferred_date)}
              </div>
            )}
          </div>

          <button type="submit" className="sf-submit-btn" disabled={submitting}>
            {submitting ? 'Scheduling...' : 'Schedule Appointment'}
          </button>
        </form>
      </div>

      {showConfirm && (
        <ModalConfirmation
          title="Confirm Appointment"
          message={`Schedule ${form.patient_name || 'this patient'} on ${form.preferred_date ? new Date(form.preferred_date + 'T00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'} at ${form.preferred_time || '—'}?`}
          confirmText="Yes, Schedule"
          cancelText="Go Back"
          loading={submitting}
          onConfirm={submitAppointment}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {showTimeModal && (
        <Modal 
          title={`Select Time for ${tempDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`} 
          onClose={() => setShowTimeModal(false)}
        >
          <div style={{ padding: '0 1.5rem 1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Click a time slot to confirm your selection.</p>
            <div className="sf-time-grid">
              {TIME_SLOTS.map(time => {
                const isCurrentSelection = form.preferred_time === time && form.preferred_date === formatDateForBackend(tempDate);
                return (
                  <button 
                    key={time} 
                    className={`sf-time-slot ${isCurrentSelection ? 'sf-time-slot--selected' : ''}`}
                    onClick={() => selectTime(time)}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ScheduleForm;
