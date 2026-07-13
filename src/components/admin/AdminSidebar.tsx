import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuUsers, LuClipboardList, LuGraduationCap,
  LuMegaphone, LuChartBar, LuLayoutDashboard,
  LuX, LuLogOut, LuChevronRight, LuCalendarDays,
  LuMonitor, LuMessageCircle, LuPhone, LuSparkles, LuShoppingBag
} from 'react-icons/lu';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  {
    section: 'Overview',
    items: [
      { label: 'Dashboard', icon: LuLayoutDashboard, path: '/admin/dashboard' },
      { label: 'Analytics', icon: LuChartBar, path: '/admin/settings/analytics' },
    ],
  },
  {
    section: 'Marketplace',
    items: [
      { label: 'Annexes', icon: LuClipboardList, path: '/admin/annexes' },
      { label: 'Reviews', icon: LuMessageCircle, path: '/admin/reviews' },
      { label: 'Services', icon: LuMonitor, path: '/admin/services' },
      { label: 'Advertisements', icon: LuSparkles, path: '/admin/advertisements' },
      { label: 'Hustle Hub', icon: LuShoppingBag, path: '/admin/marketplace' },
    ],
  },
  {
    section: 'Community',
    items: [
      { label: 'Events', icon: LuCalendarDays, path: '/admin/events' },
      { label: 'Blogs', icon: LuMessageCircle, path: '/admin/blogs' },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Contacts', icon: LuPhone, path: '/admin/contacts' },
      { label: 'Notifications', icon: LuMegaphone, path: '/admin/notifications' },
    ],
  },
  {
    section: 'System',
    items: [
      { label: 'Universities', icon: LuGraduationCap, path: '/admin/settings/universities' },
      { label: 'Users', icon: LuUsers, path: '/admin/users' },
    ],
  },
];

