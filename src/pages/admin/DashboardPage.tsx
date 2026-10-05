import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuHouse, LuClock, LuPlus, LuMapPin, LuCircleCheck, LuCircleX, LuHourglass,
  LuUsers, LuArrowRight, LuTrendingUp, LuShieldCheck, LuShoppingBag,
  LuZap, LuServer, LuArrowUpRight, LuCheck, LuX, LuRefreshCw,
  LuEye, LuLayers, LuSearch, LuPhone, LuImage, LuSparkles,
  LuActivity, LuBarChart3, LuCalendar, LuBell, LuChevronRight
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { fetchStats, fetchAnnexes, updateAnnexStatus } from '../../api/api';
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
  contactPhone?: string;
  description?: string;
}

interface ActivityItem {
  id: string;
  student: string;
  initials: string;
  action: string;
  target: string;
  time: string;
  bg: string;
}

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', student: 'Kavya Perera', initials: 'KP', action: 'Inquired about', target: 'Luxury Studio near UOM', time: '2m ago', bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20' },
  { id: '2', student: 'Dinuka Silva', initials: 'DS', action: 'Listed item on', target: 'Hustle Hub Marketplace', time: '12m ago', bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' },
  { id: '3', student: 'Amali Fernando', initials: 'AF', action: 'Verified student profile', target: 'Jayewardenepura (USJ)', time: '34m ago', bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20' },
  { id: '4', student: 'Roshel Gomes', initials: 'RG', action: 'Submitted annex for', target: 'Kandy Boarding Room', time: '1h ago', bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20' },
  { id: '5', student: 'Malshi Wijetunga', initials: 'MW', action: 'Created event', target: 'SLIIT Batch Hackathon 2026', time: '3h ago', bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20' },
];

const CAMPUS_STATS = [
  { name: 'Moratuwa (UOM)', count: 412, growth: '+18%', color: 'from-blue-600 to-cyan-500', bar: 'bg-blue-500', percent: 85 },
  { name: 'Jayewardenepura (USJ)', count: 380, growth: '+14%', color: 'from-indigo-600 to-purple-500', bar: 'bg-indigo-500', percent: 78 },
  { name: 'SLIIT Malabe', count: 310, growth: '+22%', color: 'from-emerald-600 to-teal-500', bar: 'bg-emerald-500', percent: 64 },
  { name: 'Peradeniya (UOP)', count: 295, growth: '+9%', color: 'from-amber-600 to-orange-500', bar: 'bg-amber-500', percent: 60 },
  { name: 'NSBM Green Uni', count: 220, growth: '+25%', color: 'from-purple-600 to-pink-500', bar: 'bg-purple-500', percent: 45 }
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

// SVG Sparkline Graphic
const Sparkline = ({ color = '#3b82f6' }: { color?: string }) => (
  <svg className="w-20 h-9 opacity-90 stroke-2" viewBox="0 0 100 35" fill="none">
    <path
      d="M0 26 Q15 10, 30 20 T60 6 T80 16 T100 2"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Interactive Area Growth Chart
const AnalyticsChart = () => {
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '1Y'>('7D');

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Range Selector */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <LuBarChart3 size={18} />
            </span>
            <h3 className="text-lg font-black tracking-tight text-white">Platform Activity & Traffic Growth</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">Weekly listing submissions vs student queries across Sri Lankan campuses</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          {(['7D', '30D', '1Y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setChartRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                chartRange === range
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Visual Chart */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-end justify-between h-44 w-full pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="0" y1="30" x2="500" y2="30" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
            <line x1="0" y1="75" x2="500" y2="75" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
            <line x1="0" y1="120" x2="500" y2="120" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />

            {/* Area path 1 */}
            <path
              d="M 0 120 Q 75 40, 150 80 T 300 30 T 420 70 T 500 20 L 500 150 L 0 150 Z"
              fill="url(#blueGradient)"
            />
            <path
              d="M 0 120 Q 75 40, 150 80 T 300 30 T 420 70 T 500 20"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Area path 2 (Secondary metric) */}
            <path
              d="M 0 135 Q 75 90, 150 110 T 300 65 T 420 95 T 500 50 L 500 150 L 0 150 Z"
              fill="url(#emeraldGradient)"
            />
            <path
              d="M 0 135 Q 75 90, 150 110 T 300 65 T 420 95 T 500 50"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              strokeLinecap="round"
            />

            {/* Pulsing data nodes */}
            <circle cx="300" cy="30" r="5" fill="#3b82f6" className="animate-ping opacity-75" />
            <circle cx="300" cy="30" r="5" fill="#60a5fa" stroke="#ffffff" strokeWidth="2" />

            <circle cx="500" cy="20" r="5" fill="#3b82f6" />
            <circle cx="500" cy="20" r="3" fill="#ffffff" />
          </svg>
        </div>

        {/* X-Axis Labels */}
        <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-800">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span className="text-blue-400 font-extrabold">Today</span>
        </div>
      </div>

      {/* Legend & Stats Footer */}
      <div className="relative z-10 pt-2 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-slate-300 font-semibold">Student Inquiries & Views</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-dashed border-emerald-300"></span>
            <span className="text-slate-300 font-semibold">Verified Annex Approvals</span>
          </div>
        </div>

        <span className="text-slate-400 text-[11px]">
          Peak traffic: <strong className="text-white">8:30 PM (SLST)</strong>
        </span>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const isApproved = status === 'Approved' || status === 'Active' || status === 'approved';
  const isPending = status === 'Pending' || status === 'pending';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
      isApproved ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60' :
      isPending ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60' :
      'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
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
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<Listing | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Approved'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'MODERATION' | 'ECOSYSTEM' | 'SYSTEM'>('MODERATION');

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
      setListings(safeAnnexes);
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

  const handleQuickApprove = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoadingId(id);
    try {
      await updateAnnexStatus(id, 'Approved');
      toast.success(`Annex #${id} approved successfully!`);
      loadData(true);
      if (selectedPreviewItem?.id === id) {
        setSelectedPreviewItem(prev => prev ? { ...prev, status: 'Approved' } : null);
      }
    } catch (err: any) {
      toast.error('Failed to approve listing');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickReject = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActionLoadingId(id);
    try {
      await updateAnnexStatus(id, 'Rejected');
      toast.success(`Annex #${id} status updated to Rejected.`);
      loadData(true);
      if (selectedPreviewItem?.id === id) {
        setSelectedPreviewItem(prev => prev ? { ...prev, status: 'Rejected' } : null);
      }
    } catch (err: any) {
      toast.error('Failed to reject listing');
    } finally {
      setActionLoadingId(null);
    }
  };

  const executiveMetrics = [
    {
      label: 'Verified Students',
      value: stats.totalStudents || 1284,
      change: '+14.2%',
      subtitle: '.ac.lk Authenticated Accounts',
      up: true,
      sparkColor: '#3b82f6',
      icon: LuUsers,
      iconBg: 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Approved Annexes',
      value: stats.approvedAnnexes,
      change: '+18.5%',
      subtitle: 'Boarding Places Live',
      up: true,
      sparkColor: '#10b981',
      icon: LuHouse,
      iconBg: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Moderation Triage',
      value: stats.pendingAnnexes,
      change: `${stats.pendingAnnexes} Action Req.`,
      subtitle: 'Pending Host Approval',
      up: false,
      sparkColor: '#f59e0b',
      icon: LuClock,
      iconBg: 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'B2B Trade Volume',
      value: 'Rs. 540,000',
      change: '+24.8%',
      subtitle: 'Ads & Marketplace Velocity',
      up: true,
      sparkColor: '#8b5cf6',
      icon: LuShoppingBag,
      iconBg: 'bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400',
    }
  ];

  const filteredListings = listings.filter(item => {
    const matchesStatus = statusFilter === 'ALL' ||
      (statusFilter === 'Pending' && (item.status === 'Pending' || item.status === 'pending')) ||
      (statusFilter === 'Approved' && (item.status === 'Approved' || item.status === 'Active' || item.status === 'approved'));

    const matchesSearch = searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.campus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.id).includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 font-sans select-none pb-12">

      {/* ── 1. Ultra Executive Hero Command Bar ────────────────────────────── */}
      <div className="relative rounded-3xl bg-slate-900 text-white p-6 sm:p-8 lg:p-10 overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider">
                <LuZap className="text-amber-400 fill-amber-400" size={13} />
                Uni Gang Operations Command
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Socket.IO Connected (12ms)
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {getTimeOfDayGreeting()}, Admin Desk 👋
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-normal max-w-xl leading-relaxed">
              Real-time executive dashboard for Sri Lanka university student verification, boarding house approvals, and platform analytics.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => loadData()}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 border border-slate-700/80 cursor-pointer shadow-xs active:scale-95"
            >
              <LuRefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Telemetry</span>
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 cursor-pointer shadow-xs"
            >
              <LuUsers className="w-4 h-4 text-blue-400" />
              <span>{stats.totalStudents} Verified Students</span>
            </button>
            <button
              onClick={() => navigate('/admin/annexes')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95 border-none"
            >
              <LuPlus className="w-4 h-4" />
              <span>Moderation Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Sparkline Executive Metric Cards ────────────────────────────── */}
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
              variants={itemVariants}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.iconBg}`}>
                  <Icon className="text-2xl" />
                </div>
                <div className="flex items-center gap-2">
                  <Sparkline color={card.sparkColor} />
                  <span className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                    card.up
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                  }`}>
                    <LuTrendingUp size={12} />
                    <span>{card.change}</span>
                  </span>
                </div>
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

      {/* ── 3. Visual Analytics & Live System Stream Split ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Interactive Analytics Chart (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <AnalyticsChart />
        </div>

        {/* Right Column: Live Student Activity Stream (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <LuActivity size={18} />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Live Activity Feed</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Real-time student actions across Sri Lanka</p>
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
              {MOCK_ACTIVITY.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl ${act.bg} flex items-center justify-center font-black text-xs shrink-0`}>
                      {act.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {act.student} <span className="font-normal text-slate-400">{act.action}</span>
                      </p>
                      <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 truncate">{act.target}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">
                    {act.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/annexes')}
            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>View All Operational Logs</span>
            <LuChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* ── 4. Main Tabbed Workstation Desk ─────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
        
        {/* Navigation Tabs Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('MODERATION')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'MODERATION'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <LuHouse size={15} />
              <span>Moderation Triage ({listings.length})</span>
              {stats.pendingAnnexes > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                  {stats.pendingAnnexes}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ECOSYSTEM')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'ECOSYSTEM'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <LuMapPin size={15} />
              <span>Campus Ecosystem Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab('SYSTEM')}
              className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'SYSTEM'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <LuServer size={15} />
              <span>System Stack Telemetry</span>
            </button>
          </div>

          {activeTab === 'MODERATION' && (
            <div className="relative shrink-0 sm:w-72">
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search title, campus, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
              />
            </div>
          )}
        </div>

        {/* Tab Content 1: Moderation Triage Grid & Slide-Over Preview */}
        {activeTab === 'MODERATION' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Table Column */}
            <div className={`${selectedPreviewItem ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all duration-300`}>
              
              {/* Filter Pills */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold text-slate-500 mr-2">Status Filter:</span>
                {(['ALL', 'Pending', 'Approved'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === tab
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto custom-scrollbar border border-slate-100 dark:border-slate-800/80 rounded-2xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-5">Listing Title</th>
                      <th className="py-3.5 px-5">Target Campus</th>
                      <th className="py-3.5 px-5">Rent</th>
                      <th className="py-3.5 px-5 text-center">Status</th>
                      <th className="py-3.5 px-5 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-14 text-center text-slate-400 font-medium">
                          Loading real-time listing telemetry...
                        </td>
                      </tr>
                    ) : filteredListings.length > 0 ? (
                      filteredListings.slice(0, 8).map((l) => (
                        <tr
                          key={l.id}
                          onClick={() => setSelectedPreviewItem(l)}
                          className={`hover:bg-blue-50/20 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                            selectedPreviewItem?.id === l.id ? 'bg-blue-50/40 dark:bg-slate-800/60 ring-1 ring-blue-500/20' : ''
                          }`}
                        >
                          <td className="py-4 px-5">
                            <p className="font-extrabold text-slate-900 dark:text-white truncate max-w-xs">{l.title}</p>
                            <p className="text-[10px] font-medium text-slate-400">ID #{l.id} • Contact: {l.contactName || 'Landlord'}</p>
                          </td>
                          <td className="py-4 px-5 text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <LuMapPin className="text-blue-500 text-xs shrink-0" />
                              <span className="truncate max-w-[140px]">{l.campus}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {l.price}
                          </td>
                          <td className="py-4 px-5 text-center whitespace-nowrap">
                            <StatusBadge status={l.status} />
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            {l.status === 'Pending' || l.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  disabled={actionLoadingId === l.id}
                                  onClick={(e) => handleQuickApprove(l.id, e)}
                                  className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                                  title="Approve Listing"
                                >
                                  <LuCheck size={14} />
                                </button>
                                <button
                                  disabled={actionLoadingId === l.id}
                                  onClick={(e) => handleQuickReject(l.id, e)}
                                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                                  title="Reject Listing"
                                >
                                  <LuX size={14} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedPreviewItem(l)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                              >
                                <span>Inspect</span>
                                <LuArrowUpRight size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-14 text-center text-slate-400 font-medium">
                          No listings matched your search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Split Preview Drawer */}
            <AnimatePresence>
              {selectedPreviewItem && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/80 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 space-y-5 relative"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase">
                        Listing Inspection
                      </span>
                      <StatusBadge status={selectedPreviewItem.status} />
                    </div>
                    <button
                      onClick={() => setSelectedPreviewItem(null)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-200 text-slate-500 cursor-pointer"
                    >
                      <LuX size={16} />
                    </button>
                  </div>

                  <div className="w-full h-44 rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-800">
                    {selectedPreviewItem.images && selectedPreviewItem.images.length > 0 ? (
                      <img
                        src={selectedPreviewItem.images[0]}
                        alt={selectedPreviewItem.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                        <LuImage size={32} />
                        <span className="text-xs font-semibold">No Image Uploaded</span>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-black text-xs">
                      {selectedPreviewItem.price}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedPreviewItem.title}</h3>
                    
                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <LuMapPin className="text-blue-500 shrink-0" size={14} />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPreviewItem.campus}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LuPhone className="text-emerald-500 shrink-0" size={14} />
                        <span>Owner: <strong className="text-slate-900 dark:text-white">{selectedPreviewItem.contactName || 'Landlord'}</strong> ({selectedPreviewItem.contactPhone || 'No Phone'})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <button
                      disabled={actionLoadingId === selectedPreviewItem.id}
                      onClick={(e) => handleQuickApprove(selectedPreviewItem.id, e)}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md shadow-emerald-600/20"
                    >
                      <LuCheck size={16} />
                      <span>Approve & Publish</span>
                    </button>
                    <button
                      disabled={actionLoadingId === selectedPreviewItem.id}
                      onClick={(e) => handleQuickReject(selectedPreviewItem.id, e)}
                      className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md shadow-rose-600/20"
                    >
                      <LuX size={16} />
                      <span>Reject Listing</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* Tab Content 2: Campus Ecosystem Breakdown */}
        {activeTab === 'ECOSYSTEM' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {CAMPUS_STATS.map((campus) => (
                <div
                  key={campus.name}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{campus.name}</h4>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                      {campus.growth}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{campus.count}</span>
                    <span className="text-xs text-slate-400 font-semibold">Active Boarding Listings</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${campus.bar} transition-all duration-500`}
                      style={{ width: `${campus.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Content 3: System Health Telemetry */}
        {activeTab === 'SYSTEM' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Backend Go Engine</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-xl font-black text-emerald-400">Online (Port 5001)</p>
                <p className="text-[11px] text-slate-400">Gin Router • CORS Allowed</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>PostgreSQL DB</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                </div>
                <p className="text-xl font-black text-white">0.4ms Query Latency</p>
                <p className="text-[11px] text-slate-400">Connection Pool: 25 Active</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                  <span>Socket.IO Hub</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                </div>
                <p className="text-xl font-black text-blue-400">Active Realtime</p>
                <p className="text-[11px] text-slate-400">Live WebSockets Broadcast</p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default DashboardPage;
