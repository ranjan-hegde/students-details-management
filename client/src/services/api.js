import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Students ────────────────────────────────────────────────────────────────
export const getStudents = (params) => api.get('/students', { params });
export const getStudent = (id) => api.get(`/students/${id}`);
export const createStudent = (data) => api.post('/students', data);
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const getNextAdmissionNumber = () => api.get('/students/next-admission-number');
export const getStudentById = (id) => api.get(`/students/id/${id}`);
// ─── Documents ───────────────────────────────────────────────────────────────
export const uploadDocuments = (studentId, formData) =>
  api.post(`/documents/upload/${studentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getDocuments = (studentId) => api.get(`/documents/${studentId}`);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);

// ─── Fees ────────────────────────────────────────────────────────────────────
export const createFeeRecord = (data) => api.post('/fees', data);
export const getFeeRecord = (studentId) => api.get(`/fees/${studentId}`);
export const updateFeeRecord = (id, data) => api.put(`/fees/${id}`, data);

// ─── Payments ────────────────────────────────────────────────────────────────
export const createPayment = (data) => api.post('/payments', data);
export const getPayments = (studentId) => api.get(`/payments/${studentId}`);

// ─── Certificates ────────────────────────────────────────────────────────────
export const generateBonafide = (studentId) => api.post(`/certificates/bonafide/${studentId}`);
export const generateTC = (studentId, data) => api.post(`/certificates/tc/${studentId}`, data);
export const getCertificates = (studentId) => api.get(`/certificates/${studentId}`);

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/dashboard/stats');

// ─── Settings ──────────────────────────────────────────────────────────────────
export const getSchoolSettings = () => api.get('/settings');
export const updateSchoolSettings = (data) => api.put('/settings', data);

// ─── Teachers ────────────────────────────────────────────────────────────────
export const getTeachers = (params) => api.get('/teachers', { params });
export const getTeacher = (id) => api.get(`/teachers/${id}`);
export const createTeacher = (data) => api.post('/teachers', data);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);
export const getNextTeacherId = () => api.get('/teachers/next-id');

// ─── Timetable ───────────────────────────────────────────────────────────────
export const getTimetableByClass = (params) => api.get('/timetable', { params });
export const getTimetableByTeacher = (teacherId) => api.get(`/timetable/teacher/${teacherId}`);
export const saveBulkTimetable = (data) => api.post('/timetable/bulk', data);
export const deleteTimetableEntry = (id) => api.delete(`/timetable/${id}`);

// ─── Results ─────────────────────────────────────────────────────────────────
export const createResult = (data) => api.post('/results', data);
export const getResultsByStudent = (studentId) => api.get(`/results/student/${studentId}`);
export const getResultsByClass = (params) => api.get('/results', { params });
export const updateResult = (id, data) => api.put(`/results/${id}`, data);
export const deleteResult = (id) => api.delete(`/results/${id}`);

export default api;
