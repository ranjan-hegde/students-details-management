import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Admission from './pages/Admission';
import StudentList from './pages/StudentList';
import StudentDetail from './pages/StudentDetail';
import EditStudent from './pages/EditStudent';
import FeeManagement from './pages/FeeManagement';
import Certificates from './pages/Certificates';
import TeacherSchedule from './pages/TeacherSchedule';
import Results from './pages/Results';
import SchoolSettings from './pages/SchoolSettings';
import Attendance from './pages/Attendance';
import Notices from './pages/Notices';
import EventCalendar from './pages/EventCalendar';
import ExamSchedule from './pages/ExamSchedule';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="admission" element={<Admission />} />
          <Route path="students" element={<StudentList />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="students/:id/edit" element={<EditStudent />} />
          <Route path="fees" element={<FeeManagement />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="teachers" element={<TeacherSchedule />} />
          <Route path="results" element={<Results />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="notices" element={<Notices />} />
          <Route path="events" element={<EventCalendar />} />
          <Route path="exam-schedules" element={<ExamSchedule />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<SchoolSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
