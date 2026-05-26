import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        {/* Sleek rotating gradient spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          <div className="absolute inset-0 rounded-full border-4 border-slate-800 opacity-20"></div>
        </div>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">
          Verifying security authorization...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login page and keep the current route in state so we can return after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
