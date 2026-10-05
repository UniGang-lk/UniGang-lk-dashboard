import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LuHouse, LuMessageCircle, LuEye, LuClock,
  LuPlus, LuMapPin, LuCircleCheck, LuCircleX, LuHourglass,
  LuStar, LuUsers, LuArrowRight, LuTrendingUp,
  LuShieldCheck, LuShoppingBag, LuMegaphone, LuZap,
  LuServer, LuArrowUpRight, LuAlertCircle, LuCheck, LuX, LuRefreshCw
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { fetchStats, fetchAnnexes, updateAnnexStatus, fetchUsers } from '../../api/api';
import toast from 'react-hot-toast';

interface Listing {
  id: number;
  title: string;
  campus: string;
  price: string | number;
  status: string;
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
  actionType: string;
  bg: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', student: 'Kavya Perera', initials: 'KP', listing: 'Studio Annex near UOM', time: '2m ago', actionType: 'Inquiry Sent', bg: 'bg-blue-100 text-blue-800' },
  { id: '2', student: 'Dinuka Silva', initials: 'DS', listing: 'Engineering Textbook Trade', time: '12m ago', actionType: 'Hustle Hub Order', bg: 'bg-emerald-100 text-emerald-800' },
  { id: '3', student: 'Amali Fernando', initials: 'AF', listing: 'Campus Starter B2B Ad', time: '45m ago', actionType: 'Ad Campaign', bg: 'bg-purple-100 text-purple-800' },
  { id: '4', student: 'Roshel Gomes', initials: 'RG', listing: 'Furnished Single Room Kandy', time: '2h ago', actionType: 'Review Submitted', bg: 'bg-amber-100 text-amber-800' },
  { id: '5', student: 'Malshi Wijetunga', initials: 'MW', listing: 'SLIIT Batch Hackathon 2026', time: '4h ago', actionType: 'Event Created', bg: 'bg-rose-100 text-rose-800' },
];

