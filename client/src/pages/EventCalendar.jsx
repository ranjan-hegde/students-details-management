import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  HiChevronLeft,
  HiChevronRight,
  HiPlusCircle,
  HiPencilSquare,
  HiTrash,
  HiXMark,
  HiCalendarDays,
  HiClock,
  HiSparkles,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Header from '../components/layout/Header';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/api';

const EVENT_TYPES = [
  { value: 'Exam', label: 'Exam', color: '#ef4444' },
  { value: 'Holiday', label: 'Holiday', color: '#22c55e' },
  { value: 'Sports', label: 'Sports', color: '#f59e0b' },
  { value: 'Cultural', label: 'Cultural', color: '#8b5cf6' },
  { value: 'Meeting', label: 'Meeting', color: '#06b6d4' },
  { value: 'Other', label: 'Other', color: '#6b7280' },
];

const getEventColor = (type) => {
  const found = EVENT_TYPES.find((t) => t.value === type);
  return found ? found.color : '#6b7280';
};

const PRESET_COLORS = ['#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4', '#6b7280', '#ec4899', '#14b8a6'];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EMPTY_FORM = {
  title: '',
  description: '',
  eventDate: '',
  endDate: '',
  type: 'Other',
  color: '#6b7280',
};

const selectClass =
  'px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm bg-white';

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm';

