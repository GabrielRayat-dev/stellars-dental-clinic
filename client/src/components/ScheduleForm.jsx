import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import ModalConfirmation from './ModalConfirmation';
import { useAuth } from '../context/AuthContext';
import '../styles/ScheduleForm.css';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00'
];

// Format date using local date components (avoids timezone issues)
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const format12h = (time24) => {
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${minutes} ${ampm}`;
};

const analyzeTimeSlot = (date, time, appointments) => {
  const dateStr = getLocalDateString(date);
  const timeDisplay = format12h(time);
  const slotAppointments = appointments.filter(app => {
    return app.preferred_date === dateStr && app.preferred_time === timeDisplay;
  });

  const hasPending = slotAppointments.some(app => app.status === 'pending');
  const hasApproved = slotAppointments.some(app => app.status === 'approved');
  const pendingCount = slotAppointments.filter(app => app.status === 'pending').length;

  return { hasPending, hasApproved, pendingCount };
};

const analyzeDateStatus = (date, appointments) => {
  const dateStr = getLocalDateString(date);
  const dateAppointments = appointments.filter(app => app.preferred_date === dateStr);
  const hasAppointments = dateAppointments.length > 0;
  
  const approvedPerSlot = TIME_SLOTS.map(time => {
    return analyzeTimeSlot(date, time, appointments).hasApproved;
  });
  const isFullyBooked = TIME_SLOTS.length > 0 && approvedPerSlot.every(b => b);

  return { hasAppointments, isFullyBooked };
};

const ScheduleForm = ({ onSuccess, publicMode = false }) => {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Success state
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

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch services and appointments
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services
        const servicesRes = await fetch('/api/services/public');
        const servicesJson = await servicesRes.json();
        if (servicesRes.ok && servicesJson.data) {
          setServices(servicesJson.data);
        }

        // Fetch appointments to show availability
        let appointmentsUrl = '/api/appointments/public/availability';
        let appointmentsHeaders = {};
        
        // If authenticated (protected mode), use the authenticated endpoint
        if (token) {
          appointmentsUrl = '/api/appointments';
          appointmentsHeaders = { Authorization: `Bearer ${token}` };
        }
        
        const appointmentsRes = await fetch(appointmentsUrl, {
          headers: appointmentsHeaders
        });
        const appointmentsJson = await appointmentsRes.json();
        if (appointmentsRes.ok && appointmentsJson.data) {
          setAppointments(appointmentsJson.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [token, publicMode]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate calendar days
  const monthDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }

    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return; // Disable past dates

    const status = analyzeDateStatus(date, appointments);
    if (status.isFullyBooked) return; // Fully booked dates are not clickable

    setSelectedDate(date);
    // Reset time when date changes
    setForm(f => ({ ...f, preferred_date: '', preferred_time: '' }));
  };

  const handleTimeSlotClick = (time) => {
    const dateStr = getLocalDateString(selectedDate);
    const timeStr = format12h(time);
    
    const { hasApproved } = analyzeTimeSlot(selectedDate, time, appointments);
    if (hasApproved) return; // Booked slots are not clickable

    setForm(f => ({
      ...f,
      preferred_date: dateStr,
      preferred_time: timeStr
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
      setSelectedDate(null);

      if (publicMode) {
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
      <div className="sf-card sf-card--integrated">
        <h2 className="sf-title">{publicMode ? 'Book an Appointment' : 'Schedule a Patient'}</h2>
        <p className="sf-subtitle">Fill in your details, choose a date and time, and confirm your appointment.</p>
        
        <div className="sf-integrated-layout">
          {/* ── Left Column: Form ── */}
          <div className="sf-form-column">
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

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
                  {form.preferred_date && form.preferred_time 
                    ? `📅 Selected: ${formatDateForDisplay(form.preferred_date)} at ${form.preferred_time}`
                    : 'Select a date and time →'
                  }
                </p>
                <button type="submit" className="sf-submit-btn" disabled={submitting || !form.preferred_date || !form.preferred_time}>
                  {submitting ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              </div>
            </form>
          </div>

          {/* ── Middle Column: Calendar ── */}
          <div className="sf-calendar-column">
            <div className="sf-calendar-header">
              <button onClick={handlePrevMonth} className="sf-nav-btn">
                <ChevronLeft size={18} />
              </button>
              <h4 className="sf-calendar-title">{monthName}</h4>
              <button onClick={handleNextMonth} className="sf-nav-btn">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day headers */}
            <div className="sf-weekdays">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="sf-weekday">{day}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="sf-days-grid">
              {monthDays.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="sf-day sf-day--empty"></div>;
                }

                const dateStr = getLocalDateString(date);
                const isSelected = selectedDate && getLocalDateString(selectedDate) === dateStr;
                const isToday = new Date().toDateString() === date.toDateString();
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPast = date < today;
                
                const { hasAppointments, isFullyBooked } = analyzeDateStatus(date, appointments);

                return (
                  <div
                    key={dateStr}
                    className={`sf-day 
                      ${isSelected ? 'sf-day--selected' : ''} 
                      ${isToday ? 'sf-day--today' : ''} 
                      ${hasAppointments && !isFullyBooked ? 'sf-day--has-appointments' : ''}
                      ${isFullyBooked ? 'sf-day--fully-booked' : ''}
                      ${isPast ? 'sf-day--past' : ''}
                    `}
                    onClick={() => !isPast && !isFullyBooked && handleDateClick(date)}
                  >
                    <span className="sf-day-number">{date.getDate()}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="sf-calendar-legend">
              <div className="sf-legend-item">
                <div className="sf-legend-box sf-legend-box--default"></div>
                <span>Available</span>
              </div>
              <div className="sf-legend-item">
                <div className="sf-legend-box sf-legend-box--has-requests"></div>
                <span>Has Requests</span>
              </div>
              <div className="sf-legend-item">
                <div className="sf-legend-box sf-legend-box--fully-booked"></div>
                <span>Booked</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: Time Slots ── */}
          {selectedDate && (
            <div className="sf-timeslots-column">
              <h4 className="sf-timeslots-title">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h4>
              <p className="sf-timeslots-subtitle">Select a time slot</p>

              <div className="sf-time-grid">
                {TIME_SLOTS.map(time => {
                  const { hasPending, hasApproved, pendingCount } = analyzeTimeSlot(
                    selectedDate,
                    time,
                    appointments
                  );

                  const isClickable = !hasApproved;
                  const isSelected = form.preferred_time === format12h(time) && form.preferred_date === getLocalDateString(selectedDate);
                  const slotClass = `
                    sf-time-slot
                    ${hasApproved ? 'sf-time-slot--booked' : ''}
                    ${hasPending ? 'sf-time-slot--pending' : ''}
                    ${isSelected ? 'sf-time-slot--selected' : ''}
                  `;

                  return (
                    <div
                      key={time}
                      className={slotClass}
                      onClick={() => isClickable && handleTimeSlotClick(time)}
                    >
                      <div className="sf-time-slot-time">{format12h(time)}</div>
                      {hasPending && (
                        <div className="sf-time-slot-badge">{pendingCount}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend for time slots */}
              <div className="sf-timeslots-legend">
                <div className="sf-legend-item">
                  <div className="sf-legend-box sf-legend-box--time-default"></div>
                  <span>No Requests</span>
                </div>
                <div className="sf-legend-item">
                  <div className="sf-legend-box sf-legend-box--time-pending"></div>
                  <span>Has Requests</span>
                </div>
                <div className="sf-legend-item">
                  <div className="sf-legend-box sf-legend-box--time-booked"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <ModalConfirmation
          title="Confirm Appointment"
          message={`Schedule ${form.patient_name || 'this patient'} on ${formatDateForDisplay(form.preferred_date)} at ${form.preferred_time}?`}
          confirmText="Yes, Schedule"
          cancelText="Go Back"
          loading={submitting}
          onConfirm={submitAppointment}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default ScheduleForm;
