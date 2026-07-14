import React, { useState, useEffect, useCallback } from 'react';
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiChevronDown,
  HiChevronUp,
  HiXMark,
  HiAcademicCap,
  HiCalendarDays,
  HiClipboardDocumentList,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Header from '../components/layout/Header';
import { getExamSchedules, createExamSchedule, updateExamSchedule, deleteExamSchedule } from '../services/api';

const CLASSES = Array.from({ length: 12 }, (_, i) => String(i + 1));
const SECTIONS = ['A', 'B', 'C', 'D'];

const emptySubject = { subject: '', date: '', startTime: '', endTime: '', maxMarks: '' };

const emptyForm = {
  examName: '',
  currentClass: '',
  section: '',
  academicYear: '',
  subjects: [{ ...emptySubject }],
};

export default function ExamSchedule() {
  const [examSchedules, setExamSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [form, setForm] = useState({ ...emptyForm });
  const [expandedId, setExpandedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch Exam Schedules ─────────────────────────────────────
  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass) params.currentClass = filterClass;
      if (filterSection) params.section = filterSection;
      const response = await getExamSchedules(params);
      setExamSchedules(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch exam schedules');
    } finally {
      setLoading(false);
    }
  }, [filterClass, filterSection]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // ── Form helpers ─────────────────────────────────────────────
  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (index, field, value) => {
    setForm((prev) => {
      const subjects = [...prev.subjects];
      subjects[index] = { ...subjects[index], [field]: value };
      return { ...prev, subjects };
    });
  };

  const addSubjectRow = () => {
    setForm((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { ...emptySubject }],
    }));
  };

  const removeSubjectRow = (index) => {
    setForm((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index),
    }));
  };

  const handleCreateNew = () => {
    setEditingSchedule(null);
    setForm({ ...emptyForm, subjects: [{ ...emptySubject }] });
    setShowForm(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setForm({
      examName: schedule.examName || '',
      currentClass: schedule.currentClass || schedule.class || '',
      section: schedule.section || '',
      academicYear: schedule.academicYear || '',
      subjects: (schedule.subjects || []).map((s) => ({
        subject: s.subject || '',
        date: s.date ? dayjs(s.date).format('YYYY-MM-DD') : '',
        startTime: s.startTime || '',
        endTime: s.endTime || '',
        maxMarks: s.maxMarks || '',
      })),
    });
    if (form.subjects.length === 0) {
      setForm((prev) => ({ ...prev, subjects: [{ ...emptySubject }] }));
    }
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setForm({ ...emptyForm, subjects: [{ ...emptySubject }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.examName || !form.currentClass || !form.section || !form.academicYear) {
      toast.error('Please fill all required fields');
      return;
    }

    const validSubjects = form.subjects.filter((s) => s.subject && s.date);
    if (validSubjects.length === 0) {
      toast.error('Please add at least one subject with a date');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        examName: form.examName,
        currentClass: form.currentClass,
        section: form.section,
        academicYear: form.academicYear,
        subjects: validSubjects.map((s) => ({
          subject: s.subject,
          date: s.date,
          startTime: s.startTime,
          endTime: s.endTime,
          maxMarks: Number(s.maxMarks) || 0,
        })),
      };

      if (editingSchedule) {
        await updateExamSchedule(editingSchedule._id, payload);
        toast.success('Exam schedule updated successfully');
      } else {
        await createExamSchedule(payload);
        toast.success('Exam schedule created successfully');
      }
      handleCancel();
      fetchSchedules();
    } catch (error) {
      toast.error(editingSchedule ? 'Failed to update schedule' : 'Failed to create schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteExamSchedule(id);
      toast.success('Exam schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete exam schedule');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // ── Styles ───────────────────────────────────────────────────
  const inputClass =
    'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm';

  const selectClass =
    'px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm bg-white';

  return (
    <div>
      <Header title="Exam Schedules" subtitle="Manage exam timetables for each class" />

      {/* Top Bar: Filters + Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className={selectClass}
          >
            <option value="">All Classes</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className={selectClass}
          >
            <option value="">All Sections</option>
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                Section {s}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Create Exam Schedule
        </button>
      </div>

      {/* ═══════ Create / Edit Modal ═══════ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingSchedule ? 'Edit Exam Schedule' : 'Create Exam Schedule'}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <HiXMark className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Top Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.examName}
                    onChange={(e) => handleFieldChange('examName', e.target.value)}
                    placeholder="e.g. Mid-Term Examination"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.academicYear}
                    onChange={(e) => handleFieldChange('academicYear', e.target.value)}
                    placeholder="e.g. 2025-2026"
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.currentClass}
                    onChange={(e) => handleFieldChange('currentClass', e.target.value)}
                    className={inputClass}
                    required
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.section}
                    onChange={(e) => handleFieldChange('section', e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Select Section</option>
                    {SECTIONS.map((s) => (
                      <option key={s} value={s}>
                        Section {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subjects List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-700">Subjects & Schedule</h4>
                  <button
                    type="button"
                    onClick={addSubjectRow}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition"
                  >
                    <HiPlus className="w-4 h-4" />
                    Add Subject
                  </button>
                </div>

                <div className="space-y-3">
                  {form.subjects.map((subj, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-3 items-end bg-gray-50 rounded-lg p-3"
                    >
                      <div className="col-span-12 md:col-span-3">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={subj.subject}
                          onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                          placeholder="Subject name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          value={subj.date}
                          onChange={(e) => handleSubjectChange(index, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={subj.startTime}
                          onChange={(e) => handleSubjectChange(index, 'startTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={subj.endTime}
                          onChange={(e) => handleSubjectChange(index, 'endTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Max Marks
                        </label>
                        <input
                          type="number"
                          value={subj.maxMarks}
                          onChange={(e) => handleSubjectChange(index, 'maxMarks', e.target.value)}
                          placeholder="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1 flex justify-center">
                        {form.subjects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSubjectRow(index)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove subject"
                          >
                            <HiXMark className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
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
                  {isSubmitting
                    ? 'Saving...'
                    : editingSchedule
                    ? 'Update Schedule'
                    : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ Exam Schedule Cards ═══════ */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-5 bg-gray-200 rounded w-48" />
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                  <div className="h-5 bg-gray-200 rounded-full w-24" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-6" />
              </div>
            </div>
          ))
        ) : examSchedules.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <HiClipboardDocumentList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Exam Schedules Found</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
              There are no exam schedules created yet. Create one to define the exam timetable for
              your students.
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition inline-flex items-center gap-2"
            >
              <HiPlus className="w-5 h-5" />
              Create Exam Schedule
            </button>
          </div>
        ) : (
          examSchedules.map((schedule) => {
            const isExpanded = expandedId === schedule._id;
            return (
              <div
                key={schedule._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer"
                  onClick={() => toggleExpand(schedule._id)}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <HiAcademicCap className="w-5 h-5 text-blue-600" />
                      <h3 className="text-base font-semibold text-gray-800">
                        {schedule.examName}
                      </h3>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      Class {schedule.currentClass || schedule.class}-{schedule.section}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <HiCalendarDays className="w-3.5 h-3.5 mr-1" />
                      {schedule.academicYear}
                    </span>
                    <span className="text-xs text-gray-400">
                      {(schedule.subjects || []).length} subject
                      {(schedule.subjects || []).length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(schedule);
                      }}
                      className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 text-sm font-medium"
                    >
                      <HiPencilSquare className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(schedule._id, schedule.examName);
                      }}
                      className="text-red-600 hover:text-red-800 transition flex items-center gap-1 text-sm font-medium"
                    >
                      <HiTrash className="w-4 h-4" />
                      Delete
                    </button>
                    {isExpanded ? (
                      <HiChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <HiChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Body – Subjects Table */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-6 pb-5">
                    {(schedule.subjects || []).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full mt-4">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                                Subject
                              </th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                                Date
                              </th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                                Start Time
                              </th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                                End Time
                              </th>
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                                Max Marks
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {schedule.subjects.map((subj, idx) => (
                              <tr
                                key={idx}
                                className={`${
                                  idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                } hover:bg-blue-50/40 transition`}
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                                  {subj.subject}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {subj.date ? dayjs(subj.date).format('DD MMM YYYY') : '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {subj.startTime || '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {subj.endTime || '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {subj.maxMarks || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 py-4 text-center">
                        No subjects scheduled yet
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
