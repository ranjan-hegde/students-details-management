import { NavLink } from 'react-router-dom';
import {
  HiAcademicCap,
  HiHome,
  HiUserPlus,
  HiUsers,
  HiCurrencyRupee,
  HiDocumentText,
} from 'react-icons/hi2';

const navItems = [
  { name: 'Dashboard', icon: HiHome, path: '/' },
  { name: 'Admissions', icon: HiUserPlus, path: '/admission' },
  { name: 'Students', icon: HiUsers, path: '/students' },
  { name: 'Fee Management', icon: HiCurrencyRupee, path: '/fees' },
  { name: 'Certificates', icon: HiDocumentText, path: '/certificates' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen bg-slate-800 text-white flex flex-col z-10">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <HiAcademicCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">EduManage</h1>
            <p className="text-xs text-slate-400">School Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-500">EduManage v1.0.0</p>
        <p className="text-xs text-slate-500 mt-1">© 2026 All rights reserved</p>
      </div>
    </aside>
  );
}
