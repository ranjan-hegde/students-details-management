import dayjs from 'dayjs';
import { HiCalendarDays } from 'react-icons/hi2';

export default function Header({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <HiCalendarDays className="w-4 h-4" />
          <span>{dayjs().format('dddd, D MMMM YYYY')}</span>
        </div>
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-sm font-semibold text-white">AD</span>
        </div>
      </div>
    </div>
  );
}
