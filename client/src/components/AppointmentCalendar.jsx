import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/AppointmentCalendar.css';

const HOURS_START = 8;
const HOURS_END = 17;
const HOURS_PER_DAY = HOURS_END - HOURS_START; // 9 hours (8 AM - 5 PM)

/**
 * Generate time slots for a day (1-hour intervals)
 * Returns array like ['08:00', '09:00', '10:00', ...]
 */
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = HOURS_START; hour < HOURS_END; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
  }
  return slots;
};

/**
 * Convert 24h format to 12h format
 * '08:00' -> '8:00 AM'
 */
const format12h = (time24) => {
  const [hours, minutes] = time24.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${minutes} ${ampm}`;
};

/**
 * Analyze appointments for a specific date and time slot
 * Returns: { hasPending, hasApproved, pendingCount }
 */
const analyzeTimeSlot = (date, time, appointments) => {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const slotAppointments = appointments.filter(app => {
    return app.preferred_date === dateStr && app.preferred_time === format12h(time);
  });

  const hasPending = slotAppointments.some(app => app.status === 'pending');
  const hasApproved = slotAppointments.some(app => app.status === 'approved');
  const pendingCount = slotAppointments.filter(app => app.status === 'pending').length;

  return { hasPending, hasApproved, pendingCount };
};

/**
 * Analyze appointments for a specific date
 * Returns: { hasAppointments, isFullyBooked }
 */
const analyzeDateStatus = (date, appointments) => {
  const dateStr = date.toISOString().split('T')[0];
  const dateAppointments = appointments.filter(app => app.preferred_date === dateStr);
  const hasAppointments = dateAppointments.length > 0;
  
  // Fully booked if all time slots have approved appointments
  const timeSlots = generateTimeSlots();
  const approvedPerSlot = timeSlots.map(time => {
    return analyzeTimeSlot(date, time, appointments).hasApproved;
  });
  const isFullyBooked = timeSlots.length > 0 && approvedPerSlot.every(b => b);

  return { hasAppointments, isFullyBooked };
};

const AppointmentCalendar = ({ appointments = [], onTimeSlotSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Generate days for current month's calendar
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (date) => {
    const status = analyzeDateStatus(date, appointments);
    if (status.isFullyBooked) return; // Fully booked dates are not clickable
    setSelectedDate(date);
  };

  const handleTimeSlotClick = (time) => {
    if (onTimeSlotSelect) {
      onTimeSlotSelect(selectedDate, time);
    }
  };

  return (
    <div className="ac-container">
      <div className="ac-layout">
        {/* ── Calendar Panel ── */}
        <div className="ac-calendar-panel">
          <div className="ac-calendar-header">
            <button onClick={handlePrevMonth} className="ac-nav-btn">
              <ChevronLeft size={20} />
            </button>
            <h3 className="ac-month-title">{monthName}</h3>
            <button onClick={handleNextMonth} className="ac-nav-btn">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="ac-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="ac-weekday">{day}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="ac-days-grid">
            {monthDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="ac-day ac-day--empty"></div>;
              }

              const dateStr = date.toISOString().split('T')[0];
              const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dateStr;
              const { hasAppointments, isFullyBooked } = analyzeDateStatus(date, appointments);
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <div
                  key={dateStr}
                  className={`ac-day 
                    ${isSelected ? 'ac-day--selected' : ''} 
                    ${isToday ? 'ac-day--today' : ''} 
                    ${hasAppointments && !isFullyBooked ? 'ac-day--has-appointments' : ''}
                    ${isFullyBooked ? 'ac-day--fully-booked' : ''}
                  `}
                  onClick={() => handleDateClick(date)}
                >
                  <span className="ac-day-number">{date.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="ac-legend">
            <div className="ac-legend-item">
              <div className="ac-legend-box ac-legend-box--default"></div>
              <span>Available</span>
            </div>
            <div className="ac-legend-item">
              <div className="ac-legend-box ac-legend-box--has-requests"></div>
              <span>Has Requests</span>
            </div>
            <div className="ac-legend-item">
              <div className="ac-legend-box ac-legend-box--fully-booked"></div>
              <span>Fully Booked</span>
            </div>
          </div>
        </div>

        {/* ── Time Slots Panel ── */}
        {selectedDate && (
          <div className="ac-time-panel">
            <div className="ac-time-header">
              <h4 className="ac-time-title">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
              <p className="ac-time-subtitle">Select a time slot</p>
            </div>

            <div className="ac-time-grid">
              {timeSlots.map(time => {
                const { hasPending, hasApproved, pendingCount } = analyzeTimeSlot(
                  selectedDate,
                  time,
                  appointments
                );

                const isClickable = !hasApproved;
                const slotClass = `
                  ac-time-slot
                  ${hasApproved ? 'ac-time-slot--booked' : ''}
                  ${hasPending ? 'ac-time-slot--pending' : ''}
                `;

                return (
                  <div
                    key={time}
                    className={slotClass}
                    onClick={() => isClickable && handleTimeSlotClick(time)}
                  >
                    <div className="ac-time-slot-time">{format12h(time)}</div>
                    {hasPending && (
                      <div className="ac-time-slot-badge">{pendingCount}</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend for time slots */}
            <div className="ac-time-legend">
              <div className="ac-legend-item">
                <div className="ac-legend-box ac-legend-box--time-default"></div>
                <span>No Requests</span>
              </div>
              <div className="ac-legend-item">
                <div className="ac-legend-box ac-legend-box--time-pending"></div>
                <span>Has Requests</span>
              </div>
              <div className="ac-legend-item">
                <div className="ac-legend-box ac-legend-box--time-booked"></div>
                <span>Booked</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentCalendar;
