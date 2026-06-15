import React, { useState, useEffect, useRef } from 'react';
import { LuBell, LuCheck, LuInfo, LuFileText, LuCalendar, LuWrench, LuClipboardList } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Blog': return <LuFileText className="w-4 h-4 text-purple-400" />;
    case 'Event': return <LuCalendar className="w-4 h-4 text-emerald-400" />;
    case 'Service': return <LuWrench className="w-4 h-4 text-orange-400" />;
    case 'Annex': return <LuClipboardList className="w-4 h-4 text-rose-400" />;
    case 'System':
    default: return <LuInfo className="w-4 h-4 text-blue-400" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'Blog': return 'bg-purple-500/10 border-purple-500/20';
    case 'Event': return 'bg-emerald-500/10 border-emerald-500/20';
    case 'Service': return 'bg-orange-500/10 border-orange-500/20';
    case 'Annex': return 'bg-rose-500/10 border-rose-500/20';
    case 'System':
    default: return 'bg-blue-500/10 border-blue-500/20';
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifications = async () => {
    try {
      const data = await fetchMyNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Polled every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
    setIsOpen(false);
    if (notification.link) {
      // Prepend /admin if not already present
      const linkPath = notification.link.startsWith('/admin') ? notification.link : `/admin${notification.link.replace('/dashboard', '')}`;
      navigate(linkPath);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-slate-900/50 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm"
      >
        <LuBell className={`text-[1.1rem] ${unreadCount > 0 ? 'animate-pulse text-blue-400' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-3 h-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-slate-950"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(5px)' }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute right-0 mt-3 w-[22rem] sm:w-[25rem] bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-b border-white/[0.06]">
              <h3 className="text-[1.05rem] font-bold text-white flex items-center gap-2">
                Notifications 
                {unreadCount > 0 && (
                  <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full font-semibold border border-blue-500/30">
                    {unreadCount} New
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            {/* Body */}
            <div className="max-h-[26rem] overflow-y-auto custom-scrollbar p-2">
              {notifications.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-900 rounded-full flex items-center justify-center border border-white/5">
                    <LuBell className="w-7 h-7 text-slate-500" />
                  </div>
                  <p className="font-medium text-slate-300">All caught up!</p>
                  <p className="text-sm mt-1 text-slate-500">You have no new notifications.</p>
                </motion.div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-1"
                >
                  <AnimatePresence>
                    {notifications.map(notification => (
                      <motion.div 
                        variants={itemVariants}
                        layout
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 ease-out border overflow-hidden
                          ${!notification.isRead 
                            ? 'bg-slate-900/90 border-white/10 shadow-lg hover:shadow-xl' 
                            : 'bg-transparent border-transparent hover:bg-white/[0.03]'}`}
                      >
                        {/* Soft background glow for unread */}
                        {!notification.isRead && (
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.05] to-transparent pointer-events-none" />
                        )}

                        <div className="flex gap-4 relative">
                          {/* Icon Badge */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pr-8">
                            <p className={`text-[14px] leading-tight ${!notification.isRead ? 'font-semibold text-white' : 'font-medium text-slate-300'}`}>
                              {notification.title}
                            </p>
                            <p className="text-[13px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-2 font-semibold tracking-wider uppercase flex items-center gap-1.5">
                              {!notification.isRead && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full inline-block shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>}
                              {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {/* Action Button */}
                          {!notification.isRead && (
                            <button 
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-blue-400 hover:shadow-md hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                              title="Mark as read"
                            >
                              <LuCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-3 bg-black/40 border-t border-white/[0.06] text-center shadow-[inset_0_10px_20px_-10px_rgba(0,0,0,0.2)]">
              <span className="text-[11px] font-bold tracking-[0.2em] text-slate-600 uppercase">End of updates</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