export default function EventCalendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = currentMonth.startOf('month').format('YYYY-MM-DD');
      const endDate = currentMonth.endOf('month').format('YYYY-MM-DD');
      const res = await getEvents({ startDate, endDate });
      setEvents(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Build calendar grid: 6 rows x 7 cols
  const calendarDays = useMemo(() => {
    const firstDay = currentMonth.startOf('month');
    const lastDay = currentMonth.endOf('month');
    const startOfWeek = firstDay.day(); // 0=Sun
    const daysInMonth = lastDay.date();

    const days = [];

    // Previous month padding
    const prevMonth = currentMonth.subtract(1, 'month');
    const prevMonthDays = prevMonth.daysInMonth();
    for (let i = startOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.date(prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: currentMonth.date(d),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill 6 rows
    const remaining = 42 - days.length;
    const nextMonth = currentMonth.add(1, 'month');
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: nextMonth.date(d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  // Map events by date string
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      const dateStr = dayjs(event.eventDate || event.date || event.startDate).format('YYYY-MM-DD');
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(event);
    });
    return map;
  }, [events]);

  const today = dayjs().format('YYYY-MM-DD');

  const navigateMonth = (direction) => {
    setCurrentMonth((prev) => prev.add(direction, 'month'));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(dayjs().startOf('month'));
    setSelectedDate(dayjs().format('YYYY-MM-DD'));
  };

  const handleDateClick = (dateStr) => {
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const openCreateForm = (date) => {
    setEditingEvent(null);
    setForm({
      ...EMPTY_FORM,
      eventDate: date || selectedDate || dayjs().format('YYYY-MM-DD'),
    });
    setShowEventForm(true);
  };

  const openEditForm = (event) => {
    setEditingEvent(event);
    setForm({
      title: event.title || '',
      description: event.description || '',
      eventDate: dayjs(event.eventDate || event.date || event.startDate).format('YYYY-MM-DD'),
      endDate: event.endDate ? dayjs(event.endDate).format('YYYY-MM-DD') : '',
      type: event.type || 'Other',
      color: event.color || getEventColor(event.type),
    });
    setShowEventForm(true);
  };

  const closeForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-set color when type changes
      if (field === 'type') {
        updated.color = getEventColor(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.eventDate) {
      toast.error('Title and date are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        endDate: form.endDate || undefined,
      };

      if (editingEvent) {
        await updateEvent(editingEvent._id, payload);
        toast.success('Event updated successfully');
      } else {
        await createEvent(payload);
        toast.success('Event created successfully');
      }
      closeForm();
      fetchEvents();
    } catch (error) {
      toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const selectedDateEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  return (
    <div>
      <Header title="Event Calendar" subtitle="Manage school events and activities" />

      <div className="flex gap-6">
        {/* Calendar */}
        <div className="flex-1">
          {/* Calendar Header */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <HiChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-800 min-w-[180px] text-center">
                  {currentMonth.format('MMMM YYYY')}
                </h2>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <HiChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={goToToday}
                  className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
                >
                  Today
                </button>
                <button
                  onClick={() => openCreateForm()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm"
                >
                  <HiPlusCircle className="w-4 h-4" />
                  Add Event
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {DAY_NAMES.map((day) => (
                <div
                  key={day}
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Date Cells */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                const dateStr = day.date.format('YYYY-MM-DD');
                const isToday = dateStr === today;
                const isSelected = dateStr === selectedDate;
                const dayEvents = eventsByDate[dateStr] || [];
                const visibleEvents = dayEvents.slice(0, 2);
                const moreCount = dayEvents.length - 2;

                return (
                  <div
                    key={idx}
                    onClick={() => handleDateClick(dateStr)}
                    className={`min-h-[100px] border-b border-r border-gray-100 p-1.5 cursor-pointer transition-colors ${
                      !day.isCurrentMonth ? 'bg-gray-50/50' : 'hover:bg-blue-50/30'
                    } ${isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-300' : ''}`}
                  >
                    {/* Date Number */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : !day.isCurrentMonth
                            ? 'text-gray-300'
                            : 'text-gray-700'
                        }`}
                      >
                        {day.date.date()}
                      </span>
                    </div>

                    {/* Event Chips */}
                    {loading ? (
                      day.isCurrentMonth && idx % 5 === 0 && (
                        <div className="h-4 bg-gray-200 rounded animate-pulse mt-0.5" />
                      )
                    ) : (
                      <div className="space-y-0.5">
                        {visibleEvents.map((event) => (
                          <div
                            key={event._id}
                            className="text-[10px] leading-tight font-medium px-1.5 py-0.5 rounded truncate"
                            style={{
                              backgroundColor: (event.color || getEventColor(event.type)) + '20',
                              color: event.color || getEventColor(event.type),
                            }}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {moreCount > 0 && (
                          <div className="text-[10px] leading-tight font-medium text-gray-500 px-1.5">
                            +{moreCount} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event Type Legend */}
          <div className="bg-white rounded-xl shadow-sm p-4 mt-4">
            <div className="flex items-center gap-6 flex-wrap">
              {EVENT_TYPES.map((type) => (
                <div key={type.value} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="text-xs text-gray-600">{type.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Selected Date Events */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800">
                {selectedDate
                  ? dayjs(selectedDate).format('dddd, D MMMM YYYY')
                  : 'Select a date'}
              </h3>
              {selectedDate && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {selectedDate ? (
              <>
                {selectedDateEvents.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <HiCalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No events on this date</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                    {selectedDateEvents.map((event) => (
                      <div key={event._id} className="px-5 py-4 group hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: event.color || getEventColor(event.type) }}
                              />
                              <span
                                className="text-xs font-medium px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: (event.color || getEventColor(event.type)) + '20',
                                  color: event.color || getEventColor(event.type),
                                }}
                              >
                                {event.type || 'Other'}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-800 truncate">
                              {event.title}
                            </h4>
                            {event.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {event.description}
                              </p>
                            )}
                            {event.endDate && (
                              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                <HiClock className="w-3 h-3" />
                                Until {dayjs(event.endDate).format('DD MMM YYYY')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <button
                              onClick={() => openEditForm(event)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            >
                              <HiPencilSquare className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event._id, event.title)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                            >
                              <HiTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Event Button */}
                <div className="px-5 py-3 border-t border-gray-100">
                  <button
                    onClick={() => openCreateForm(selectedDate)}
                    className="w-full py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center justify-center gap-2"
                  >
                    <HiPlusCircle className="w-4 h-4" />
                    Add Event
                  </button>
                </div>
              </>
            ) : (
              <div className="px-5 py-12 text-center">
                <HiSparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Click on a date to view events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeForm}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingEvent ? 'Edit Event' : 'Create Event'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  placeholder="Enter event title"
                  className={inputClass}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  placeholder="Enter event description"
                  rows={3}
                  className={inputClass + ' resize-none'}
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => handleFormChange('eventDate', e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    End Date
                    <span className="text-xs text-gray-400 ml-1 font-normal">Optional</span>
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleFormChange('endDate', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Type</label>
                <select
                  value={form.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  className={inputClass}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
                <div className="flex items-center gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleFormChange('color', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        form.color === color
                          ? 'border-gray-800 scale-110 ring-2 ring-offset-2'
                          : 'border-transparent hover:scale-110'
                      }`}
                      style={{
                        backgroundColor: color,
                        '--tw-ring-color': color,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>{editingEvent ? 'Update Event' : 'Create Event'}</>
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
