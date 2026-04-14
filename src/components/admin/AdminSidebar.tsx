import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuUsers, LuClipboardList, LuGraduationCap,
  LuMegaphone, LuChartBar, LuLayoutDashboard,
  LuX, LuLogOut, LuChevronRight,
} from 'react-icons/lu';

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
    section: 'Management',
    items: [
      { label: 'Users', icon: LuUsers, path: '/admin/users' },
      { label: 'Ads & Listings', icon: LuClipboardList, path: '/admin/annexes' },
    ],
  },
  {
    section: 'Configuration',
    items: [
      { label: 'Universities', icon: LuGraduationCap, path: '/admin/settings/universities' },
      { label: 'Announcements', icon: LuMegaphone, path: '/admin/settings/announcements' },
    ],
  },
];

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => location.pathname === path;

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
          className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
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
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <motion.button
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 group relative overflow-hidden
                        ${active
                          ? 'bg-blue-600/10 text-white shadow-[inset_0_0_20px_rgba(59,130,246,0.08)]'
                          : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      {/* Hover Glass Effect */}
                      <div className="absolute inset-0 bg-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-blue-500 rounded-r-full shadow-[4px_0_15px_rgba(59,130,246,0.6)]"
                        />
                      )}
                      
                      <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${active ? 'bg-blue-500/20 text-blue-400' : 'text-slate-500 group-hover:text-slate-300 group-hover:bg-white/5'}`}>
                        <item.icon className="text-lg flex-shrink-0" />
                      </div>
                      
                      <span className="flex-1 text-left relative z-10 font-bold tracking-tight">{item.label}</span>
                      
                      {active && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="relative z-10"
                        >
                          <LuChevronRight className="text-xs text-blue-500/80" />
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
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Admin Kaja</p>
            <p className="text-[10px] text-slate-500 truncate">admin@unigung.lk</p>
          </div>
          <LuLogOut className="text-slate-600 group-hover:text-red-400 transition-colors text-sm flex-shrink-0" />
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
