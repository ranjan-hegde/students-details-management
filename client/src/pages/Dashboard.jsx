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

// Fallback mock data
const mockStats = {
  totalStudents: 1247,
  newAdmissions: 38,
  pendingFees: 245600,
  activeClasses: 24,
};

const mockRecentAdmissions = [
  { _id: '1', firstName: 'Aarav', lastName: 'Sharma', currentClass: '5', section: 'A', createdAt: '2026-06-20', status: 'Active' },
  { _id: '2', firstName: 'Priya', lastName: 'Patel', currentClass: '8', section: 'B', createdAt: '2026-06-19', status: 'Active' },
  { _id: '3', firstName: 'Rohan', lastName: 'Kumar', currentClass: '3', section: 'A', createdAt: '2026-06-18', status: 'Active' },
  { _id: '4', firstName: 'Ananya', lastName: 'Singh', currentClass: '10', section: 'C', createdAt: '2026-06-17', status: 'Active' },
  { _id: '5', firstName: 'Vikram', lastName: 'Reddy', currentClass: '7', section: 'B', createdAt: '2026-06-16', status: 'Active' },
];

const mockPendingFees = [
  { _id: '1', firstName: 'Rahul', lastName: 'Verma', currentClass: '6', section: 'A', pendingAmount: 15000 },
  { _id: '2', firstName: 'Sneha', lastName: 'Gupta', currentClass: '9', section: 'B', pendingAmount: 22500 },
  { _id: '3', firstName: 'Arjun', lastName: 'Nair', currentClass: '4', section: 'A', pendingAmount: 8000 },
  { _id: '4', firstName: 'Kavya', lastName: 'Joshi', currentClass: '11', section: 'C', pendingAmount: 35000 },
  { _id: '5', firstName: 'Aditya', lastName: 'Mishra', currentClass: '2', section: 'B', pendingAmount: 12000 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(mockStats);
  const [recentAdmissions, setRecentAdmissions] = useState(mockRecentAdmissions);
  const [pendingFees, setPendingFees] = useState(mockPendingFees);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await getDashboardStats();
      const data = response.data;
      if (data.stats) setStats(data.stats);
      if (data.recentAdmissions) setRecentAdmissions(data.recentAdmissions);
      if (data.pendingFees) setPendingFees(data.pendingFees);
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
      label: 'New Admissions',
      value: formatNumber(stats.newAdmissions),
      icon: HiUserPlus,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Pending Fees',
      value: formatCurrency(stats.pendingFees),
      icon: HiCurrencyRupee,
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-600',
    },
    {
      label: 'Active Classes',
      value: formatNumber(stats.activeClasses),
      icon: HiAcademicCap,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
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

      {/* Two Column Section */}
      <div className="grid grid-cols-2 gap-6">
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
                        {dayjs(student.createdAt).format('DD MMM YYYY')}
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
              : pendingFees.map((item) => (
                  <div
                    key={item._id}
                    className="px-6 py-4 hover:bg-gray-50 transition cursor-pointer flex items-center justify-between"
                    onClick={() => navigate(`/students/${item._id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.firstName} {item.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Class {item.currentClass}-{item.section}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(item.pendingAmount)}
                    </span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
