import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LuHouse, LuMessageCircle, LuEye, LuClock,
  LuPlus,
  LuPencil, LuTrash2, LuChartBar,
  LuMapPin, LuCircleCheck, LuCircleX, LuHourglass,
  LuStar, LuUsers, LuArrowRight,
} from 'react-icons/lu';
import { fetchStats, fetchAnnexes } from '../../api/api';

/* ─────────────────────────────────────────────────────────── */
/* Types                                                       */
/* ─────────────────────────────────────────────────────────── */
interface StatCard {
  label: string;
  value: number | string;
  change: string;
  up: boolean;
  icon: React.ElementType;
  gradient: string;
  glow: string;
  iconBg: string;
}

interface Listing {
  id: string;
  title: string;
  campus: string;
  price: string;
  status: string;
  createdAt?: string;
  images?: string[];
  contactName?: string;
}

interface ActivityItem {
  id: string;
  student: string;
  initials: string;
  listing: string;
  time: string;
  color: string;
}

/* ─────────────────────────────────────────────────────────── */
/* Mock Activity data                                          */
/* ─────────────────────────────────────────────────────────── */
const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', student: 'Kavya Perera',   initials: 'KP', listing: 'Studio near UOM',     time: '2m ago',  color: 'from-blue-500 to-indigo-500'  },
  { id: '2', student: 'Dinuka Silva',   initials: 'DS', listing: 'Room in Kandy City',  time: '15m ago', color: 'from-teal-500 to-cyan-500'    },
  { id: '3', student: 'Amali Fernando', initials: 'AF', listing: 'Annex near SLIIT',    time: '1h ago',  color: 'from-purple-500 to-pink-500'  },
  { id: '4', student: 'Roshel Gomes',   initials: 'RG', listing: 'Furnished Single Room', time: '3h ago', color: 'from-amber-500 to-orange-500' },
  { id: '5', student: 'Malshi Wijetunga', initials: 'MW', listing: 'Luxury Studio Moratuwa', time: '5h ago', color: 'from-rose-500 to-red-500' },
];

