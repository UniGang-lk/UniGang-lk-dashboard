import React, { useState, useEffect, useRef } from 'react';
import { LuBell, LuCheck, LuInfo, LuFileText, LuCalendar, LuWrench, LuClipboardList, LuShoppingBag } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api/api';
import { useNavigate } from 'react-router-dom';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'Blog': return <LuFileText className="w-4 h-4 text-purple-600" />;
    case 'Event': return <LuCalendar className="w-4 h-4 text-emerald-600" />;
    case 'Service': return <LuWrench className="w-4 h-4 text-amber-600" />;
    case 'Annex': return <LuClipboardList className="w-4 h-4 text-rose-600" />;
    case 'Marketplace': return <LuShoppingBag className="w-4 h-4 text-indigo-600" />;
    case 'System':
    default: return <LuInfo className="w-4 h-4 text-blue-600" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'Blog': return 'bg-purple-50 border-purple-200';
    case 'Event': return 'bg-emerald-50 border-emerald-200';
    case 'Service': return 'bg-amber-50 border-amber-200';
    case 'Annex': return 'bg-rose-50 border-rose-200';
    case 'Marketplace': return 'bg-indigo-50 border-indigo-200';
    case 'System':
    default: return 'bg-blue-50 border-blue-200';
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
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
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
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
      const linkPath = notification.link.startsWith('/admin') ? notification.link : `/admin${notification.link.replace('/dashboard', '')}`;
      navigate(linkPath);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🌟 Bell Button with Solid Red Badge (Exact Reference Style) 🌟 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        title="Notifications"
      >
        <LuBell className={`text-lg ${unreadCount > 0 ? 'text-blue-600' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-black border-2 border-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3.5 flex items-center justify-between bg-slate-50/80 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                Notifications 
                {unreadCount > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} New
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            {/* Body */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar p-2">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <div className="w-12 h-12 mx-auto mb-2 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <LuBell className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-600">All caught up!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">You have no new notifications.</p>
                </div>
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
                        className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-150 border
                          ${!notification.isRead 
                            ? 'bg-blue-50/40 border-blue-100/80 hover:bg-blue-50/80' 
                            : 'bg-white border-transparent hover:bg-slate-50'}`}
                      >
                        <div className="flex gap-3 relative">
                          <div className="flex-shrink-0 mt-0.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 pr-6">
                            <p className={`text-xs leading-snug ${!notification.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {notification.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              {!notification.isRead && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full inline-block"></span>}
                              {new Date(notification.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          {!notification.isRead && (
                            <button 
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="absolute right-0 top-2 p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100 shadow-2xs"
                              title="Mark as read"
                            >
                              <LuCheck className="w-3.5 h-3.5" />
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
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                The Uni Gang Notifications
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
