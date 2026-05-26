import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiAlertCircle, FiArrowRight, FiShield } from 'react-icons/fi';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Route they were trying to access, defaults to dashboard
  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Authenticate via Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('userToken', token);
      
      // Navigate to the originally requested route
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login Error:', err);
      // Friendly messages for common Firebase errors
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid admin credentials. Please verify your email and security key.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative Glowing Gradients in background */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full filter blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 rounded-[2rem] p-8 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          {/* Glowing Shield Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20"
          >
            <FiShield className="text-2xl text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase">
            Command Center
          </h2>
          <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">
            Admin Authentication Gate
          </p>
        </div>

        {/* Dynamic Alert Banner */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs font-semibold uppercase tracking-wider"
            >
              <FiAlertCircle className="text-lg flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <div className="relative group">
            <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-950/40 border border-slate-800 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-100 font-bold placeholder:text-slate-500"
              placeholder="Admin Email Address"
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-950/40 border border-slate-800 focus:border-blue-500 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-slate-100 font-bold placeholder:text-slate-500"
              placeholder="Security Key"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-extrabold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-blue-500/10 transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? 'Authorizing Security...' : 'Enter Console'}
            {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" />}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-[10px] uppercase tracking-widest font-bold border-t border-slate-800/60 pt-6">
          🔐 Encrypted connection established
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
