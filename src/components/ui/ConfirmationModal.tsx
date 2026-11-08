import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuCheck, LuX, LuTriangleAlert, LuTrash2, LuInfo } from 'react-icons/lu';

export type ConfirmVariant = 'approve' | 'reject' | 'delete' | 'warning' | 'info';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'approve',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'approve':
        return {
          icon: LuCheck,
          iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25',
          defaultTitle: 'Approve Listing',
        };
      case 'reject':
        return {
          icon: LuX,
          iconBg: 'bg-rose-50 text-rose-600 border border-rose-200',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25',
          defaultTitle: 'Reject Listing',
        };
      case 'delete':
        return {
          icon: LuTrash2,
          iconBg: 'bg-red-50 text-red-600 border border-red-200',
          btnBg: 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/25',
          defaultTitle: 'Delete Confirmation',
        };
      case 'warning':
        return {
          icon: LuTriangleAlert,
          iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25',
          defaultTitle: 'Action Warning',
        };
      case 'info':
      default:
        return {
          icon: LuInfo,
          iconBg: 'bg-blue-50 text-blue-600 border border-blue-200',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25',
          defaultTitle: 'Confirm Action',
        };
    }
  };

  const currentStyles = getVariantStyles();
  const IconComponent = currentStyles.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Deep Backdrop with Luxury Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onCancel}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 p-6 sm:p-7 overflow-hidden z-10"
        >
          {/* Subtle Top Accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

          <div className="flex items-start gap-4 mb-5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${currentStyles.iconBg}`}>
              <IconComponent className="text-2xl" />
            </div>
            <div className="flex-1 pt-0.5">
              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                {title || currentStyles.defaultTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-1">
                {message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${currentStyles.btnBg}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;

