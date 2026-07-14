import { useState, useEffect, useCallback } from 'react';
import {
  HiClipboardDocumentCheck,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiChartBar,
  HiArrowPath,
  HiExclamationTriangle,
  HiUserGroup,
  HiCalendarDays,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Header from '../components/layout/Header';
import {
  getStudents,
  markAttendance as markAttendanceAPI,
  getAttendanceByDate,
  getClassAttendanceReport,
} from '../services/api';

const STATUS_STYLES = {
  Present: {
    active: 'bg-green-100 text-green-700 border-green-300 ring-green-200',
    label: 'P',
  },
  Absent: {
    active: 'bg-red-100 text-red-700 border-red-300 ring-red-200',
    label: 'A',
  },
  Late: {
    active: 'bg-yellow-100 text-yellow-700 border-yellow-300 ring-yellow-200',
    label: 'L',
  },
  HalfDay: {
    active: 'bg-blue-100 text-blue-700 border-blue-300 ring-blue-200',
    label: 'H',
  },
};

const INACTIVE_STYLE = 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-36" /></td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-10 bg-gray-200 rounded" />
        <div className="h-8 w-10 bg-gray-200 rounded" />
        <div className="h-8 w-10 bg-gray-200 rounded" />
        <div className="h-8 w-10 bg-gray-200 rounded" />
      </div>
    </td>
  </tr>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
    <div className="h-8 bg-gray-200 rounded w-16" />
  </div>
);

