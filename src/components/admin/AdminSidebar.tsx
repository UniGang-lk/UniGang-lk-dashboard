import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuUsers, LuClipboardList, LuGraduationCap,
  LuMegaphone, LuChartBar, LuLayoutDashboard,
  LuX, LuLogOut, LuChevronRight, LuCalendarDays,
  LuMonitor, LuMessageCircle, LuPhone, LuSparkles, LuShoppingBag, LuHeartHandshake,
  LuSettings, LuShieldAlert
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
      { label: 'Home', icon: LuLayoutDashboard, path: '/admin/dashboard' },
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
      { label: 'Campus Blogs', icon: LuMessageCircle, path: '/admin/blogs' },
    ],
  },
  {
    section: 'Matchmaking',
    items: [
      { label: 'Proposals', icon: LuHeartHandshake, path: '/admin/proposals', badge: 'VIP' },
      { label: 'Security Alerts', icon: LuShieldAlert, path: '/admin/proposals/security-alerts' },
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
      { label: 'Settings', icon: LuSettings, path: '/admin/settings/universities' },
    ],
  },
];

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && location.pathname === '/admin/dashboard') return true;
    if (path !== '/admin/dashboard' && location.pathname.startsWith(path)) return true;
    return location.pathname === path;
  };

  const adminName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Admin';
  const adminEmail = currentUser?.email || 'admin@unigang.lk';
  const initial = adminName.charAt(0).toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* 🌟 Sigma-Style Blue Gradient Brand Card 🌟 */}
      <div className="p-4 border-b border-slate-100 flex-shrink-0">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 p-4 text-white shadow-md shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-base shadow-inner text-white">
                UG
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight leading-none text-white">
                  The Uni Gang
                </span>
                <span className="text-[10px] font-bold text-blue-100 tracking-wider uppercase mt-1">
                  CAMPUS ADMIN PORTAL
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
              title="Close Sidebar"
            >
              <LuX className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* 🌟 Navigation Menu Items 🌟 */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {navItems.map((group) => (
          <div key={group.section} className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              {group.section}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.path);
                const ItemIcon = item.icon;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNav(item.path)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-150 cursor-pointer group
                        ${active
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
                        }`}
                    >
                      <ItemIcon className={`text-base flex-shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />

                      <span className="flex-1 text-left truncate">{item.label}</span>

                      {item.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          active 
                            ? 'bg-white/20 text-white' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}

                      {active && (
                        <LuChevronRight className="text-sm text-white/80" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* 🌟 Clean Light User Profile Footer 🌟 */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
              {initial}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate capitalize">
                {adminName}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {adminEmail}
              </span>
            </div>
          </div>

          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LuLogOut className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed 250px) */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 sticky top-0 h-screen z-40 bg-white border-r border-slate-200/90 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              key="drawer"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white border-r border-slate-200 shadow-2xl lg:hidden"
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
