import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import '../styles/ScheduleForm.css';

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
];

const ScheduleForm = ({ onSuccess }) => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  
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

  // Date/Time Selection
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempDate, setTempDate] = useState(null);
  const dateScrollRef = useRef(null);

  // Drag to scroll logic
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
        const res = await fetch('/api/services', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok && json.data) {
          setServices(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      }
    };
    fetchServices();
  }, [token]);

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

  const onMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - dateScrollRef.current.offsetLeft);
    setScrollLeft(dateScrollRef.current.scrollLeft);
  };
  const onMouseLeave = () => setIsDragging(false);
  const onMouseUp = () => setIsDragging(false);
  const onMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - dateScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    dateScrollRef.current.scrollLeft = scrollLeft - walk;
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

  const submitAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to create appointment');
      
      setForm(emptyForm);
      if (onSuccess) onSuccess();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sf-container">
      <div className="sf-card">
        <h2 className="sf-title">Schedule a Patient</h2>
        <p className="sf-subtitle">Please enter the patient's name, phone number, service, and its date and time!</p>
        
        <form className="sf-form" onSubmit={submitAppointment}>
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
                  
                  return (
                    <div 
                      key={dateStr} 
                      data-date={dateStr}
                      className={`sf-date-box ${isSelected ? 'sf-date-box--selected' : ''}`}
                      onClick={() => {
                        if (!isDragging) handleDateClick(d);
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
