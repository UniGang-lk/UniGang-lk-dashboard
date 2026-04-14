import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LuMenu, LuBell, LuPlus,
  LuLayoutDashboard, LuUsers, LuClipboardList,
  LuGraduationCap, LuMegaphone, LuChartBar,
} from 'react-icons/lu';
import AdminSidebar from './AdminSidebar';

const pageTitles: Record<string, { label: string; icon: React.ElementType }> = {
  '/admin/dashboard':               { label: 'Dashboard', icon: LuLayoutDashboard },
  '/admin/users':                   { label: 'User Management', icon: LuUsers },
  '/admin/annexes':                 { label: 'Ads & Listings', icon: LuClipboardList },
  '/admin/settings/universities':   { label: 'Universities', icon: LuGraduationCap },
  '/admin/settings/announcements':  { label: 'Announcements', icon: LuMegaphone },
  '/admin/settings/analytics':      { label: 'Analytics', icon: LuChartBar },
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const current = pageTitles[location.pathname] ?? { label: 'Dashboard', icon: LuLayoutDashboard };
  const PageIcon = current.icon;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area — naturally pushes next to the sidebar on desktop */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">

        {/* ── Top Navigation Bar ────────────────────────────── */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 md:px-8 h-20
          bg-slate-950/60 backdrop-blur-2xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.1)]">

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center
              text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <LuMenu className="text-xl" />
          </button>

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl
              bg-blue-600/10 border border-blue-500/20 shadow-inner">
              <PageIcon className="text-blue-400 text-sm" />
            </div>
            <motion.h1
              key={location.pathname}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="text-sm font-extrabold text-white tracking-tight"
            >
              {current.label}
            </motion.h1>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Quick Action */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="hidden sm:flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-[12px] font-black
                bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white
                shadow-[0_8px_25px_-5px_rgba(59,130,246,0.5)] hover:shadow-[0_15px_30px_-5px_rgba(59,130,246,0.6)] 
                transition-all relative overflow-hidden group"
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              
              <div className="p-1 rounded-lg bg-white/20">
                <LuPlus className="text-sm" />
              </div>
              <span className="tracking-tight uppercase">Add New Listing</span>
            </motion.button>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center
              text-slate-400 hover:text-white hover:bg-white/10 transition-all">
              <LuBell className="text-lg" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-slate-950" />
            </button>

            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600
              flex items-center justify-center text-white text-xs font-bold cursor-pointer
              ring-2 ring-white/10 hover:ring-blue-500/40 transition-all">
              A
            </div>
          </div>
        </header>

        {/* ── Page Content ──────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
