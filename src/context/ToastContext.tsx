import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuCircleCheck, LuCircleX, LuTriangleAlert, LuInfo, LuX } from 'react-icons/lu';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message: string, duration?: number) => addToast('success', message, duration),
    error: (message: string, duration?: number) => addToast('error', message, duration),
    info: (message: string, duration?: number) => addToast('info', message, duration),
    warning: (message: string, duration?: number) => addToast('warning', message, duration),
  };

  const icons = {
    success: <LuCircleCheck className="w-5 h-5 text-emerald-400 animate-pulse" />,
    error: <LuCircleX className="w-5 h-5 text-rose-400 animate-bounce" />,
    info: <LuInfo className="w-5 h-5 text-blue-400" />,
    warning: <LuTriangleAlert className="w-5 h-5 text-amber-400" />,
  };

  const bgStyles = {
    success: 'bg-emerald-950/80 border-emerald-500/20 text-emerald-400 shadow-emerald-900/10',
    error: 'bg-rose-950/80 border-rose-500/20 text-rose-400 shadow-rose-900/10',
    info: 'bg-blue-950/80 border-blue-500/20 text-blue-400 shadow-blue-900/10',
    warning: 'bg-amber-950/80 border-amber-500/20 text-amber-400 shadow-amber-900/10',
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
              layout
              className={`p-4 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-start gap-3 pointer-events-auto ${bgStyles[t.type]}`}
            >
              <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
              <div className="flex-grow text-xs font-black uppercase tracking-wider leading-relaxed">{t.message}</div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-white transition-colors mt-0.5 cursor-pointer"
              >
                <LuX size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
