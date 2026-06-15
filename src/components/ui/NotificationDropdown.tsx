import React, { useState, useEffect, useRef } from 'react';
import { LuBell, LuCheck } from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchMyNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../api/api';
import { useNavigate } from 'react-router-dom';

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
    const interval = setInterval(loadNotifications, 60000); // Poll every minute
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
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none"
      >
        <LuBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full border border-slate-950 flex items-center justify-center">
            <span className="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></span>
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-xl border border-white/[0.06] rounded-2xl shadow-2xl overflow-hidden z-50 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          >
            <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
              <h3 className="text-sm font-semibold text-white tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors tracking-wide"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <LuBell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm tracking-wide">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.03]">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-white/[0.03] cursor-pointer transition-colors relative group ${!notification.isRead ? 'bg-blue-500/[0.03]' : ''}`}
                    >
                      {!notification.isRead && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      )}
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className={`text-sm tracking-tight ${!notification.isRead ? 'text-white font-medium' : 'text-slate-300'}`}>
                            {notification.title}
                          </p>
                          <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-slate-600 mt-2 font-semibold tracking-wider uppercase">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <button 
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
                            title="Mark as read"
                          >
                            <LuCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 border-t border-white/[0.06] bg-black/40 text-center">
              <span className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">End of notifications</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
