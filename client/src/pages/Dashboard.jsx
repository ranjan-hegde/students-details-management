import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiUsers,
  HiUserPlus,
  HiCurrencyRupee,
  HiAcademicCap,
  HiMagnifyingGlass,
  HiArrowTrendingUp,
  HiExclamationTriangle,
  HiClipboardDocumentCheck,
  HiCalendarDays,
  HiMegaphone,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Header from '../components/layout/Header';
import { getDashboardStats, getActiveNotices, getEvents } from '../services/api';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-16" /></td>
  </tr>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    expectedFees: 0,
    paidFees: 0,
    pendingFees: 0,
  });
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [pendingFees, setPendingFees] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [activeNotices, setActiveNotices] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, noticesRes, eventsRes] = await Promise.allSettled([
        getDashboardStats(),
        getActiveNotices(),
        getEvents({ month: dayjs().format('YYYY-MM') }),
      ]);

      if (dashRes.status === 'fulfilled') {
        const apiData = dashRes.value.data?.data;
        if (apiData) {
          setStats({
            totalStudents: apiData.totalStudents || 0,
            expectedFees: apiData.totalExpectedFees || 0,
            paidFees: apiData.totalPaidFees || 0,
            pendingFees: apiData.totalPendingFees || 0,
          });
          if (apiData.recentAdmissions) setRecentAdmissions(apiData.recentAdmissions);
          if (apiData.pendingFeeAlerts) setPendingFees(apiData.pendingFeeAlerts);
          if (apiData.recentPayments) setRecentPayments(apiData.recentPayments);
          if (apiData.todayAttendance) setTodayAttendance(apiData.todayAttendance);
          if (apiData.upcomingEvents) setUpcomingEvents(apiData.upcomingEvents);
        }
      }

      if (noticesRes.status === 'fulfilled') {
        setActiveNotices(noticesRes.value.data?.data?.slice(0, 5) || []);
      }

      if (eventsRes.status === 'fulfilled') {
        const allEvents = eventsRes.value.data?.data || [];
        const upcoming = allEvents
          .filter(e => dayjs(e.eventDate).isAfter(dayjs().subtract(1, 'day')))
          .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
          .slice(0, 5);
        if (upcomingEvents.length === 0) setUpcomingEvents(upcoming);
      }
    } catch (error) {
      console.log('Using fallback dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const attendancePercentage = todayAttendance
    ? todayAttendance.total > 0
      ? Math.round((todayAttendance.present / todayAttendance.total) * 100)
      : 0
    : null;

  const statCards = [
    {
      label: 'Total Students',
      value: formatNumber(stats.totalStudents),
      icon: HiUsers,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Expected Total Fees',
      value: formatCurrency(stats.expectedFees),
      icon: HiAcademicCap,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'Total Fees Paid',
      value: formatCurrency(stats.paidFees),
      icon: HiCurrencyRupee,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Remaining Fees Left',
      value: formatCurrency(stats.pendingFees),
      icon: HiExclamationTriangle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

  const eventTypeColors = {
    Exam: 'bg-red-100 text-red-700',
    Holiday: 'bg-green-100 text-green-700',
    Sports: 'bg-yellow-100 text-yellow-700',
    Cultural: 'bg-purple-100 text-purple-700',
    Meeting: 'bg-cyan-100 text-cyan-700',
    Other: 'bg-gray-100 text-gray-700',
  };

  const priorityStyles = {
    Urgent: 'border-l-4 border-red-500 bg-red-50',
    Important: 'border-l-4 border-amber-500 bg-amber-50',
    Normal: '',
  };

  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your school management system" />

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((card) => (
              <div key={card.label} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Today's Attendance Banner + Quick Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Today's Attendance */}
        <div
          className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => navigate('/attendance')}
        >
          <div className="flex items-center gap-3 mb-4">
            <HiClipboardDocumentCheck className="w-6 h-6" />
            <h3 className="text-lg font-semibold">Today's Attendance</h3>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-white/20 rounded w-20" />
              <div className="h-4 bg-white/20 rounded w-32" />
            </div>
          ) : todayAttendance ? (
            <>
              <p className="text-4xl font-bold mb-1">{attendancePercentage}%</p>
              <p className="text-sm text-blue-100">
                {todayAttendance.present} present out of {todayAttendance.total} students
              </p>
              <div className="mt-3 bg-white/20 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${attendancePercentage}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold mb-1">Not marked</p>
              <p className="text-sm text-blue-100">Click to mark today's attendance</p>
            </>
          )}
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2 flex flex-col justify-center">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Search</p>
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search students by name, admission number..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm"
            />
          </div>
        </form>
      </div>

      {/* Active Notices Ticker */}
      {activeNotices.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0">
              <HiMegaphone className="w-4 h-4" />
              NOTICES
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-8">
                {activeNotices.map((notice) => (
                  <span
                    key={notice._id}
                    className="text-sm text-gray-600 whitespace-nowrap cursor-pointer hover:text-blue-600 transition shrink-0"
                    onClick={() => navigate('/notices')}
                  >
                    {notice.priority === 'Urgent' && <span className="text-red-500 mr-1">●</span>}
                    {notice.priority === 'Important' && <span className="text-amber-500 mr-1">●</span>}
                    <span className="font-medium">{notice.title}</span>
                    {notice.content && ` — ${notice.content.substring(0, 60)}${notice.content.length > 60 ? '...' : ''}`}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/notices')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium shrink-0"
            >
              View All →
            </button>
          </div>
        </div>
      )}

      {/* Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Admissions */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiArrowTrendingUp className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Recent Admissions</h2>
            </div>
            <button
              onClick={() => navigate('/students')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
            >
              View All →
            </button>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Class</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : recentAdmissions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500 text-sm">
                        No recent admissions found.
                      </td>
                    </tr>
                  )
                : recentAdmissions.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => navigate(`/students/${student._id}`)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.currentClass}-{student.section}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dayjs(student.admissionDate || student.createdAt).format('DD MMM YYYY')}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          {student.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Pending Fee Alerts */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiExclamationTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-800">Pending Fee Alerts</h2>
            </div>
            <button
              onClick={() => navigate('/fees')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-3 bg-gray-200 rounded w-20" />
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                ))
              : pendingFees.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 text-sm">
                    No pending fee alerts.
                  </div>
                )
              : pendingFees.map((item) => (
                  <div
                    key={item._id}
                    className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
                    onClick={() => navigate(`/students/${item.studentId}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.studentName || item.firstName + ' ' + item.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Class {item.currentClass}-{item.section}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(item.pendingFee || item.pendingAmount)}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiCurrencyRupee className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">Recent Payments</h2>
            </div>
            <button
              onClick={() => navigate('/fees')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 animate-pulse">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-3 bg-gray-200 rounded w-20" />
                      </div>
                      <div className="h-5 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                ))
              : recentPayments.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500 text-sm">
                    No recent payments.
                  </div>
                )
              : recentPayments.map((item) => (
                  <div
                    key={item._id}
                    className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
                    onClick={() => navigate(`/students/${item.studentId}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.studentName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Class {item.currentClass}-{item.section}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        +{formatCurrency(item.amount)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {dayjs(item.paymentDate).format('DD MMM, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiCalendarDays className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Events</h2>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-40" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              ))
            ) : upcomingEvents.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">
                No upcoming events.
              </div>
            ) : (
              upcomingEvents.map((event) => (
                <div
                  key={event._id}
                  className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
                  onClick={() => navigate('/events')}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {dayjs(event.eventDate).format('ddd, DD MMM YYYY')}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${eventTypeColors[event.type] || eventTypeColors.Other}`}>
                    {event.type}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Notices */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HiMegaphone className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-800">Latest Notices</h2>
            </div>
            <button
              onClick={() => navigate('/notices')}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-4 animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))
            ) : activeNotices.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500 text-sm">
                No active notices.
              </div>
            ) : (
              activeNotices.slice(0, 5).map((notice) => (
                <div
                  key={notice._id}
                  className={`px-6 py-4 hover:bg-gray-50 transition cursor-pointer ${priorityStyles[notice.priority] || ''}`}
                  onClick={() => navigate('/notices')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{notice.title}</p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notice.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                      {dayjs(notice.createdAt).format('DD MMM')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
