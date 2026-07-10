import React, { useState, useEffect, useCallback } from 'react';
import {
  HiClipboardDocumentList,
  HiMagnifyingGlass,
  HiCheckCircle,
  HiXCircle,
  HiAcademicCap,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import * as api from '../services/api';

const CLASSES = Array.from({ length: 12 }, (_, i) => String(i + 1));
const SECTIONS = ['A', 'B', 'C', 'D'];
const EXAM_TYPES = ['Unit Test 1', 'Unit Test 2', 'Mid-Term', 'Annual', 'Other'];
const DEFAULT_SUBJECTS = ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'];

export default function Results() {
  const [activeTab, setActiveTab] = useState('enter');

  // ── Enter Results State ───────────────────────────────────────
  const [enterClass, setEnterClass] = useState('');
  const [enterSection, setEnterSection] = useState('');
  const [enterExamType, setEnterExamType] = useState('');
  const [enterAcademicYear, setEnterAcademicYear] = useState('2025-2026');
  
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [subjectsList, setSubjectsList] = useState([...DEFAULT_SUBJECTS]);
  const [newSubject, setNewSubject] = useState('');
  
  const [marksData, setMarksData] = useState({}); // { studentId: { subjectName: obtainedMarks } }
  const [savingResults, setSavingResults] = useState(false);

  // ── View Results State ────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [studentResults, setStudentResults] = useState([]);
  const [loadingStudentResults, setLoadingStudentResults] = useState(false);

  // ── Class-wise View State ─────────────────────────────────────
  const [viewClass, setViewClass] = useState('');
  const [viewSection, setViewSection] = useState('');
  const [viewExamType, setViewExamType] = useState('');
  const [viewAcademicYear, setViewAcademicYear] = useState('2025-2026');
  const [classResults, setClassResults] = useState([]);
  const [loadingClassResults, setLoadingClassResults] = useState(false);

  // ── Helper functions ──────────────────────────────────────────
  const calculateGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const calculateStudentTotal = (studentId) => {
    const studentMarks = marksData[studentId] || {};
    let total = 0;
    subjectsList.forEach(subject => {
      total += Number(studentMarks[subject] || 0);
    });
    return total;
  };

  const calculateStudentPercentage = (totalObtained) => {
    const maxTotal = subjectsList.length * 100;
    if (maxTotal === 0) return 0;
    return ((totalObtained / maxTotal) * 100).toFixed(2);
  };

  // ── Enter Results Handlers ────────────────────────────────────
  const loadStudentsForResults = async () => {
    if (!enterClass || !enterSection || !enterExamType || !enterAcademicYear) {
      toast.error('Please select Class, Section, Exam Type, and Academic Year');
      return;
    }

    setLoadingStudents(true);
    try {
      const response = await api.getStudents({ class: enterClass, section: enterSection, limit: 100 });
      const studentsList = response.data?.data || [];
      setStudents(studentsList);
      
      // Initialize marksData
      const initialMarks = {};
      studentsList.forEach(student => {
        initialMarks[student._id] = {};
        subjectsList.forEach(subject => {
          initialMarks[student._id][subject] = '';
        });
      });
      setMarksData(initialMarks);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleMarkChange = (studentId, subject, value) => {
    const numValue = value === '' ? '' : Math.min(100, Math.max(0, Number(value)));
    setMarksData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: numValue
      }
    }));
  };

  const addSubject = () => {
    if (newSubject && !subjectsList.includes(newSubject)) {
      setSubjectsList(prev => [...prev, newSubject]);
      // Update marksData
      setMarksData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(studentId => {
          updated[studentId] = { ...updated[studentId], [newSubject]: '' };
        });
        return updated;
      });
      setNewSubject('');
    }
  };

  const removeSubject = (subject) => {
    setSubjectsList(prev => prev.filter(s => s !== subject));
  };

  const saveAllResults = async () => {
    setSavingResults(true);
    let successCount = 0;
    let failCount = 0;

    for (const student of students) {
      const studentMarks = marksData[student._id] || {};
      
      const subjectsPayload = subjectsList.map(subject => ({
        subjectName: subject,
        maxMarks: 100,
        obtainedMarks: Number(studentMarks[subject] || 0),
        grade: calculateGrade((Number(studentMarks[subject] || 0) / 100) * 100)
      }));

      const payload = {
        studentId: student._id,
        class: enterClass,
        section: enterSection,
        examType: enterExamType,
        academicYear: enterAcademicYear,
        subjects: subjectsPayload
      };

      try {
        await api.createResult(payload);
        successCount++;
      } catch (error) {
        failCount++;
      }
    }

    if (successCount > 0) toast.success(`Saved results for ${successCount} students`);
    if (failCount > 0) toast.error(`Failed to save for ${failCount} students`);
    
    setSavingResults(false);
  };

  // ── View Results Handlers ─────────────────────────────────────
  // Search students
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const res = await api.getStudents({ search: value, limit: 5 });
      setSearchResults(res.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const selectStudent = async (student) => {
    setSelectedStudent(student);
    setSearchQuery('');
    setSearchResults([]);
    
    setLoadingStudentResults(true);
    try {
      const res = await api.getResultsByStudent(student._id);
      setStudentResults(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to load student results');
    } finally {
      setLoadingStudentResults(false);
    }
  };

  const fetchClassResults = async () => {
    if (!viewClass || !viewExamType || !viewAcademicYear) {
      toast.error('Please select Class, Exam Type and Academic Year');
      return;
    }
    
    setLoadingClassResults(true);
    try {
      const params = {
        class: viewClass,
        examType: viewExamType,
        academicYear: viewAcademicYear
      };
      if (viewSection) params.section = viewSection;
      
      const res = await api.getResultsByClass(params);
      setClassResults(res.data?.data || []);
    } catch (error) {
      toast.error('Failed to load class results');
    } finally {
      setLoadingClassResults(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────
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
      <Header title="Results & Examination" subtitle="Manage and view student academic results" />

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0">
          <button onClick={() => setActiveTab('enter')} className={tabClass('enter')}>
            <span className="flex items-center gap-2">
              <HiClipboardDocumentList className="w-4 h-4" />
              Enter Results
            </span>
          </button>
          <button onClick={() => setActiveTab('view')} className={tabClass('view')}>
            <span className="flex items-center gap-2">
              <HiAcademicCap className="w-4 h-4" />
              View Results
            </span>
          </button>
        </nav>
      </div>

      {/* ═══════════ TAB 1: ENTER RESULTS ═══════════ */}
      {activeTab === 'enter' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select value={enterClass} onChange={(e) => setEnterClass(e.target.value)} className={selectClass}>
                  <option value="">Select Class</option>
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <select value={enterSection} onChange={(e) => setEnterSection(e.target.value)} className={selectClass}>
                  <option value="">Select Section</option>
                  {SECTIONS.map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                <select value={enterExamType} onChange={(e) => setEnterExamType(e.target.value)} className={selectClass}>
                  <option value="">Select Exam Type</option>
                  {EXAM_TYPES.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={enterAcademicYear}
                  onChange={(e) => setEnterAcademicYear(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 2025-2026"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadStudentsForResults}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition"
                >
                  Load Students
                </button>
              </div>
            </div>

            {/* Subject Customization */}
            {students.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 mb-4">
                  {subjectsList.map(subject => (
                    <div key={subject} className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-md text-sm">
                      <span>{subject}</span>
                      <button onClick={() => removeSubject(subject)} className="text-gray-400 hover:text-red-500">
                        <HiXCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="New subject"
                      className="px-3 py-1.5 border border-gray-300 rounded text-sm w-32 focus:outline-none focus:border-blue-500"
                    />
                    <button onClick={addSubject} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Add</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Entry Table */}
          {students.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3 sticky left-0 bg-gray-50 z-10">
                        Student Name
                      </th>
                      {subjectsList.map(subject => (
                        <th key={subject} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 min-w-[100px]">
                          {subject}
                        </th>
                      ))}
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-100">
                        Total
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-100">
                        %
                      </th>
                      <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3 bg-gray-100">
                        Grade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {students.map(student => {
                      const total = calculateStudentTotal(student._id);
                      const percentage = calculateStudentPercentage(total);
                      const grade = calculateGrade(percentage);
                      
                      return (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 sticky left-0 bg-white z-10">
                            {student.firstName} {student.lastName}
                          </td>
                          {subjectsList.map(subject => (
                            <td key={subject} className="px-4 py-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={marksData[student._id]?.[subject] ?? ''}
                                onChange={(e) => handleMarkChange(student._id, subject, e.target.value)}
                                className="w-full text-center px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                              />
                            </td>
                          ))}
                          <td className="px-4 py-4 text-center text-sm font-semibold text-gray-700 bg-gray-50">
                            {total}
                          </td>
                          <td className="px-4 py-4 text-center text-sm font-semibold text-gray-700 bg-gray-50">
                            {percentage}%
                          </td>
                          <td className="px-4 py-4 text-center text-sm font-bold bg-gray-50">
                            <span className={grade === 'F' ? 'text-red-600' : 'text-green-600'}>
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={saveAllResults}
                  disabled={savingResults}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-8 py-2.5 rounded-lg font-medium transition flex items-center gap-2"
                >
                  <HiCheckCircle className="w-5 h-5" />
                  {savingResults ? 'Saving Results...' : 'Save All Results'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════ TAB 2: VIEW RESULTS ═══════════ */}
      {activeTab === 'view' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Search Student Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Find Student</h3>
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Search by name or admission no..."
                    className={inputClass + " pl-10"}
                  />
                  {/* Search Results Dropdown */}
                  {searchQuery.length >= 2 && (
                    <div className="absolute z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                      {isSearching ? (
                        <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
                      ) : searchResults.length > 0 ? (
                        <ul className="max-h-60 overflow-auto">
                          {searchResults.map((student) => (
                            <li
                              key={student._id}
                              onClick={() => selectStudent(student)}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0"
                            >
                              <div className="font-medium text-gray-800">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">
                                Adm: {student.admissionNumber} | Class: {student.currentClass}-{student.section}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">No students found</div>
                      )}
                    </div>
                  )}
                </div>

                {selectedStudent && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedStudent.firstName.charAt(0)}{selectedStudent.lastName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Class: {selectedStudent.currentClass}-{selectedStudent.section}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Class-wise Results Query */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Class-wise Results</h3>
                <div className="space-y-4">
                  <select value={viewClass} onChange={(e) => setViewClass(e.target.value)} className={selectClass}>
                    <option value="">Select Class</option>
                    {CLASSES.map((c) => <option key={c} value={c}>Class {c}</option>)}
                  </select>
                  <select value={viewSection} onChange={(e) => setViewSection(e.target.value)} className={selectClass}>
                    <option value="">Select Section (Optional)</option>
                    {SECTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                  <select value={viewExamType} onChange={(e) => setViewExamType(e.target.value)} className={selectClass}>
                    <option value="">Select Exam Type</option>
                    {EXAM_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <input
                    type="text"
                    value={viewAcademicYear}
                    onChange={(e) => setViewAcademicYear(e.target.value)}
                    className={inputClass}
                    placeholder="Academic Year (e.g. 2025-2026)"
                  />
                  <button
                    onClick={fetchClassResults}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition"
                  >
                    View Class Results
                  </button>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Individual Student Results */}
              {selectedStudent && (
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Academic Results</h3>
                  {loadingStudentResults ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : studentResults.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <HiClipboardDocumentList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No results found for this student</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {studentResults.map((result) => (
                        <div key={result._id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                          <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-gray-800 text-lg">{result.examType}</h4>
                              <p className="text-sm text-gray-500">Academic Year: {result.academicYear} | Class: {result.class}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${result.result === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {result.result}
                            </span>
                          </div>
                          <div className="p-0">
                            <table className="w-full">
                              <thead className="bg-white border-b border-gray-100">
                                <tr>
                                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Subject</th>
                                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Max Marks</th>
                                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Obtained</th>
                                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Grade</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-50">
                                {result.subjects.map((sub, idx) => (
                                  <tr key={idx}>
                                    <td className="px-6 py-3 text-sm text-gray-800 font-medium">{sub.subjectName}</td>
                                    <td className="px-6 py-3 text-sm text-gray-500 text-center">{sub.maxMarks}</td>
                                    <td className="px-6 py-3 text-sm text-gray-800 text-center font-medium">{sub.obtainedMarks}</td>
                                    <td className={`px-6 py-3 text-sm text-center font-bold ${sub.grade === 'F' ? 'text-red-500' : 'text-blue-600'}`}>
                                      {sub.grade}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr>
                                  <td className="px-6 py-4 text-sm font-bold text-gray-800">TOTAL</td>
                                  <td className="px-6 py-4 text-sm font-bold text-gray-600 text-center">{result.totalMaxMarks}</td>
                                  <td className="px-6 py-4 text-sm font-bold text-blue-600 text-center">{result.totalObtainedMarks}</td>
                                  <td className="px-6 py-4 text-sm font-bold text-gray-800 text-center">{result.percentage}%</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Class-wise Results Table */}
              {!selectedStudent && classResults.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800">
                      Class {viewClass} {viewSection ? `(${viewSection})` : ''} - {viewExamType} ({viewAcademicYear})
                    </h3>
                    <span className="text-sm text-gray-500">{classResults.length} Students</span>
                  </div>
                  <table className="w-full">
                    <thead className="bg-white border-b border-gray-100">
                      <tr>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">Student Name</th>
                        <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Max Marks</th>
                        <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Obtained</th>
                        <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Percentage</th>
                        <th className="text-center text-xs font-medium text-gray-500 uppercase px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {classResults.map((res) => (
                        <tr key={res._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => selectStudent(res.studentId)}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            {res.studentId?.firstName} {res.studentId?.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 text-center">{res.totalMaxMarks}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800 text-center">{res.totalObtainedMarks}</td>
                          <td className="px-6 py-4 text-sm font-medium text-blue-600 text-center">{res.percentage}%</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${res.result === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {res.result}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {!selectedStudent && classResults.length === 0 && !loadingClassResults && (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-dashed border-gray-200">
                  <HiMagnifyingGlass className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Select a student or view class results</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
