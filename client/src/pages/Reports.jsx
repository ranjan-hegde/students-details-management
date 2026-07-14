import React, { useState } from 'react';
import {
  HiClipboardDocumentCheck,
  HiCurrencyRupee,
  HiChartBar,
  HiUserGroup,
  HiArrowPath,
  HiDocumentChartBar,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Header from '../components/layout/Header';
import { getAttendanceReport, getFeeReport, getResultReport, getStrengthReport } from '../services/api';

const CLASSES = Array.from({ length: 12 }, (_, i) => String(i + 1));
const SECTIONS = ['A', 'B', 'C', 'D'];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const percentColor = (pct) => {
  if (pct >= 75) return 'text-green-600';
  if (pct >= 50) return 'text-yellow-600';
  return 'text-red-600';
};

const barColor = (pct) => {
  if (pct >= 75) return 'bg-green-500';
  if (pct >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

const TABS = [
  { key: 'attendance', label: 'Attendance', icon: HiClipboardDocumentCheck },
  { key: 'fees', label: 'Fee Collection', icon: HiCurrencyRupee },
  { key: 'results', label: 'Results', icon: HiChartBar },
  { key: 'strength', label: 'Student Strength', icon: HiUserGroup },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterMonth, setFilterMonth] = useState(dayjs().format('YYYY-MM'));
  const [filterExamType, setFilterExamType] = useState('');

  const selectClass =
    'px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm bg-white';

  const tabClass = (tab) =>
    `px-6 py-3 text-sm font-medium transition flex items-center gap-2 ${
      activeTab === tab
        ? 'border-b-2 border-blue-600 text-blue-600'
        : 'text-gray-500 hover:text-gray-700'
    }`;

  // ── Data fetchers ─────────────────────────────────────────────
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterMonth) params.month = filterMonth;
      if (filterClass) params.currentClass = filterClass;
      if (filterSection) params.section = filterSection;
      const response = await getAttendanceReport(params);
      setReportData(response.data?.data || null);
    } catch (error) {
      toast.error('Failed to generate attendance report');
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass) params.currentClass = filterClass;
      const response = await getFeeReport(params);
      setReportData(response.data?.data || null);
    } catch (error) {
      toast.error('Failed to generate fee report');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass) params.currentClass = filterClass;
      if (filterSection) params.section = filterSection;
      if (filterExamType) params.examType = filterExamType;
      const response = await getResultReport(params);
      setReportData(response.data?.data || null);
    } catch (error) {
      toast.error('Failed to generate results report');
    } finally {
      setLoading(false);
    }
  };

  const fetchStrength = async () => {
    setLoading(true);
    try {
      const response = await getStrengthReport();
      setReportData(response.data?.data || null);
    } catch (error) {
      toast.error('Failed to generate strength report');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    switch (activeTab) {
      case 'attendance':
        return fetchAttendance();
      case 'fees':
        return fetchFees();
      case 'results':
        return fetchResults();
      case 'strength':
        return fetchStrength();
      default:
        break;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setReportData(null);
  };

  // ── Summary Card Component ────────────────────────────────────
  const SummaryCard = ({ label, value, color = 'text-gray-800', icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        {Icon && <Icon className="w-5 h-5 text-gray-300" />}
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );

  // ── Skeleton Loader ───────────────────────────────────────────
  const SkeletonTable = ({ rows = 5, cols = 6 }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="animate-pulse">
        <div className="bg-gray-50 px-6 py-3 flex gap-8">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-24" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-8 border-t border-gray-100">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded w-20" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Attendance Tab ────────────────────────────────────────────
  const renderAttendance = () => {
    const summary = reportData?.summary || {};
    const students = reportData?.students || [];

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className={selectClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className={selectClass}
              >
                <option value="">All Classes</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className={selectClass}
              >
                <option value="">All Sections</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Generate
            </button>
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                  <div className="h-7 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
            <SkeletonTable rows={5} cols={7} />
          </>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard label="Total Working Days" value={summary.totalWorkingDays || 0} />
              <SummaryCard
                label="Average Attendance"
                value={`${(summary.averageAttendance || 0).toFixed(1)}%`}
                color={percentColor(summary.averageAttendance || 0)}
              />
              <SummaryCard
                label="Below 75%"
                value={summary.below75 || 0}
                color="text-red-600"
              />
            </div>

            {/* Table */}
            {students.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Student Name', 'Present', 'Absent', 'Late', 'Half Day', 'Total', 'Percentage'].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map((s, idx) => {
                        const pct = s.percentage || 0;
                        return (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                              {s.studentName || s.name || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{s.present ?? 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{s.absent ?? 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{s.late ?? 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{s.halfDay ?? 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{s.total ?? 0}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${barColor(pct)}`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-semibold ${percentColor(pct)}`}>
                                  {pct.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyReport />
            )}
          </>
        ) : (
          <PromptGenerate />
        )}
      </div>
    );
  };

  // ── Fee Collection Tab ────────────────────────────────────────
  const renderFees = () => {
    const summary = reportData?.summary || {};
    const classes = reportData?.classes || [];

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className={selectClass}
              >
                <option value="">All Classes</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Generate
            </button>
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                  <div className="h-7 bg-gray-200 rounded w-20" />
                </div>
              ))}
            </div>
            <SkeletonTable rows={5} cols={6} />
          </>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard label="Total Expected" value={formatCurrency(summary.totalExpected || 0)} />
              <SummaryCard
                label="Total Collected"
                value={formatCurrency(summary.totalCollected || 0)}
                color="text-green-600"
              />
              <SummaryCard
                label="Total Pending"
                value={formatCurrency(summary.totalPending || 0)}
                color="text-red-600"
              />
              <SummaryCard
                label="Collection %"
                value={`${(summary.collectionPercentage || 0).toFixed(1)}%`}
                color={percentColor(summary.collectionPercentage || 0)}
              />
            </div>

            {/* Table */}
            {classes.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Class', 'Total Students', 'Expected Fees', 'Collected', 'Pending', 'Collection %'].map(
                          (h) => (
                            <th
                              key={h}
                              className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {classes.map((c, idx) => {
                        const pct = c.collectionPercentage || 0;
                        return (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                              Class {c.class || c.currentClass}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{c.totalStudents ?? 0}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {formatCurrency(c.expectedFees || 0)}
                            </td>
                            <td className="px-6 py-4 text-sm text-green-600 font-medium">
                              {formatCurrency(c.collected || 0)}
                            </td>
                            <td className="px-6 py-4 text-sm text-red-600 font-medium">
                              {formatCurrency(c.pending || 0)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${barColor(pct)}`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-semibold ${percentColor(pct)}`}>
                                  {pct.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyReport />
            )}
          </>
        ) : (
          <PromptGenerate />
        )}
      </div>
    );
  };

  // ── Results Tab ───────────────────────────────────────────────
  const renderResults = () => {
    const summary = reportData?.summary || {};
    const students = reportData?.students || [];

    return (
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className={selectClass}
              >
                <option value="">Select Class</option>
                {CLASSES.map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <select
                value={filterSection}
                onChange={(e) => setFilterSection(e.target.value)}
                className={selectClass}
              >
                <option value="">Select Section</option>
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
              <select
                value={filterExamType}
                onChange={(e) => setFilterExamType(e.target.value)}
                className={selectClass}
              >
                <option value="">Select Exam</option>
                <option value="midterm">Mid-Term</option>
                <option value="quarterly">Quarterly</option>
                <option value="halfyearly">Half-Yearly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Generate
            </button>
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                  <div className="h-7 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
            <SkeletonTable rows={5} cols={5} />
          </>
        ) : reportData ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard
                label="Class Average"
                value={`${(summary.classAverage || 0).toFixed(1)}%`}
                color={percentColor(summary.classAverage || 0)}
              />
              <SummaryCard
                label="Highest Score"
                value={summary.highestScore || 0}
                color="text-green-600"
              />
              <SummaryCard
                label="Pass Percentage"
                value={`${(summary.passPercentage || 0).toFixed(1)}%`}
                color={percentColor(summary.passPercentage || 0)}
              />
              <SummaryCard label="Top Performer" value={summary.topPerformer || '—'} />
            </div>

            {/* Table */}
            {students.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Student Name', 'Total Marks', 'Percentage', 'Grade', 'Rank'].map((h) => (
                          <th
                            key={h}
                            className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.map((s, idx) => {
                        const pct = s.percentage || 0;
                        return (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                              {s.studentName || s.name || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{s.totalMarks ?? 0}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${barColor(pct)}`}
                                    style={{ width: `${Math.min(pct, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-semibold ${percentColor(pct)}`}>
                                  {pct.toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  s.grade === 'A+' || s.grade === 'A'
                                    ? 'bg-green-100 text-green-700'
                                    : s.grade === 'B+' || s.grade === 'B'
                                    ? 'bg-blue-100 text-blue-700'
                                    : s.grade === 'C+' || s.grade === 'C'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {s.grade || '—'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                              #{s.rank || idx + 1}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyReport />
            )}
          </>
        ) : (
          <PromptGenerate />
        )}
      </div>
    );
  };

  // ── Student Strength Tab ──────────────────────────────────────
  const renderStrength = () => {
    const summary = reportData?.summary || {};
    const classes = reportData?.classes || [];
    const maxTotal = Math.max(...(classes.map((c) => c.total || 0)), 1);

    return (
      <div className="space-y-6">
        {/* Generate Button */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-end gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
            >
              <HiArrowPath className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Generate Report
            </button>
          </div>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-5 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-7 bg-gray-200 rounded w-16" />
              </div>
            </div>
            <SkeletonTable rows={8} cols={5} />
          </>
        ) : reportData ? (
          <>
            {/* Summary Card */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-w-xs">
              <SummaryCard
                label="Total Students"
                value={summary.totalStudents || 0}
                color="text-blue-600"
                icon={HiUserGroup}
              />
            </div>

            {/* Table */}
            {classes.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Class', 'Section', 'Male', 'Female', 'Total', 'Distribution'].map((h) => (
                          <th
                            key={h}
                            className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {classes.map((c, idx) => {
                        const total = c.total || 0;
                        const widthPct = (total / maxTotal) * 100;
                        return (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                              Class {c.class || c.currentClass}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{c.section || '—'}</td>
                            <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                              {c.male ?? 0}
                            </td>
                            <td className="px-6 py-4 text-sm text-pink-600 font-medium">
                              {c.female ?? 0}
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-gray-800">{total}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-500 rounded-full transition-all"
                                    style={{ width: `${widthPct}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-500">{total}</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyReport />
            )}
          </>
        ) : (
          <PromptGenerate />
        )}
      </div>
    );
  };

  // ── Shared empty / prompt states ──────────────────────────────
  const EmptyReport = () => (
    <div className="bg-white rounded-xl shadow-sm p-16 text-center">
      <HiDocumentChartBar className="w-14 h-14 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No data found</p>
      <p className="text-sm text-gray-400 mt-1">Try adjusting the filters and generate again</p>
    </div>
  );

  const PromptGenerate = () => (
    <div className="bg-white rounded-xl shadow-sm p-16 text-center">
      <HiDocumentChartBar className="w-14 h-14 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">Select filters and click Generate</p>
      <p className="text-sm text-gray-400 mt-1">
        Configure the filters above and click the Generate button to view the report
      </p>
    </div>
  );

  return (
    <div>
      <Header title="Reports & Analytics" subtitle="Data-driven insights for your school" />

      {/* Tab Bar */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => handleTabChange(key)} className={tabClass(key)}>
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'attendance' && renderAttendance()}
      {activeTab === 'fees' && renderFees()}
      {activeTab === 'results' && renderResults()}
      {activeTab === 'strength' && renderStrength()}
    </div>
  );
}