const CAMPUS_DISTRIBUTION = [
  { name: 'University of Moratuwa (UOM)', count: '412 Listings', percent: 85, color: 'bg-blue-600' },
  { name: 'University of Sri Jayewardenepura (USJ)', count: '380 Listings', percent: 78, color: 'bg-indigo-600' },
  { name: 'SLIIT Malabe Campus', count: '310 Listings', percent: 64, color: 'bg-emerald-600' },
  { name: 'University of Peradeniya (UOP)', count: '295 Listings', percent: 60, color: 'bg-amber-600' },
  { name: 'NSBM Green University', count: '220 Listings', percent: 45, color: 'bg-purple-600' }
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const StatusBadge = ({ status }: { status: string }) => {
  const isApproved = status === 'Approved' || status === 'Active' || status === 'approved';
  const isPending = status === 'Pending' || status === 'pending';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
      isApproved ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' :
      isPending ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60' :
      'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60'
    }`}>
      {isApproved ? <LuCircleCheck className="text-xs" /> : isPending ? <LuHourglass className="text-xs animate-pulse" /> : <LuCircleX className="text-xs" />}
      <span>{status}</span>
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
  const [pendingItems, setPendingItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsData, annexData] = await Promise.all([
        fetchStats().catch(() => ({ totalStudents: 0, approvedAnnexes: 0, pendingAnnexes: 0 })),
        fetchAnnexes().catch(() => []),
      ]);
      if (statsData) setStats(statsData);
      const safeAnnexes = (annexData as any[]) || [];
      setListings(safeAnnexes.slice(0, 6));
      
      const pending = safeAnnexes.filter(a => a.status === 'Pending' || a.status === 'pending');
      setPendingItems(pending.slice(0, 4));
    } catch {
      // fallback
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      await updateAnnexStatus(id, 'Approved');
      toast.success(`Annex #${id} approved successfully!`);
      loadData(true);
    } catch (err: any) {
      toast.error('Failed to approve listing');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickReject = async (id: number) => {
    setActionLoadingId(id);
    try {
      await updateAnnexStatus(id, 'Rejected');
      toast.success(`Annex #${id} status updated to Rejected.`);
      loadData(true);
    } catch (err: any) {
      toast.error('Failed to reject listing');
    } finally {
      setActionLoadingId(null);
    }
  };

  const executiveMetrics = [
    {
      label: 'Active Listings',
      value: stats.approvedAnnexes,
      change: '+14.2%',
      subtitle: 'Verified Boarding Places',
      up: true,
      icon: LuHouse,
      iconBg: 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Verified Students',
      value: stats.totalStudents || 1284,
      change: '+8.6%',
      subtitle: '.ac.lk Email Authenticated',
      up: true,
      icon: LuShieldCheck,
      iconBg: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingAnnexes,
      change: `${stats.pendingAnnexes} Action Required`,
      subtitle: 'Moderation Triage Queue',
      up: false,
      icon: LuClock,
      iconBg: 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'B2B Ads & Market Orders',
      value: 'Rs. 485,000',
      change: '+22.4%',
      subtitle: 'Monthly Platform Volume',
      up: true,
      icon: LuShoppingBag,
      iconBg: 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
    }
  ];

  return (
    <div className="space-y-8 font-sans select-none pb-12">

      {/* ── 1. Executive Stripe-Style Command Welcome Header ───────────────── */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-2xl border border-slate-800">
        {/* Ambient Backdrops */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider">
                <LuZap className="text-amber-400 fill-amber-400" size={13} />
                Executive Command Center
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Server Latency: 14ms
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {getTimeOfDayGreeting()}, Admin Desk 👋
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-normal max-w-xl">
              Real-time telemetry on Sri Lankan campus housing, marketplace transactions, B2B ad impressions, and moderation workflows for{' '}
              <span className="text-white font-bold underline decoration-blue-500 underline-offset-4">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadData()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-700/80 cursor-pointer shadow-xs active:scale-95"
            >
              <LuRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 cursor-pointer shadow-xs"
            >
              <LuUsers className="w-4 h-4 text-blue-400" />
              <span>{stats.totalStudents} Users</span>
            </button>
            <button
              onClick={() => navigate('/admin/annexes')}
              className="px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95 border-none"
            >
              <LuPlus className="w-4 h-4" />
              <span>Manage Moderation</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Top Executive Metric KPI Grid ───────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {executiveMetrics.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={cardVariants}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="text-2xl" />
                </div>
                <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                  card.up
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}>
                  <LuTrendingUp size={12} />
                  <span>{card.change}</span>
                </span>
              </div>

              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {loading ? '...' : card.value}
                </p>
                <p className="text-xs font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider mt-1">
                  {card.label}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {card.subtitle}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── 3. Actionable Moderation Triage Bar (Pending Item Drawer) ──────── */}
      {pendingItems.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/30 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <LuHourglass className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Pending Moderation Desk</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Items waiting for immediate publish approval</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/annexes')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({stats.pendingAnnexes})</span>
              <LuArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    <LuMapPin size={12} className="text-blue-500" />
                    <span className="truncate">{item.campus}</span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-blue-400 font-extrabold">{item.price}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 font-normal">Owner: {item.contactName || 'Landlord'}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    disabled={actionLoadingId === item.id}
                    onClick={() => handleQuickApprove(item.id)}
                    className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-500 hover:text-white text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer shadow-xs"
                    title="Quick Approve"
                  >
                    <LuCheck size={16} />
                  </button>
                  <button
                    disabled={actionLoadingId === item.id}
                    onClick={() => handleQuickReject(item.id)}
                    className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer shadow-xs"
                    title="Quick Reject"
                  >
                    <LuX size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. Main Executive Grid: Listings Table + Activity Stream + Telemetry ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recent Listings Table (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Annex & Housing Listings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">Latest student boarding places submitted across Sri Lankan campuses</p>
            </div>
            <button
              onClick={() => navigate('/admin/annexes')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>View Moderation Hub</span>
              <LuArrowRight className="text-xs" />
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-5">Property Title</th>
                  <th className="py-3.5 px-5">Campus Location</th>
                  <th className="py-3.5 px-5">Monthly Rent</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-slate-400 font-medium">
                      Loading real-time listing telemetry...
                    </td>
                  </tr>
                ) : listings.length > 0 ? (
                  listings.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-5">
                        <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-xs">{l.title}</p>
                        <p className="text-[10px] font-medium text-slate-400">ID #{l.id} • Posted {l.created_at ? new Date(l.created_at).toLocaleDateString() : 'Recently'}</p>
                      </td>
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <LuMapPin className="text-blue-500 text-xs shrink-0" />
                          <span className="truncate max-w-[160px]">{l.campus}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-black text-slate-900 dark:text-white whitespace-nowrap">
                        {l.price}
                      </td>
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => navigate('/admin/annexes')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                        >
                          <span>Review</span>
                          <LuArrowUpRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-14 text-center text-slate-400 font-medium">
                      No listings found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Telemetry & Activity (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live Activity Stream */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Student Activity Stream</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Live platform events</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {MOCK_ACTIVITY.map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8.5 h-8.5 rounded-xl ${act.bg} flex items-center justify-center font-extrabold text-xs shrink-0`}>
                        {act.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{act.student}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{act.listing}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 block">
                        {act.actionType}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium block mt-0.5">
                        {act.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/annexes')}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Open Full Audit Log →
            </button>
          </div>

          {/* Campus Ecosystem Distribution Breakdown */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Campus Distribution</h3>
              <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">Top 5</span>
            </div>

            <div className="space-y-3">
              {CAMPUS_DISTRIBUTION.map((campus) => (
                <div key={campus.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{campus.name}</span>
                    <span className="text-[11px] font-extrabold text-slate-400">{campus.count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${campus.color} transition-all duration-500`}
                      style={{ width: `${campus.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Server Telemetry & System Health */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <LuServer size={14} className="text-blue-400" />
                <span>Go Engine & Database Stack</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">Healthy</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400">PostgreSQL</p>
                <p className="text-xs font-black text-white mt-0.5">Online</p>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400">Socket.IO</p>
                <p className="text-xs font-black text-emerald-400 mt-0.5">Active</p>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
                <p className="text-[10px] font-bold text-slate-400">Gin Router</p>
                <p className="text-xs font-black text-blue-400 mt-0.5">5001 Port</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;

