import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LuHouse, LuMessageCircle, LuEye, LuClock,
  LuPlus, LuMapPin, LuCircleCheck, LuCircleX, LuHourglass,
  LuStar, LuUsers, LuArrowRight
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { fetchStats, fetchAnnexes } from '../../api/api';

interface StatCard {
  label: string;
  value: number | string;
  change: string;
  up: boolean;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

interface Listing {
  id: number;
  title: string;
  campus: string;
  price: string | number;
  status: 'pending' | 'approved' | 'rejected' | string;
  created_at?: string;
  images?: string[];
  contactName?: string;
}

interface ActivityItem {
  id: string;
  student: string;
  initials: string;
  listing: string;
  time: string;
  bg: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', student: 'Kavya Perera', initials: 'KP', listing: 'Studio near UOM', time: '2m ago', bg: 'bg-blue-100 text-blue-800' },
  { id: '2', student: 'Dinuka Silva', initials: 'DS', listing: 'Room in Kandy City', time: '15m ago', bg: 'bg-emerald-100 text-emerald-800' },
  { id: '3', student: 'Amali Fernando', initials: 'AF', listing: 'Annex near SLIIT', time: '1h ago', bg: 'bg-purple-100 text-purple-800' },
  { id: '4', student: 'Roshel Gomes', initials: 'RG', listing: 'Furnished Single Room', time: '3h ago', bg: 'bg-amber-100 text-amber-800' },
  { id: '5', student: 'Malshi Wijetunga', initials: 'MW', listing: 'Luxury Studio Moratuwa', time: '5h ago', bg: 'bg-rose-100 text-rose-800' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const StatusBadge = ({ status }: { status: string }) => {
  const isApproved = status === 'Approved' || status === 'Active' || status === 'approved';
  const isPending = status === 'Pending' || status === 'pending';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
      isApproved ? 'bg-emerald-100 text-emerald-800' :
      isPending ? 'bg-amber-100 text-amber-800' :
      'bg-red-100 text-red-800'
    }`}>
      {isApproved ? <LuCircleCheck className="text-xs" /> : isPending ? <LuHourglass className="text-xs" /> : <LuCircleX className="text-xs" />}
      {status}
    </span>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<{ totalStudents: number; approvedAnnexes: number; pendingAnnexes: number }>({
    totalStudents: 0,
    approvedAnnexes: 0,
    pendingAnnexes: 0
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsData, annexData] = await Promise.all([
          fetchStats().catch(() => ({ totalStudents: 0, approvedAnnexes: 0, pendingAnnexes: 0 })),
          fetchAnnexes().catch(() => []),
        ]);
        if (statsData) setStats(statsData);
        setListings((annexData as any[]).slice(0, 6));
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards: StatCard[] = [
    {
      label: 'Active Listings',
      value: stats.approvedAnnexes,
      change: '+12%',
      up: true,
      icon: LuHouse,
      iconBg: 'bg-blue-50 border border-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Total Inquiries',
      value: '348',
      change: '+28%',
      up: true,
      icon: LuMessageCircle,
      iconBg: 'bg-emerald-50 border border-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Profile Views',
      value: '1,204',
      change: '+5%',
      up: true,
      icon: LuEye,
      iconBg: 'bg-purple-50 border border-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Pending Approval',
      value: stats.pendingAnnexes,
      change: `${stats.pendingAnnexes} new`,
      up: false,
      icon: LuClock,
      iconBg: 'bg-amber-50 border border-amber-100',
      iconColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 🌟 1. Clean SaaS Welcome Banner 🌟 */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 inline-flex items-center gap-1">
              <LuStar className="w-3 h-3 fill-blue-600" />
              The Uni Gang Command Center
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, Admin 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Overview of university listings, verified students, and campus activity for{' '}
            <span className="text-slate-800 font-bold">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => navigate('/admin/users')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LuUsers className="text-base text-slate-500" />
            <span>{stats.totalStudents} Students</span>
          </button>
          <button
            onClick={() => navigate('/admin/annexes')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LuPlus className="text-base" />
            <span>New Listing</span>
          </button>
        </div>
      </div>

      {/* 🌟 2. 4 Stat Cards Grid 🌟 */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={cardVariants}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className={`text-xl ${card.iconColor}`} />
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  card.up ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                  {card.change}
                </span>
              </div>

              <div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : card.value}
                </p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  {card.label}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 🌟 3. Main Split Grid: Recent Listings & Student Activity 🌟 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Listings (8 cols on desktop) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Recent Listings</h3>
              <p className="text-xs text-slate-400">Newly added student accommodations</p>
            </div>
            <button
              onClick={() => navigate('/admin/annexes')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <LuArrowRight className="text-xs" />
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Campus</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                      Loading recent listings...
                    </td>
                  </tr>
                ) : listings.length > 0 ? (
                  listings.map((l) => (
                    <tr
                      key={l.id}
                      onClick={() => navigate('/admin/annexes')}
                      className="hover:bg-blue-50/20 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 truncate max-w-xs">{l.title}</p>
                        <p className="text-[11px] text-slate-400 truncate">Ad #{l.id}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <LuMapPin className="text-slate-400 text-xs shrink-0" />
                          <span>{l.campus}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {l.price}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <StatusBadge status={l.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                      No listings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Student Activity Feed (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Student Activity</h3>
                <p className="text-xs text-slate-400">Live platform interactions</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {MOCK_ACTIVITY.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-full ${act.bg} flex items-center justify-center font-bold text-xs shrink-0`}>
                      {act.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{act.student}</p>
                      <p className="text-[11px] text-slate-400 truncate">{act.listing}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => navigate('/admin/annexes')}
              className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Manage Moderation Hub →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
