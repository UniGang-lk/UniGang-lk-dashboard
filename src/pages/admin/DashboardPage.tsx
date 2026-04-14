import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LuHome, LuMessageCircle, LuEye, LuClock,
  LuTrendingUp, LuTrendingDown, LuPlus,
  LuPencil, LuTrash2, LuBarChart2,
  LuMapPin, LuCheckCircle2, LuXCircle, LuHourglass,
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
    Approved: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: LuCheckCircle2 },
    Active:   { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: LuCheckCircle2 },
    Pending:  { cls: 'bg-amber-500/15  text-amber-400  border-amber-500/20',     icon: LuHourglass   },
    Rejected: { cls: 'bg-red-500/15    text-red-400    border-red-500/20',       icon: LuXCircle     },
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
      icon:    LuHome,
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
        bg-gradient-to-br from-blue-600/25 via-indigo-600/15 to-purple-600/10
        border border-blue-500/20 shadow-[0_8px_60px_rgba(59,130,246,0.12)]">
        {/* Decorative glow blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LuStar className="text-amber-400 text-sm fill-amber-400" />
              <span className="text-[11px] font-black tracking-[0.18em] uppercase text-blue-400">Admin Workspace</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Good morning, Admin 👋
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold
                bg-white/10 text-white border border-white/15 hover:bg-white/15 transition-all"
            >
              <LuUsers className="text-base" />
              {stats.totalStudents} Users
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold
                bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
            >
              <LuPlus className="text-base" />
              New Listing
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          const Trend = card.up ? LuTrendingUp : LuTrendingDown;
          return (
            <motion.div
              key={card.label}
              variants={cardVariants}
              whileHover={{ scale: 1.02, y: -3 }}
              className={`relative overflow-hidden rounded-[1.75rem] p-5 cursor-default
                bg-gradient-to-br ${card.gradient}
                border border-white/[0.07]
                shadow-[0_2px_20px_rgba(0,0,0,0.25)]
                transition-shadow duration-300 ${card.glow}`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.iconBg}`}>
                <Icon className="text-lg" />
              </div>
              {/* Value */}
              <div className="flex items-end justify-between">
                <div>
                  {loading ? (
                    <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse mb-1" />
                  ) : (
                    <p className="text-3xl font-black text-white tracking-tight">{card.value}</p>
                  )}
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{card.label}</p>
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full
                  ${card.up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  <Trend className="text-xs" />
                  {card.change}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Bottom Row: Listings + Activity ────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Listings Management (2/3 width) */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Listings</h3>
            <button className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
              View All <LuArrowRight className="text-sm" />
            </button>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-white/[0.04] border border-white/[0.06] animate-pulse" />
              ))
            ) : listings.length === 0 ? (
              /* Empty State */
              <motion.div
                variants={cardVariants}
                className="flex flex-col items-center justify-center py-16 rounded-[2rem]
                  bg-white/[0.03] border border-white/[0.06] border-dashed"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
                  <LuHome className="text-3xl text-slate-600" />
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
                    bg-white/[0.04] border border-white/[0.07]
                    hover:bg-white/[0.07] hover:border-blue-500/20
                    shadow-[0_2px_12px_rgba(0,0,0,0.2)]
                    transition-all duration-200"
                >
                  {/* Thumbnail / Placeholder */}
                  <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden bg-slate-800/80">
                    {listing.images && listing.images[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LuHome className="text-slate-600 text-xl" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{listing.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <LuMapPin className="text-slate-500 text-xs flex-shrink-0" />
                      <p className="text-xs text-slate-500 truncate">{listing.campus}</p>
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
                  <div className="flex-shrink-0 flex items-center gap-1.5">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      title="Analytics"
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 transition-all"
                    >
                      <LuBarChart2 className="text-sm" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      title="Edit"
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-white transition-all"
                    >
                      <LuPencil className="text-sm" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      title="Delete"
                      className="w-8 h-8 rounded-lg flex items-center justify-center
                        bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all"
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Activity</h3>
            <span className="text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-600/25 px-2.5 py-1 rounded-full">
              Live
            </span>
          </div>

          <div className="rounded-[2rem] overflow-hidden bg-white/[0.03] border border-white/[0.06]
            shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
            <div className="px-4 py-3 border-b border-white/[0.05]">
              <p className="text-[11px] font-black tracking-[0.15em] uppercase text-slate-600">Interested Clicks</p>
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
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${item.color}
                    flex items-center justify-center text-white text-[11px] font-black flex-shrink-0 mt-0.5`}>
                    {item.initials}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white leading-tight">{item.student}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-tight line-clamp-2">
                      Interested in <span className="text-slate-400">{item.listing}</span>
                    </p>
                  </div>
                  {/* Time */}
                  <span className="text-[10px] font-semibold text-slate-600 flex-shrink-0 mt-0.5">{item.time}</span>
                </motion.li>
              ))}
            </motion.ul>
            <div className="px-4 py-3 border-t border-white/[0.05]">
              <button className="w-full text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors
                flex items-center justify-center gap-1.5">
                View full activity log <LuArrowRight className="text-sm" />
              </button>
            </div>
          </div>

          {/* Quick Stats Mini Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="show"
            className="rounded-[2rem] p-5 bg-gradient-to-br from-indigo-600/15 to-purple-600/10
              border border-indigo-500/20 shadow-[0_4px_30px_rgba(99,102,241,0.08)]"
          >
            <p className="text-[11px] font-black tracking-[0.15em] uppercase text-indigo-400 mb-3">This Week</p>
            <div className="space-y-3">
              {[
                { label: 'New Registrations', value: '24', bar: 72 },
                { label: 'Ads Approved',      value: '11', bar: 45 },
                { label: 'Inquiries Made',    value: '87', bar: 88 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-slate-400">{row.label}</span>
                    <span className="text-xs font-bold text-white">{row.value}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.bar}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
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