const selectClass =
  'px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm bg-white';

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('mark');
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [reportMonth, setReportMonth] = useState(dayjs().format('YYYY-MM'));
  const [reportLoading, setReportLoading] = useState(false);

  // Fetch students and existing attendance when class + section + date selected
  const fetchStudentsAndAttendance = useCallback(async () => {
    if (!selectedClass || !selectedSection) return;
    setLoading(true);
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        getStudents({ class: selectedClass, section: selectedSection, status: 'active', limit: 100 }),
        getAttendanceByDate({ date: selectedDate, currentClass: selectedClass, section: selectedSection }),
      ]);

      const studentList = studentsRes.data?.data || studentsRes.data || [];
      setStudents(studentList);

      // Pre-fill existing attendance records
      const records = {};
      const existingRecords = attendanceRes.data?.data || attendanceRes.data || [];
      if (Array.isArray(existingRecords)) {
        existingRecords.forEach((rec) => {
          const id = rec.studentId?._id || rec.studentId || rec.student;
          if (id) {
            records[id] = rec.status;
          }
        });
      }
      setAttendanceRecords(records);
    } catch (error) {
      toast.error('Failed to fetch students');
      setStudents([]);
      setAttendanceRecords({});
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSection, selectedDate]);

  useEffect(() => {
    if (viewMode === 'mark' && selectedClass && selectedSection) {
      fetchStudentsAndAttendance();
    }
  }, [fetchStudentsAndAttendance, viewMode, selectedClass, selectedSection]);

  // Fetch monthly report
  const fetchMonthlyReport = useCallback(async () => {
    if (!selectedClass || !selectedSection || !reportMonth) return;
    setReportLoading(true);
    try {
      const res = await getClassAttendanceReport({
        currentClass: selectedClass,
        section: selectedSection,
        month: reportMonth,
      });
      setMonthlyReport(res.data?.data || res.data || []);
    } catch (error) {
      toast.error('Failed to fetch attendance report');
      setMonthlyReport([]);
    } finally {
      setReportLoading(false);
    }
  }, [selectedClass, selectedSection, reportMonth]);

  useEffect(() => {
    if (viewMode === 'report' && selectedClass && selectedSection) {
      fetchMonthlyReport();
    }
  }, [fetchMonthlyReport, viewMode, selectedClass, selectedSection]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? undefined : status,
    }));
  };

  const markAllAs = (status) => {
    const records = {};
    students.forEach((s) => {
      records[s._id] = status;
    });
    setAttendanceRecords(records);
  };

  const handleSave = async () => {
    const records = Object.entries(attendanceRecords)
      .filter(([, status]) => status)
      .map(([studentId, status]) => ({ studentId, status }));

    if (records.length === 0) {
      toast.error('Please mark attendance for at least one student');
      return;
    }

    setSaving(true);
    try {
      await markAttendanceAPI({
        date: selectedDate,
        currentClass: selectedClass,
        section: selectedSection,
        records,
      });
      toast.success(`Attendance saved for ${records.length} students`);
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Summary counts
  const summary = {
    Present: 0,
    Absent: 0,
    Late: 0,
    HalfDay: 0,
  };
  Object.values(attendanceRecords).forEach((status) => {
    if (status && summary[status] !== undefined) {
      summary[status]++;
    }
  });
  const totalMarked = summary.Present + summary.Absent + summary.Late + summary.HalfDay;

  // Report summary
  const reportSummary = {
    totalWorkingDays: 0,
    averageAttendance: 0,
    lowAttendanceCount: 0,
  };
  if (monthlyReport.length > 0) {
    const first = monthlyReport[0];
    reportSummary.totalWorkingDays = first.totalDays || first.totalWorkingDays || 0;
    const percentages = monthlyReport.map((r) => {
      const total = (r.present || 0) + (r.absent || 0) + (r.late || 0) + (r.halfDay || 0);
      return total > 0 ? ((r.present || 0) / total) * 100 : 0;
    });
    reportSummary.averageAttendance =
      percentages.length > 0
        ? (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(1)
        : 0;
    reportSummary.lowAttendanceCount = percentages.filter((p) => p < 75).length;
  }

  const getPercentColor = (pct) => {
    if (pct >= 75) return 'text-green-600 bg-green-50';
    if (pct >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div>
      <Header title="Attendance" subtitle="Mark and manage student attendance" />

      {/* Top Controls */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Class */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Class</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
                <option key={c} value={String(c)}>Class {c}</option>
              ))}
            </select>

            {/* Section */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className={selectClass}
            >
              <option value="">Select Section</option>
              {['A', 'B', 'C', 'D'].map((s) => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>

            {/* Date (only in mark mode) */}
            {viewMode === 'mark' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={selectClass}
              />
            )}

            {/* Month picker (only in report mode) */}
            {viewMode === 'report' && (
              <input
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className={selectClass}
              />
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('mark')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'mark'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiClipboardDocumentCheck className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Mark Attendance
            </button>
            <button
              onClick={() => setViewMode('report')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                viewMode === 'report'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiChartBar className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
              Monthly Report
            </button>
          </div>
        </div>
      </div>

      {/* Mark Attendance View */}
      {viewMode === 'mark' && (
        <>
          {!selectedClass || !selectedSection ? (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <HiCalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">Select a class and section</p>
              <p className="text-sm text-gray-400 mt-1">
                Choose a class and section to start marking attendance
              </p>
            </div>
          ) : (
            <>
              {/* Bulk Actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 font-medium">Quick Actions:</span>
                  <button
                    onClick={() => markAllAs('Present')}
                    className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition"
                  >
                    <HiCheckCircle className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                    Mark All Present
                  </button>
                  <button
                    onClick={() => markAllAs('Absent')}
                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
                  >
                    <HiXCircle className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                    Mark All Absent
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  <HiCalendarDays className="w-4 h-4 inline-block mr-1 -mt-0.5" />
                  {dayjs(selectedDate).format('dddd, D MMMM YYYY')}
                </p>
              </div>

              {/* Student Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 w-20">
                        Roll No
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Student Name
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 w-72">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-16 text-center">
                          <HiUserGroup className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No students found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            No active students in Class {selectedClass} - Section {selectedSection}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      students.map((student, idx) => {
                        const currentStatus = attendanceRecords[student._id];
                        return (
                          <tr key={student._id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                              {student.rollNumber || idx + 1}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-gray-800">
                                {student.firstName} {student.lastName}
                              </span>
                              <span className="text-xs text-gray-400 ml-2">
                                {student.admissionNumber}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {Object.entries(STATUS_STYLES).map(([status, style]) => (
                                  <button
                                    key={status}
                                    onClick={() => handleStatusChange(student._id, status)}
                                    className={`w-10 h-8 rounded-lg border text-xs font-bold transition-all ${
                                      currentStatus === status
                                        ? `${style.active} ring-2 ring-offset-1`
                                        : INACTIVE_STYLE
                                    }`}
                                    title={status}
                                  >
                                    {style.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Bar */}
              {students.length > 0 && !loading && (
                <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-green-700">{summary.Present}</span> Present
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-red-700">{summary.Absent}</span> Absent
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-yellow-700">{summary.Late}</span> Late
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-blue-700">{summary.HalfDay}</span> Half Day
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {totalMarked} of {students.length} students marked
                    </span>
                  </div>
                </div>
              )}

              {/* Save Button */}
              {students.length > 0 && !loading && (
                <button
                  onClick={handleSave}
                  disabled={saving || totalMarked === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <HiArrowPath className="w-5 h-5 animate-spin" />
                      Saving Attendance...
                    </>
                  ) : (
                    <>
                      <HiCheckCircle className="w-5 h-5" />
                      Save Attendance ({totalMarked} students)
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </>
      )}

      {/* Monthly Report View */}
      {viewMode === 'report' && (
        <>
          {!selectedClass || !selectedSection ? (
            <div className="bg-white rounded-xl shadow-sm p-16 text-center">
              <HiChartBar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">Select a class and section</p>
              <p className="text-sm text-gray-400 mt-1">
                Choose a class and section to view the monthly attendance report
              </p>
            </div>
          ) : (
            <>
              {/* Report Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {reportLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  <>
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <HiCalendarDays className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Working Days</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {reportSummary.totalWorkingDays}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <HiChartBar className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Average Attendance</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {reportSummary.averageAttendance}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <HiExclamationTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Below 75% Attendance</p>
                          <p className="text-2xl font-bold text-gray-800">
                            {reportSummary.lowAttendanceCount} students
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Report Table */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Roll No
                      </th>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                        Name
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Present
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Absent
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Late
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Half Day
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Total
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                        Attendance %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportLoading ? (
                      Array.from({ length: 8 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-12" /></td>
                          <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-14 mx-auto" /></td>
                        </tr>
                      ))
                    ) : monthlyReport.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-16 text-center">
                          <HiChartBar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No attendance data found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            No records for {dayjs(reportMonth + '-01').format('MMMM YYYY')}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      monthlyReport.map((record, idx) => {
                        const present = record.present || 0;
                        const absent = record.absent || 0;
                        const late = record.late || 0;
                        const halfDay = record.halfDay || 0;
                        const total = present + absent + late + halfDay;
                        const pct = total > 0 ? ((present / total) * 100).toFixed(1) : 0;
                        const pctNum = parseFloat(pct);

                        return (
                          <tr key={record._id || record.studentId || idx} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                              {record.rollNumber || idx + 1}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                              {record.studentName || `${record.firstName || ''} ${record.lastName || ''}`}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-semibold text-green-600">{present}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-semibold text-red-600">{absent}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-semibold text-yellow-600">{late}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-semibold text-blue-600">{halfDay}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="text-sm font-medium text-gray-700">{total}</span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${getPercentColor(pctNum)}`}
                              >
                                {pct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
