import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, LuStar, LuUser, LuMail,
  LuTrash2, LuCircleCheck, LuCalendar
} from 'react-icons/lu';

// Mock Data for Feedbacks
const DUMMY_FEEDBACKS = [
  {
    id: 1,
    name: 'Amara Perera',
    role: 'Club President, UOM',
    comment: 'The Uni Gang designed our club\'s website perfectly! The campus events display is a game changer.',
    rating: 5,
    status: 'approved',
    createdAt: '2024-10-25T10:30:00Z'
  }
];

// Mock Data for Problems
const DUMMY_PROBLEMS = [
  {
    id: 1,
    name: 'Kasun Jayawardena',
    email: 'kasun@gmail.com',
    type: 'Report a Bug / Problem',
    message: 'The login page is not working on mobile devices. It gets stuck after entering credentials.',
    status: 'pending',
    createdAt: '2024-10-24T14:45:00Z'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const ContactsPage = () => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'problem'>('feedback');
  const [feedbacks, setFeedbacks] = useState(DUMMY_FEEDBACKS);
  const [problems, setProblems] = useState(DUMMY_PROBLEMS);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFeedbacks = feedbacks.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.comment.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProblems = problems.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.message.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDelete = (id: number, type: 'feedback' | 'problem') => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'feedback') setFeedbacks(feedbacks.filter(f => f.id !== id));
      else setProblems(problems.filter(p => p.id !== id));
    }
  };

  const handleStatusChange = (id: number, type: 'feedback' | 'problem', newStatus: string) => {
    if (type === 'feedback') setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: newStatus } : f));
    else setProblems(problems.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Contact Hub</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Feedback and Issue reports Management</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'feedback' 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
            : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Feedbacks
        </button>
        <button
          onClick={() => setActiveTab('problem')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'problem' 
            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
            : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Problem Reports
        </button>
      </div>

      {/* Filters */}
      <div className="relative w-full max-w-md">
        <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder={`Search ${activeTab === 'feedback' ? 'feedbacks' : 'problems'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <motion.div
        key={activeTab}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {activeTab === 'feedback' ? (
            filteredFeedbacks.map(fb => (
              <motion.div
                key={fb.id}
                variants={itemVariants}
                layout
                className="bg-white/5 border border-white/10 rounded-[2rem] p-6 relative group overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <LuStar key={i} size={14} className={i <= fb.rating ? 'text-amber-500' : 'text-slate-700'} fill={i <= fb.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(fb.id, 'feedback')}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-300 font-medium leading-relaxed italic mb-6">"{fb.comment}"</p>

                <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm">
                    {fb.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white uppercase tracking-widest truncate">{fb.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold truncate">{fb.role}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                   <button 
                    onClick={() => handleStatusChange(fb.id, 'feedback', fb.status === 'approved' ? 'pending' : 'approved')}
                    className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                      fb.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'
                    }`}
                  >
                    {fb.status === 'approved' ? <LuCircleCheck size={14}/> : <LuCalendar size={14}/>}
                    {fb.status}
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            filteredProblems.map(prob => (
              <motion.div
                key={prob.id}
                variants={itemVariants}
                layout
                className="bg-red-500/[0.03] border border-red-500/10 rounded-[2rem] p-6 relative group overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                    prob.status === 'resolved' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {prob.status}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                       onClick={() => handleDelete(prob.id, 'problem')}
                       className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-500/60 mb-1">{prob.type}</p>
                  <h3 className="text-sm font-black text-white leading-relaxed line-clamp-3">{prob.message}</h3>
                </div>

                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-400">
                    <LuUser size={14} className="text-red-500/40" />
                    <span className="text-[11px] font-bold">{prob.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <LuMail size={14} className="text-red-500/40" />
                    <span className="text-[11px] font-bold">{prob.email}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button 
                    onClick={() => handleStatusChange(prob.id, 'problem', prob.status === 'resolved' ? 'pending' : 'resolved')}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    {prob.status === 'resolved' ? 'Mark as Pending' : 'Mark as Resolved'}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {((activeTab === 'feedback' && filteredFeedbacks.length === 0) || (activeTab === 'problem' && filteredProblems.length === 0)) && (
        <div className="py-20 text-center border border-white/5 border-dashed rounded-[2.5rem]">
           <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No entries found</p>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;