const itemThemes: Record<string, { color: string; bgActive: string; borderActive: string; textActive: string; iconActive: string; glow: string; indicator: string }> = {
  '/admin/dashboard': {
    color: 'blue',
    bgActive: 'bg-blue-600/10',
    borderActive: 'border-blue-500/60',
    textActive: 'text-white',
    iconActive: 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.35)]',
    indicator: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'
  },
  '/admin/settings/analytics': {
    color: 'blue',
    bgActive: 'bg-blue-600/10',
    borderActive: 'border-blue-500/60',
    textActive: 'text-white',
    iconActive: 'bg-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(59,130,246,0.35)]',
    indicator: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]'
  },
  '/admin/annexes': {
    color: 'indigo',
    bgActive: 'bg-indigo-600/10',
    borderActive: 'border-indigo-500/60',
    textActive: 'text-white',
    iconActive: 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(99,102,241,0.35)]',
    indicator: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]'
  },
  '/admin/reviews': {
    color: 'purple',
    bgActive: 'bg-purple-600/10',
    borderActive: 'border-purple-500/60',
    textActive: 'text-white',
    iconActive: 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.35)]',
    indicator: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
  },
  '/admin/services': {
    color: 'cyan',
    bgActive: 'bg-cyan-600/10',
    borderActive: 'border-cyan-500/60',
    textActive: 'text-white',
    iconActive: 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(6,182,212,0.35)]',
    indicator: 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
  },
  '/admin/advertisements': {
    color: 'pink',
    bgActive: 'bg-pink-600/10',
    borderActive: 'border-pink-500/60',
    textActive: 'text-white',
    iconActive: 'bg-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(236,72,153,0.35)]',
    indicator: 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.8)]'
  },
  '/admin/marketplace': {
    color: 'emerald',
    bgActive: 'bg-emerald-600/10',
    borderActive: 'border-emerald-500/60',
    textActive: 'text-white',
    iconActive: 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(16,185,129,0.35)]',
    indicator: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
  },
  '/admin/events': {
    color: 'amber',
    bgActive: 'bg-amber-600/10',
    borderActive: 'border-amber-500/60',
    textActive: 'text-white',
    iconActive: 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.35)]',
    indicator: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
  },
  '/admin/blogs': {
    color: 'purple',
    bgActive: 'bg-purple-600/10',
    borderActive: 'border-purple-500/60',
    textActive: 'text-white',
    iconActive: 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.35)]',
    indicator: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
  },
  '/admin/contacts': {
    color: 'rose',
    bgActive: 'bg-rose-600/10',
    borderActive: 'border-rose-500/60',
    textActive: 'text-white',
    iconActive: 'bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(244,63,94,0.35)]',
    indicator: 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
  },
  '/admin/notifications': {
    color: 'amber',
    bgActive: 'bg-amber-600/10',
    borderActive: 'border-amber-500/60',
    textActive: 'text-white',
    iconActive: 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(245,158,11,0.35)]',
    indicator: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]'
  },
  '/admin/settings/universities': {
    color: 'indigo',
    bgActive: 'bg-indigo-600/10',
    borderActive: 'border-indigo-500/60',
    textActive: 'text-white',
    iconActive: 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(99,102,241,0.35)]',
    indicator: 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]'
  },
  '/admin/users': {
    color: 'purple',
    bgActive: 'bg-purple-600/10',
    borderActive: 'border-purple-500/60',
    textActive: 'text-white',
    iconActive: 'bg-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
    glow: 'shadow-[0_0_20px_-5px_rgba(168,85,247,0.35)]',
    indicator: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.8)]'
  }
};

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  const adminName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';
  const adminEmail = currentUser?.email || 'admin@unigung.lk';
  const initial = adminName.charAt(0).toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-20 border-b border-white/[0.04] flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/20"
          >
            <LuLayoutDashboard className="text-white text-xl" />
          </motion.div>
          <div>
            <p className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase leading-none mb-1.5">The Uni Gang</p>
            <p className="text-[13px] font-black text-white tracking-[0.1em] uppercase leading-none">Admin Portal</p>
          </div>
        </div>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all font-bold uppercase tracking-wider"
        >
          <LuX className="text-lg" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500/60 px-4 mb-4">
              {group.section}
            </p>
            <ul className="space-y-2">
              {group.items.map((item) => {
                const active = isActive(item.path);
                const theme = itemThemes[item.path] || itemThemes['/admin/dashboard'];
                return (
                  <li key={item.path}>
                    <motion.button
                      whileHover={{ x: 6, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[22px] border text-[13px] font-black uppercase tracking-wider transition-all duration-300 group relative overflow-hidden
                        ${active
                          ? `${theme.bgActive} ${theme.borderActive} ${theme.textActive} ${theme.glow}`
                          : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12]'
                        }`}
                    >
                      {/* Hover Glass Effect */}
                      <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />

                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 rounded-r-full ${theme.indicator}`}
                        />
                      )}

                      <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${active ? theme.iconActive : 'bg-white/5 text-slate-500 group-hover:text-slate-200 group-hover:bg-white/10'}`}>
                        <item.icon className="text-lg" />
                      </div>

                      <span className="flex-1 text-left relative z-10 font-black tracking-wider leading-none uppercase">{item.label}</span>

                      {active && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="relative z-10"
                        >
                          <LuChevronRight className="text-sm text-white/80" />
                        </motion.div>
                      )}
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div 
          onClick={async () => {
            await logout();
            navigate('/login');
          }}
          className="flex items-center gap-3 px-3 py-3 rounded-full hover:bg-white/[0.05] transition-colors cursor-pointer group"
          title="Sign Out of Command Center"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate capitalize">{adminName}</p>
            <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
          </div>
          <LuLogOut className="text-slate-600 group-hover:text-red-400 transition-colors text-lg flex-shrink-0" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col flex-shrink-0 sticky top-0 h-screen z-40
        bg-slate-950 border-r border-white/[0.05] shadow-[1px_0_0_0_rgba(255,255,255,0.05)]">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay + Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                bg-slate-900/98 border-r border-slate-800 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
