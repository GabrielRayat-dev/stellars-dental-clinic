import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/ScheduleForm.css';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00'
];

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

const toHHMM = (timeStr) => {
  if (!timeStr) return '';
  const str = timeStr.trim();
  const match24 = str.match(/^(\d{1,2}):(\d{2})(:\d{2})?$/);
  if (match24) {
    return `${String(parseInt(match24[1])).padStart(2, '0')}:${match24[2]}`;
  }
  const match12 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1]);
    const m = match12[2];
    const ampm = match12[3].toUpperCase();
    if (ampm === 'AM' && h === 12) h = 0;
    if (ampm === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${m}`;
  }
  return str;
};

const analyzeTimeSlot = (date, time, appointments) => {
  const dateStr = getLocalDateString(date);
  const slotAppointments = appointments.filter(app => {
    return app.preferred_date === dateStr && toHHMM(app.preferred_time) === time;
  });
  const hasPending = slotAppointments.some(app => app.status === 'pending');
  const hasApproved = slotAppointments.some(app => app.status === 'approved');
  const pendingCount = slotAppointments.filter(app => app.status === 'pending').length;
  return { hasPending, hasApproved, pendingCount };
};

const analyzeDateStatus = (date, appointments) => {
  const dateStr = getLocalDateString(date);
  const dateAppointments = appointments.filter(app => app.preferred_date === dateStr);
  const totalPendingCount = dateAppointments.filter(app => app.status === 'pending').length;
  const hasPending = totalPendingCount > 0;
  const hasAppointments = dateAppointments.length > 0;
  const approvedPerSlot = TIME_SLOTS.map(time => analyzeTimeSlot(date, time, appointments).hasApproved);
  const isFullyBooked = TIME_SLOTS.length > 0 && approvedPerSlot.every(b => b);
  return { hasPending, totalPendingCount, hasAppointments, isFullyBooked };
};

/**
 * CalendarView — view-only version of the ScheduleForm calendar + timeslots.
 * Uses the same sf- CSS classes and logic so it looks identical to the Schedule page.
 */
const CalendarView = ({ appointments = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const monthDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
    }
    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handleDateClick = (date) => {
    const { isFullyBooked } = analyzeDateStatus(date, appointments);
    if (isFullyBooked) return;
    setSelectedDate(date);
  };

  return (
    <div className="cv-layout">

      {/* ── Calendar Panel ── */}
      <div className="sf-calendar-column" style={{ background: 'transparent', padding: 0 }}>
        <div className="sf-calendar-header">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="sf-nav-btn">
            <ChevronLeft size={18} />
          </button>
          <h4 className="sf-calendar-title">{monthName}</h4>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="sf-nav-btn">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="sf-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="sf-weekday">{day}</div>
          ))}
        </div>

        <div className="sf-days-grid">
          {monthDays.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} className="sf-day sf-day--empty" />;
            const dateStr = getLocalDateString(date);
            const isSelected = selectedDate && getLocalDateString(selectedDate) === dateStr;
            const isToday = new Date().toDateString() === date.toDateString();
            const { hasPending, totalPendingCount, isFullyBooked } = analyzeDateStatus(date, appointments);

            return (
              <div
                key={dateStr}
                className={`sf-day
                  ${isSelected ? 'sf-day--selected' : ''}
                  ${isToday ? 'sf-day--today' : ''}
                  ${hasPending && !isFullyBooked ? 'sf-day--has-pending' : ''}
                  ${isFullyBooked ? 'sf-day--fully-booked' : ''}
                `}
                onClick={() => handleDateClick(date)}
              >
                <span className="sf-day-number">{date.getDate()}</span>
                {hasPending && !isFullyBooked && (
                  <div className="sf-day-badge">{totalPendingCount}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="sf-calendar-legend">
          <div className="sf-legend-item">
            <div className="sf-legend-box sf-legend-box--default" />
            <span>Available</span>
          </div>
          <div className="sf-legend-item">
            <div className="sf-legend-box sf-legend-box--has-requests" />
            <span>Has Requests</span>
          </div>
          <div className="sf-legend-item">
            <div className="sf-legend-box sf-legend-box--fully-booked" />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* ── Time Slots Panel (shown when a date is selected) ── */}
      {selectedDate && (
        <div className="sf-timeslots-column" style={{ background: 'transparent', padding: 0 }}>
          <h4 className="sf-timeslots-title">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h4>
          <p className="sf-timeslots-subtitle">Select a time slot</p>

          <div className="sf-time-grid">
            {TIME_SLOTS.map(time => {
              const { hasPending, hasApproved, pendingCount } = analyzeTimeSlot(selectedDate, time, appointments);
              const slotClass = `sf-time-slot
                ${hasApproved ? 'sf-time-slot--booked' : ''}
                ${hasPending && !hasApproved ? 'sf-time-slot--pending' : ''}
              `;
              return (
                <div key={time} className={slotClass}>
                  <div className="sf-time-slot-time">{format12h(time)}</div>
                  {hasPending && !hasApproved && (
                    <div className="sf-time-slot-badge">{pendingCount}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="sf-timeslots-legend">
            <div className="sf-legend-item">
              <div className="sf-legend-box sf-legend-box--time-default" />
              <span>No Requests</span>
            </div>
            <div className="sf-legend-item">
              <div className="sf-legend-box sf-legend-box--time-pending" />
              <span>Has Requests</span>
            </div>
            <div className="sf-legend-item">
              <div className="sf-legend-box sf-legend-box--time-booked" />
              <span>Booked</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