/* ─────────────────────────────────────────────────────────── */
/* Animation variants                                         */
/* ─────────────────────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

/* ─────────────────────────────────────────────────────────── */
/* Status badge helper                                        */
/* ─────────────────────────────────────────────────────────── */
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { cls: string; icon: React.ElementType }> = {
    Approved: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: LuCircleCheck },
    Active:   { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: LuCircleCheck },
    Pending:  { cls: 'bg-amber-500/15  text-amber-400  border-amber-500/20',     icon: LuHourglass   },
    Rejected: { cls: 'bg-red-500/15    text-red-400    border-red-500/20',       icon: LuCircleX     },
    Expired:  { cls: 'bg-slate-500/20  text-slate-400  border-slate-500/20',     icon: LuClock       },
  };
  const cfg = map[status] ?? map['Pending'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.cls}`}>
      <Icon className="text-xs" />
      {status}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* Main Component                                             */
/* ─────────────────────────────────────────────────────────── */
const DashboardPage = () => {
  const [stats, setStats] = useState({ totalStudents: 0, approvedAnnexes: 0, pendingAnnexes: 0 });
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token') || '';
      try {
        const [statsData, annexData] = await Promise.all([
          fetchStats(token).catch(() => null),
          fetchAnnexes(token).catch(() => []),
        ]);
        if (statsData) setStats(statsData);
        setListings((annexData as Listing[]).slice(0, 6));
      } catch {
        // silently fall through to skeleton state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards: StatCard[] = [
    {
      label:   'Active Listings',
      value:   stats.approvedAnnexes,
      change:  '+12%',
      up:      true,
      icon:    LuHouse,
      gradient:'from-blue-600/20 to-indigo-600/10',
      glow:    'hover:shadow-[0_8px_40px_rgba(59,130,246,0.18)]',
      iconBg:  'bg-blue-500/20 text-blue-400',
    },
    {
      label:   'Total Inquiries',
      value:   '348',
      change:  '+28%',
      up:      true,
      icon:    LuMessageCircle,
      gradient:'from-teal-600/20 to-cyan-600/10',
      glow:    'hover:shadow-[0_8px_40px_rgba(20,184,166,0.18)]',
      iconBg:  'bg-teal-500/20 text-teal-400',
    },
    {
      label:   'Profile Views',
      value:   '1,204',
      change:  '+5%',
      up:      true,
      icon:    LuEye,
      gradient:'from-purple-600/20 to-pink-600/10',
      glow:    'hover:shadow-[0_8px_40px_rgba(139,92,246,0.18)]',
      iconBg:  'bg-purple-500/20 text-purple-400',
    },
    {
      label:   'Pending Approval',
      value:   stats.pendingAnnexes,
      change:  '-3',
      up:      false,
      icon:    LuClock,
      gradient:'from-amber-600/20 to-orange-600/10',
      glow:    'hover:shadow-[0_8px_40px_rgba(245,158,11,0.18)]',
      iconBg:  'bg-amber-500/20 text-amber-400',
    },
  ];

  return (
    <div className="space-y-8">

      {/* ── Welcome Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2rem] p-6 md:p-8
        bg-slate-900/60 border border-slate-800 shadow-2xl">
        {/* Subtle Decorative glow blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <LuStar className="text-blue-400 text-[10px] fill-blue-400/20" />
              </div>
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-blue-400/70">Admin Workspace</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Good morning, Admin 👋
            </h2>
            <p className="text-sm font-medium text-slate-400 mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              whileTap={{ scale: 0.98 }}
              className="group flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-tight
                bg-white/5 text-slate-300 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md"
            >
              <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                <LuUsers className="text-base" />
              </div>
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">{stats.totalStudents} Users</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[13px] font-black uppercase tracking-tight
                bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-600/30 
                hover:shadow-blue-600/50 transition-all border border-blue-400/30"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <div className="p-1.5 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
                <LuPlus className="text-base" />
              </div>
              <span className="relative z-10">New Listing</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -4, backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
              className="relative overflow-hidden rounded-[1.5rem] p-6 cursor-default
                bg-slate-900/40 backdrop-blur-md border border-slate-800
                shadow-xl transition-all duration-300"
            >
              {/* Subtle Icon Glow */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${card.iconBg} border border-white/5 shadow-lg`}>
                <Icon className="text-xl" />
              </div>
              {/* Value */}
              <div className="flex items-end justify-between">
                <div>
                  {loading ? (
                    <div className="h-9 w-20 bg-white/5 rounded-lg animate-pulse mb-1" />
                  ) : (
                    <p className="text-3xl font-black text-white tracking-tighter leading-none">{card.value}</p>
                  )}
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mt-3">{card.label}</p>
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-xl border
                  ${card.up 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                  }`}
                >
                  {card.up ? '↑' : '↓'} {card.change}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Bottom Row: Listings + Activity ────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Listings Management (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-black text-white tracking-tight uppercase underline decoration-blue-500/30 underline-offset-8">Recent Listings</h3>
            <button className="group flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-400 hover:bg-blue-500/5 border border-transparent hover:border-blue-500/20 transition-all">
              View All <LuArrowRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
              ))
            ) : listings.length === 0 ? (
              /* Empty State */
              <motion.div
                variants={cardVariants}
                className="flex flex-col items-center justify-center py-16 rounded-[2rem]
                  bg-slate-900/40 border border-slate-800 border-dashed"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
                  <LuHouse className="text-3xl text-slate-600" />
                </div>
                <p className="text-sm font-bold text-slate-500">No listings yet</p>
                <p className="text-xs text-slate-600 mt-1">Add your first listing to get started</p>
              </motion.div>
            ) : (
              listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  variants={cardVariants}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="flex items-center gap-4 p-4 rounded-2xl cursor-default
                    bg-slate-900/40 border border-slate-800
                    hover:bg-slate-900/60 hover:border-blue-500/20
                    shadow-[0_2px_12px_rgba(0,0,0,0.2)]
                    transition-all duration-200"
                >
                  {/* Thumbnail / Placeholder */}
                  <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-slate-800/80">
                    {listing.images && listing.images[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LuHouse className="text-slate-600 text-xl" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{listing.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <LuMapPin className="text-slate-500 text-xs flex-shrink-0" />
                      <p className="text-xs text-slate-400 truncate">{listing.campus}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:block flex-shrink-0 text-right">
                    <p className="text-sm font-black text-blue-400">{listing.price}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">/month</p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    <StatusBadge status={listing.status} />
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      title="Analytics"
                      className="w-9 h-9 rounded-xl flex items-center justify-center
                        bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/10 hover:border-blue-500/30 transition-all"
                    >
                      <LuChartBar className="text-sm" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      title="Edit"
                      className="w-9 h-9 rounded-xl flex items-center justify-center
                        bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-white/5 hover:border-white/10 transition-all"
                    >
                      <LuPencil className="text-sm" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      title="Delete"
                      className="w-9 h-9 rounded-xl flex items-center justify-center
                        bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 transition-all"
                    >
                      <LuTrash2 className="text-sm" />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>

        {/* Activity Feed (1/3 width) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-black text-white tracking-tight uppercase underline decoration-indigo-500/30 underline-offset-8">Recent Activity</h3>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">
                Live Feed
              </span>
            </div>
          </div>

          <div className="rounded-[2rem] overflow-hidden bg-slate-900/40 border border-slate-800
            shadow-xl backdrop-blur-md">
            <div className="px-6 py-4 border-b border-white/[0.04]">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">Latest Inquiries</p>
            </div>
            <motion.ul
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-white/[0.04]"
            >
              {MOCK_ACTIVITY.map((item) => (
                <motion.li
                  key={item.id}
                  variants={cardVariants}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                  className="flex items-start gap-4 px-6 py-5 transition-colors group cursor-default"
                >
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.color}
                    flex items-center justify-center text-white text-[12px] font-black flex-shrink-0 mt-0.5 shadow-lg shadow-black/20 ring-1 ring-white/10`}>
                    {item.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">{item.student}</p>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      Inquired about <span className="text-slate-300 font-bold">{item.listing}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{item.time}</span>
                </motion.li>
              ))}
            </motion.ul>
            <div className="px-6 py-4 border-t border-white/[0.04]">
              <button className="w-full text-xs font-black text-blue-500 hover:text-blue-400 transition-all
                flex items-center justify-center gap-2 uppercase tracking-widest">
                View Full Log <LuArrowRight className="text-sm" />
              </button>
            </div>
          </div>

          {/* Weekly Momentum Mini Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="rounded-[2rem] p-7 bg-slate-900/40 backdrop-blur-md border border-slate-800
              shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
            <p className="text-[10px] font-black tracking-[0.25em] uppercase text-indigo-400 mb-6 underline decoration-indigo-500/30 underline-offset-8">Weekly Momentum</p>
            <div className="space-y-4">
              {[
                { label: 'New Students', value: '24', bar: 72 },
                { label: 'Ads Approved', value: '11', bar: 45 },
                { label: 'Inquiries',      value: '87', bar: 88 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{row.label}</span>
                    <span className="text-[11px] font-black text-white">{row.value}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.bar}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
