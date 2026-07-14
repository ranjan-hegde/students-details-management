import { useState, useEffect, useCallback } from 'react';
import {
  HiPlusCircle,
  HiPencilSquare,
  HiTrash,
  HiMegaphone,
  HiXMark,
  HiFunnel,
  HiExclamationCircle,
  HiCalendarDays,
  HiAcademicCap,
  HiStar,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Header from '../components/layout/Header';
import { getNotices, createNotice, updateNotice, deleteNotice } from '../services/api';

const CATEGORIES = ['General', 'Exam', 'Holiday', 'Event', 'Sports'];
const PRIORITIES = ['Normal', 'Important', 'Urgent'];

const CATEGORY_STYLES = {
  General: 'bg-gray-100 text-gray-700',
  Exam: 'bg-blue-100 text-blue-700',
  Holiday: 'bg-green-100 text-green-700',
  Event: 'bg-purple-100 text-purple-700',
  Sports: 'bg-orange-100 text-orange-700',
};

const EMPTY_FORM = {
  title: '',
  content: '',
  category: 'General',
  priority: 'Normal',
  targetClasses: [],
  expiresAt: '',
};

const selectClass =
  'px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm bg-white';

const inputClass =
  'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center gap-2 mb-3">
      <div className="h-5 bg-gray-200 rounded-full w-16" />
      <div className="h-5 bg-gray-200 rounded-full w-12" />
    </div>
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
    <div className="h-3 bg-gray-200 rounded w-28" />
  </div>
);

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      const res = await getNotices(params);
      setNotices(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch notices');
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const openCreateForm = () => {
    setEditingNotice(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEditForm = (notice) => {
    setEditingNotice(notice);
    setForm({
      title: notice.title || '',
      content: notice.content || '',
      category: notice.category || 'General',
      priority: notice.priority || 'Normal',
      targetClasses: notice.targetClasses || [],
      expiresAt: notice.expiresAt ? dayjs(notice.expiresAt).format('YYYY-MM-DD') : '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingNotice(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTargetClass = (cls) => {
    setForm((prev) => ({
      ...prev,
      targetClasses: prev.targetClasses.includes(cls)
        ? prev.targetClasses.filter((c) => c !== cls)
        : [...prev.targetClasses, cls],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        expiresAt: form.expiresAt || undefined,
        targetClasses: form.targetClasses.length > 0 ? form.targetClasses : undefined,
      };

      if (editingNotice) {
        await updateNotice(editingNotice._id, payload);
        toast.success('Notice updated successfully');
      } else {
        await createNotice(payload);
        toast.success('Notice created successfully');
      }
      closeForm();
      fetchNotices();
    } catch (error) {
      toast.error(editingNotice ? 'Failed to update notice' : 'Failed to create notice');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteNotice(id);
      toast.success('Notice deleted successfully');
      fetchNotices();
    } catch (error) {
      toast.error('Failed to delete notice');
    }
  };

  return (
    <div>
      <Header title="Notice Board" subtitle="Manage school notices and announcements" />

      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <HiFunnel className="w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={selectClass}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
        >
          <HiPlusCircle className="w-5 h-5" />
          Create Notice
        </button>
      </div>

      {/* Notices Grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-16 text-center">
          <HiMegaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium text-lg">No notices found</p>
          <p className="text-sm text-gray-400 mt-1">
            {filterCategory
              ? `No ${filterCategory} notices. Try a different category.`
              : 'Create your first notice to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {notices.map((notice) => {
            const isUrgent = notice.priority === 'Urgent';
            const isImportant = notice.priority === 'Important';

            return (
              <div
                key={notice._id}
                className={`group bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  isUrgent ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="p-6">
                  {/* Category + Priority badges */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        CATEGORY_STYLES[notice.category] || CATEGORY_STYLES.General
                      }`}
                    >
                      {notice.category || 'General'}
                    </span>
                    {isImportant && (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                        Important
                      </span>
                    )}
                    {isUrgent && (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-600">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        Urgent
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{notice.title}</h3>

                  {/* Content */}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{notice.content}</p>

                  {/* Target Classes */}
                  {notice.targetClasses && notice.targetClasses.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      <HiAcademicCap className="w-4 h-4 text-gray-400" />
                      {notice.targetClasses.map((cls) => (
                        <span
                          key={cls}
                          className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                        >
                          Class {cls}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <HiCalendarDays className="w-3.5 h-3.5" />
                      {dayjs(notice.createdAt).format('DD MMM YYYY')}
                      {notice.expiresAt && (
                        <span className="ml-2 text-amber-500">
                          · Expires {dayjs(notice.expiresAt).format('DD MMM')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditForm(notice)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <HiPencilSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(notice._id, notice.title)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeForm}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingNotice ? 'Edit Notice' : 'Create Notice'}
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
                  placeholder="Enter notice title"
                  className={inputClass}
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => handleFormChange('content', e.target.value)}
                  placeholder="Enter notice content"
                  rows={6}
                  className={inputClass + ' resize-none'}
                  required
                />
              </div>

              {/* Category + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    className={inputClass}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => handleFormChange('priority', e.target.value)}
                    className={inputClass}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Target Classes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Target Classes
                  <span className="text-xs text-gray-400 ml-2 font-normal">
                    Leave empty for all classes
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => {
                    const isSelected = form.targetClasses.includes(String(cls));
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => toggleTargetClass(String(cls))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          isSelected
                            ? 'bg-blue-100 text-blue-700 border-blue-300'
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        Class {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Expiry Date
                  <span className="text-xs text-gray-400 ml-2 font-normal">Optional</span>
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => handleFormChange('expiresAt', e.target.value)}
                  className={inputClass}
                />
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
                    <>{editingNotice ? 'Update Notice' : 'Create Notice'}</>
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
