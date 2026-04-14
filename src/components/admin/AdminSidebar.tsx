import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuUsers, LuClipboardList, LuGraduationCap,
  LuMegaphone, LuBarChart2, LuLayoutDashboard,
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
      { label: 'Analytics', icon: LuBarChart2, path: '/admin/settings/analytics' },
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
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <LuLayoutDashboard className="text-white text-base" />
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.15em] text-slate-500 uppercase">The Uni Gang</p>
            <p className="text-sm font-bold text-white leading-tight">Admin Panel</p>
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
      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto custom-scrollbar">
        {navItems.map((group) => (
          <div key={group.section}>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 px-3 mb-2">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <motion.button
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group relative
                        ${active
                          ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full"
                        />
                      )}
                      <item.icon className={`text-lg flex-shrink-0 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {active && <LuChevronRight className="text-xs text-blue-500/60" />}
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
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-40
        bg-slate-900/80 backdrop-blur-xl border-r border-white/[0.06]">
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
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col
                bg-slate-900/95 backdrop-blur-xl border-r border-white/[0.08] lg:hidden"
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
