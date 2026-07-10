import React, { useState, useEffect, useCallback } from 'react';
import {
  HiUserGroup,
  HiTableCells,
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiMagnifyingGlass,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import * as api from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [
  { number: 1, time: '09:00 - 09:45' },
  { number: 2, time: '09:45 - 10:30' },
  { number: 3, time: '10:30 - 11:15' },
  { number: 4, time: '11:15 - 12:00' },
  { number: 5, time: '12:30 - 01:15' },
  { number: 6, time: '01:15 - 02:00' },
  { number: 7, time: '02:00 - 02:45' },
  { number: 8, time: '02:45 - 03:30' },
];

const CLASSES = Array.from({ length: 12 }, (_, i) => String(i + 1));
const SECTIONS = ['A', 'B', 'C', 'D'];

const emptyTeacher = {
  firstName: '',
  lastName: '',
  email: '',
  mobile: '',
  gender: '',
  dateOfBirth: '',
  qualification: '',
  subjects: '',
  assignedClasses: '',
};

export default function TeacherSchedule() {
  const [activeTab, setActiveTab] = useState('teachers');

  // ── Teacher Management State ──────────────────────────────────
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({ ...emptyTeacher });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Timetable State ───────────────────────────────────────────
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editGrid, setEditGrid] = useState({});
  const [loadingTimetable, setLoadingTimetable] = useState(false);
  const [savingTimetable, setSavingTimetable] = useState(false);
  const [allTeachers, setAllTeachers] = useState([]);

  // ── Teacher Schedule Viewer ───────────────────────────────────
  const [viewTeacherId, setViewTeacherId] = useState('');
  const [teacherSchedule, setTeacherSchedule] = useState([]);
  const [loadingTeacherSchedule, setLoadingTeacherSchedule] = useState(false);

  // ── Fetch Teachers ────────────────────────────────────────────
  const fetchTeachers = useCallback(async () => {
    setLoadingTeachers(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const response = await api.getTeachers(params);
      setTeachers(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch teachers');
    } finally {
      setLoadingTeachers(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // ── Search debounce ───────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ── Teacher form handlers ─────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingTeacher(null);
    setFormData({ ...emptyTeacher });
    setShowForm(true);
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      mobile: teacher.mobile || '',
      gender: teacher.gender || '',
      dateOfBirth: teacher.dateOfBirth ? teacher.dateOfBirth.slice(0, 10) : '',
      qualification: teacher.qualification || '',
      subjects: (teacher.subjects || []).join(', '),
      assignedClasses: (teacher.assignedClasses || []).join(', '),
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTeacher(null);
    setFormData({ ...emptyTeacher });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.mobile || !formData.gender) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        subjects: formData.subjects
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        assignedClasses: formData.assignedClasses
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingTeacher) {
        await api.updateTeacher(editingTeacher._id, payload);
        toast.success('Teacher updated successfully');
      } else {
        await api.createTeacher(payload);
        toast.success('Teacher added successfully');
      }
      handleCancel();
      fetchTeachers();
    } catch (error) {
      toast.error(editingTeacher ? 'Failed to update teacher' : 'Failed to add teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.deleteTeacher(id);
      toast.success('Teacher deleted successfully');
      fetchTeachers();
    } catch (error) {
      toast.error('Failed to delete teacher');
    }
  };

  // ── Timetable handlers ────────────────────────────────────────
  const fetchTimetable = useCallback(async () => {
    if (!selectedClass || !selectedSection) return;
    setLoadingTimetable(true);
    try {
      const [ttRes, teacherRes] = await Promise.all([
        api.getTimetableByClass({ class: selectedClass, section: selectedSection }),
        api.getTeachers(),
      ]);
      setTimetable(ttRes.data?.data || []);
      setAllTeachers(teacherRes.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch timetable');
    } finally {
      setLoadingTimetable(false);
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const getCellData = (day, period) => {
    return timetable.find(
      (entry) => entry.day === day && entry.period === period
    );
  };

  const startEdit = () => {
    const grid = {};
    DAYS.forEach((day) => {
      grid[day] = {};
      PERIODS.forEach((p) => {
        const existing = getCellData(day, p.number);
        grid[day][p.number] = {
          subject: existing?.subject || '',
          teacherId: existing?.teacherId?._id || existing?.teacherId || '',
        };
      });
    });
    setEditGrid(grid);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditGrid({});
  };

  const handleCellChange = (day, period, field, value) => {
    setEditGrid((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: {
          ...prev[day][period],
          [field]: value,
        },
      },
    }));
  };

  const saveTimetable = async () => {
    setSavingTimetable(true);
    try {
      const entries = [];
      DAYS.forEach((day) => {
        PERIODS.forEach((p) => {
          const cell = editGrid[day]?.[p.number];
          if (cell?.subject || cell?.teacherId) {
            entries.push({
              day,
              period: p.number,
              startTime: p.time.split(' - ')[0],
              endTime: p.time.split(' - ')[1],
              subject: cell.subject,
              teacherId: cell.teacherId || undefined,
            });
          }
        });
      });

      await api.saveBulkTimetable({
        class: selectedClass,
        section: selectedSection,
        entries,
      });
      toast.success('Timetable saved successfully');
      setEditMode(false);
      fetchTimetable();
    } catch (error) {
      toast.error('Failed to save timetable');
    } finally {
      setSavingTimetable(false);
    }
  };

  // ── Teacher Schedule Viewer ───────────────────────────────────
  const fetchTeacherSchedule = async (teacherId) => {
    if (!teacherId) {
      setTeacherSchedule([]);
      return;
    }
    setLoadingTeacherSchedule(true);
    try {
      const response = await api.getTimetableByTeacher(teacherId);
      setTeacherSchedule(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch teacher schedule');
    } finally {
      setLoadingTeacherSchedule(false);
    }
  };

  const getTeacherCellData = (day, period) => {
    return teacherSchedule.find(
      (entry) => entry.day === day && entry.period === period
    );
  };

  // ── Tab styles ────────────────────────────────────────────────
  const tabClass = (tab) =>
    `px-6 py-3 text-sm font-medium transition ${
      activeTab === tab
        ? 'border-b-2 border-blue-600 text-blue-600'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm';

  const selectClass =
    'px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm bg-white';

  return (
    <div>
      <Header title="Teachers & Schedule" subtitle="Manage teachers, timetable, and schedules" />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0">
          <button onClick={() => setActiveTab('teachers')} className={tabClass('teachers')}>
            <span className="flex items-center gap-2">
              <HiUserGroup className="w-4 h-4" />
              Manage Teachers
            </span>
          </button>
          <button onClick={() => setActiveTab('timetable')} className={tabClass('timetable')}>
            <span className="flex items-center gap-2">
              <HiTableCells className="w-4 h-4" />
              Timetable
            </span>
          </button>
        </nav>
      </div>

      {/* ═══════════ TAB 1: MANAGE TEACHERS ═══════════ */}
      {activeTab === 'teachers' && (
        <div className="space-y-6">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search teachers..."
                className="w-80 pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
              />
            </div>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <HiPlus className="w-5 h-5" />
              Add Teacher
            </button>
          </div>

          {/* Inline Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Last name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      className={inputClass}
                      placeholder="Mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. B.Ed, M.Sc"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subjects <span className="text-xs text-gray-400">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      name="subjects"
                      value={formData.subjects}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. Mathematics, Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned Classes <span className="text-xs text-gray-400">(comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      name="assignedClasses"
                      value={formData.assignedClasses}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g. 5, 6, 7"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition"
                  >
                    {isSubmitting ? 'Saving...' : editingTeacher ? 'Update Teacher' : 'Add Teacher'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Teachers Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Teacher ID
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Subjects
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Classes
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Mobile
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingTeachers ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    </tr>
                  ))
                ) : teachers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <HiUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No teachers found</p>
                      <p className="text-sm text-gray-400 mt-1">Add a teacher to get started</p>
                    </td>
                  </tr>
                ) : (
                  teachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {teacher.teacherId || teacher._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-800">
                          {teacher.firstName} {teacher.lastName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {(teacher.subjects || []).join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {(teacher.assignedClasses || []).join(', ') || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{teacher.mobile || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            teacher.status === 'inactive'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {teacher.status === 'inactive' ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 text-sm font-medium"
                          >
                            <HiPencilSquare className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(teacher._id, `${teacher.firstName} ${teacher.lastName}`)
                            }
                            className="text-red-600 hover:text-red-800 transition flex items-center gap-1 text-sm font-medium"
                          >
                            <HiTrash className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════ TAB 2: TIMETABLE ═══════════ */}
      {activeTab === 'timetable' && (
        <div className="space-y-6">
          {/* Class / Section Selectors */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Class Timetable</h3>
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setEditMode(false);
                  }}
                  className={selectClass}
                >
                  <option value="">Select Class</option>
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => {
                    setSelectedSection(e.target.value);
                    setEditMode(false);
                  }}
                  className={selectClass}
                >
                  <option value="">Select Section</option>
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>
                      Section {s}
                    </option>
                  ))}
                </select>
              </div>
              {selectedClass && selectedSection && !editMode && (
                <div className="flex items-end">
                  <button
                    onClick={startEdit}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 mt-5"
                  >
                    <HiPencilSquare className="w-4 h-4" />
                    Edit Timetable
                  </button>
                </div>
              )}
              {editMode && (
                <div className="flex items-end gap-3 mt-5">
                  <button
                    onClick={saveTimetable}
                    disabled={savingTimetable}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <HiCheckCircle className="w-4 h-4" />
                    {savingTimetable ? 'Saving...' : 'Save Timetable'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <HiXCircle className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Grid */}
          {selectedClass && selectedSection && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {loadingTimetable ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 min-w-[120px]">
                          Period
                        </th>
                        {DAYS.map((day) => (
                          <th
                            key={day}
                            className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 min-w-[150px]"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {PERIODS.map((p) => (
                        <tr key={p.number} className={p.number === 5 ? 'border-t-4 border-amber-200' : ''}>
                          <td className="px-4 py-3 bg-gray-50">
                            <div className="text-sm font-semibold text-gray-700">Period {p.number}</div>
                            <div className="text-xs text-gray-400">{p.time}</div>
                            {p.number === 5 && (
                              <div className="text-xs text-amber-600 font-medium mt-0.5">After Lunch</div>
                            )}
                          </td>
                          {DAYS.map((day) => {
                            if (editMode) {
                              const cellValue = editGrid[day]?.[p.number] || {
                                subject: '',
                                teacherId: '',
                              };
                              return (
                                <td key={day} className="px-2 py-2">
                                  <input
                                    type="text"
                                    value={cellValue.subject}
                                    onChange={(e) =>
                                      handleCellChange(day, p.number, 'subject', e.target.value)
                                    }
                                    placeholder="Subject"
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none mb-1"
                                  />
                                  <select
                                    value={cellValue.teacherId}
                                    onChange={(e) =>
                                      handleCellChange(day, p.number, 'teacherId', e.target.value)
                                    }
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                  >
                                    <option value="">Select Teacher</option>
                                    {allTeachers.map((t) => (
                                      <option key={t._id} value={t._id}>
                                        {t.firstName} {t.lastName}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                              );
                            }
                            const cell = getCellData(day, p.number);
                            return (
                              <td key={day} className="px-4 py-3">
                                {cell ? (
                                  <div>
                                    <div className="text-sm font-medium text-gray-800">
                                      {cell.subject}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {cell.teacherId?.firstName
                                        ? `${cell.teacherId.firstName} ${cell.teacherId.lastName || ''}`
                                        : '—'}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-300">Free</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* View Teacher's Schedule */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">View Teacher's Schedule</h3>
            <div className="flex items-center gap-4 mb-6">
              <select
                value={viewTeacherId}
                onChange={(e) => {
                  setViewTeacherId(e.target.value);
                  fetchTeacherSchedule(e.target.value);
                }}
                className={selectClass + ' min-w-[250px]'}
              >
                <option value="">Select a Teacher</option>
                {(allTeachers.length > 0 ? allTeachers : teachers).map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName}
                  </option>
                ))}
              </select>
            </div>

            {viewTeacherId && (
              loadingTeacherSchedule ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                          Period
                        </th>
                        {DAYS.map((day) => (
                          <th
                            key={day}
                            className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {PERIODS.map((p) => (
                        <tr key={p.number}>
                          <td className="px-4 py-3 bg-gray-50">
                            <div className="text-sm font-semibold text-gray-700">Period {p.number}</div>
                            <div className="text-xs text-gray-400">{p.time}</div>
                          </td>
                          {DAYS.map((day) => {
                            const cell = getTeacherCellData(day, p.number);
                            return (
                              <td key={day} className="px-4 py-3">
                                {cell ? (
                                  <div>
                                    <div className="text-sm font-medium text-gray-800">
                                      {cell.subject}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Class {cell.class}-{cell.section}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-300">Free</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {!viewTeacherId && (
              <div className="text-center py-8">
                <HiUserGroup className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Select a teacher to view their schedule</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
