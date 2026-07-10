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
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import Header from '../components/layout/Header';
import { getDashboardStats } from '../services/api';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardStats();
      const apiData = response.data?.data;
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
      }
    } catch (error) {
      // Use mock data on failure — no error toast needed for dashboard fallback
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

      {/* Quick Search */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm p-4 mb-8">
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

      {/* Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
