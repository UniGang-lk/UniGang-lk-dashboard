import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LuMenu,
  LuLayoutDashboard, LuUsers, LuClipboardList,
  LuGraduationCap, LuMegaphone, LuChartBar,
  LuMonitor, LuCalendarDays, LuMessageCircle, LuPhone, LuPlus,
  LuSparkles, LuShoppingBag, LuHeartHandshake, LuCircleHelp, LuSun, LuShieldAlert
} from 'react-icons/lu';
import AdminSidebar from './AdminSidebar';
import { NotificationDropdown } from '../ui/NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { fetchStats } from '../../api/api';
import { subscribeToOnlineStats, type LiveOnlineStats } from '../../api/realtime';

const pageTitles: Record<string, { label: string; icon: React.ElementType }> = {
  '/admin/dashboard':                 { label: 'Dashboard Overview', icon: LuLayoutDashboard },
  '/admin/users':                     { label: 'User Management', icon: LuUsers },
  '/admin/annexes':                   { label: 'Annex Management', icon: LuClipboardList },
  '/admin/reviews':                   { label: 'Review Moderation', icon: LuMessageCircle },
  '/admin/services':                  { label: 'Service Requests', icon: LuMonitor },
  '/admin/events':                    { label: 'Campus Events', icon: LuCalendarDays },
  '/admin/blogs':                     { label: 'Campus Blogs', icon: LuMessageCircle },
  '/admin/contacts':                  { label: 'Contact Inquiries', icon: LuPhone },
  '/admin/notifications':             { label: 'Broadcast Notifications', icon: LuMegaphone },
  '/admin/settings/universities':     { label: 'University Registry', icon: LuGraduationCap },
  '/admin/settings/analytics':        { label: 'System Analytics', icon: LuChartBar },
  '/admin/advertisements':            { label: 'Advertisements', icon: LuSparkles },
  '/admin/marketplace':               { label: 'Hustle Hub Marketplace', icon: LuShoppingBag },
  '/admin/proposals':                 { label: 'Matchmaking Proposals', icon: LuHeartHandshake },
  '/admin/proposals/security-alerts': { label: 'Security & Anti-Leak Alerts', icon: LuShieldAlert },
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onlineStats, setOnlineStats] = useState<LiveOnlineStats>({
    activeVisitors: 0,
    registeredUsers: 0,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    let isMounted = true;

    let lastSignificantTime = Date.now();
    let smoothedVisitors = 0;
    let smoothedRegistered = 0;

    const applyStatsUpdate = (rawVisitors: number, rawRegistered: number) => {
      if (!isMounted) return;
      const now = Date.now();

      // If active visitors reported is higher, immediately take the higher value
      if (rawVisitors >= smoothedVisitors) {
        smoothedVisitors = rawVisitors;
        smoothedRegistered = rawRegistered;
        lastSignificantTime = now;
      } else {
        // If reported count is lower (e.g., hitting a newly spun up Lambda container or transient disconnect),
        // hold the active count for 12 seconds before decaying down to prevent flickering/jitter.
        if (now - lastSignificantTime > 12000) {
          smoothedVisitors = rawVisitors;
          smoothedRegistered = rawRegistered;
          lastSignificantTime = now;
        }
      }

      setOnlineStats({
        activeVisitors: smoothedVisitors,
        registeredUsers: smoothedRegistered,
      });
    };

    const syncTelemetry = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}/api/stats/telemetry`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            applyStatsUpdate(Number(data.activeVisitors ?? 0), Number(data.registeredOnline ?? 0));
            return;
          }
        }
      } catch {
        // Fallback to fetchStats if needed
      }

      // Fallback
      fetchStats()
        .then((data) => {
          if (data) {
            applyStatsUpdate(Number(data.activeVisitors ?? 0), Number(data.registeredOnline ?? 0));
          }
        })
        .catch(() => {});
    };

    // Initial fetch
    syncTelemetry();

    // Auto-pulse telemetry poll every 6 seconds
    const pollTimer = setInterval(syncTelemetry, 6000);

    // Also subscribe to live WebSockets telemetry instant push
    const unsubscribe = subscribeToOnlineStats((stats) => {
      if (stats) {
        applyStatsUpdate(Number(stats.activeVisitors ?? 0), Number(stats.registeredUsers ?? 0));
      }
    });

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
      unsubscribe();
    };
  }, []);

  const current = pageTitles[location.pathname] || { label: 'Admin Portal', icon: LuLayoutDashboard };
  const PageIcon = current.icon;
  const initial = (currentUser?.displayName || currentUser?.email || 'Admin').charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      {/* Responsive Left Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* 🌟 Sigma-Style Clean White Top Header 🌟 */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-18 bg-white border-b border-slate-200/90 shadow-2xs">
          {/* Left: Mobile Hamburger & Page Title with Blue Icon Badge */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger Button (Mobile / Tablet) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open Navigation Menu"
            >
              <LuMenu className="text-xl" />
            </button>

            {/* Page Icon in Vibrant Blue Rounded Square */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <PageIcon className="text-base sm:text-lg" />
            </div>

            {/* Page Title */}
            <motion.h1
              key={location.pathname}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate"
            >
              {current.label}
            </motion.h1>
          </div>

          {/* Right: Real-time Live Visitors, Quick Action Button, Help, Theme, Notification, Avatar */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* 🟢 Live Real-Time Online Visitors Pulse Badge 🟢 */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 shadow-2xs cursor-default select-none transition-all hover:bg-emerald-100/70"
              title={`Real-Time Telemetry: ${onlineStats.activeVisitors} active browser sessions (${onlineStats.registeredUsers} authenticated students)`}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-xs"></span>
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold tracking-tight">
                <span className="text-slate-900 font-extrabold text-xs">{onlineStats.activeVisitors}</span>
                <span className="text-emerald-700 font-semibold hidden sm:inline">Live Online</span>
                <span className="text-emerald-700 font-semibold sm:hidden">Live</span>
              </span>
              {onlineStats.registeredUsers > 0 && (
                <span className="hidden md:inline-flex items-center px-1.5 py-0.2 text-[10px] font-bold rounded-md bg-emerald-600 text-white">
                  {onlineStats.registeredUsers} auth
                </span>
              )}
            </div>

            {/* Quick Create Action Button (Sigma style solid blue button) */}
            <button
              onClick={() => {
                if (location.pathname.includes('annexes')) {
                  // navigate or trigger add
                } else if (location.pathname.includes('events')) {
                  navigate('/admin/events');
                } else {
                  navigate('/admin/annexes');
                }
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <LuPlus className="text-base" />
              <span>Quick Create</span>
            </button>

            {/* Help Icon Button */}
            <button
              className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer hidden md:inline-flex"
              title="Help & Support"
            >
              <LuCircleHelp className="text-lg" />
            </button>

            {/* Light / Theme Icon */}
            <button
              className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer hidden sm:inline-flex"
              title="Display Theme"
            >
              <LuSun className="text-lg" />
            </button>

            {/* Notifications Dropdown with Red Badge */}
            <NotificationDropdown />

            {/* Admin Avatar */}
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs ring-2 ring-slate-100 cursor-pointer"
              title={currentUser?.email || 'Administrator'}
            >
              {initial}
            </div>
          </div>
        </header>

        {/* 🌟 Main Content View 🌟 */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto w-full space-y-6"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
