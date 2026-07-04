import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, LuStar, LuUser, LuMail,
  LuTrash2, LuPencil, LuVolume2, LuVolumeX, 
  LuX, LuMessageSquare, LuInfo, LuCheck, LuArrowRight
} from 'react-icons/lu';
import { 
  fetchAdminFeedbacks, 
  updateAdminFeedback, 
  deleteAdminFeedback, 
  fetchAdminProblems, 
  replyToAdminProblem, 
  deleteAdminProblem 
} from '../../api/api';
import { useToast } from '../../context/ToastContext';

interface Feedback {
  id: string;
  name: string;
  institution: string | null;
  avatar: string | null;
  comment: string;
  rating: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  updatedAt: string;
}

interface SupportProblem {
  id: string;
  userId: string;
  name: string;
  email: string;
  inquiryType: string;
  message: string;
  adminReply: string | null;
  repliedAt: string | null;
  status: 'Pending' | 'Resolved';
  createdAt: string;
  updatedAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } }
};

const ContactsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'feedback' | 'problem'>('feedback');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [problems, setProblems] = useState<SupportProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<SupportProblem | null>(null);
  
  // Modal Form Inputs
  const [editName, setEditName] = useState('');
  const [editInstitution, setEditInstitution] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editStatus, setEditStatus] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feedbacksData, problemsData] = await Promise.all([
        fetchAdminFeedbacks(),
        fetchAdminProblems()
      ]);
      setFeedbacks(feedbacksData);
      setProblems(problemsData);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load contact logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Clean speech on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingSpeech) {
        window.speechSynthesis.cancel();
        setIsPlayingSpeech(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlayingSpeech(false);
        utterance.onerror = () => setIsPlayingSpeech(false);
        setIsPlayingSpeech(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      toast.error("Text-to-speech is not supported in this browser.");
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (f.institution && f.institution.toLowerCase().includes(searchTerm.toLowerCase())) ||
    f.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredProblems = problems.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.inquiryType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Feedback handlers ---
  const handleOpenEditFeedback = (fb: Feedback) => {
    setSelectedFeedback(fb);
    setEditName(fb.name);
    setEditInstitution(fb.institution || '');
    setEditComment(fb.comment);
    setEditRating(fb.rating);
    setEditStatus(fb.status);
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    try {
      setIsSubmitting(true);
      await updateAdminFeedback(selectedFeedback.id, {
        name: editName,
        institution: editInstitution || null,
        comment: editComment,
        rating: editRating,
        status: editStatus
      });
      toast.success('Feedback successfully updated & processed');
      setSelectedFeedback(null);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this client feedback?')) return;
    try {
      await deleteAdminFeedback(id);
      toast.success('Feedback deleted successfully');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete feedback');
    }
  };

  const handleQuickApproveFeedback = async (fb: Feedback) => {
    try {
      await updateAdminFeedback(fb.id, { status: 'Approved' });
      toast.success('Feedback approved & published to website!');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve feedback');
    }
  };

  // --- Support Problem handlers ---
  const handleOpenReplyProblem = (prob: SupportProblem) => {
    setSelectedProblem(prob);
    setReplyText(prob.adminReply || '');
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem || !replyText.trim()) return;
    try {
      setIsSubmitting(true);
      await replyToAdminProblem(selectedProblem.id, replyText.trim());
      toast.success('Reply submitted & user notified!');
      setSelectedProblem(null);
      setReplyText('');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reply to ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this support ticket?')) return;
    try {
      await deleteAdminProblem(id);
      toast.success('Support ticket deleted successfully');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete support ticket');
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-20">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">Support & Feedback Hub</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Review testimonials, approve clients feedback, and reply to user tickets</p>
        </div>
      </div>

      {/* Premium Glassmorphic Tab Grid Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tab 1: Client Feedbacks */}
        <div
          onClick={() => { setActiveTab('feedback'); setSearchTerm(''); }}
          className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
            activeTab === 'feedback'
              ? 'bg-rose-600/10 border-rose-500/60 shadow-[0_0_25px_-5px_rgba(244,63,94,0.3)]'
              : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'feedback' ? 'bg-rose-500/25 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-white/5 text-slate-400'
            }`}>
              <LuMessageSquare className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm tracking-tight">Client Feedbacks ({feedbacks.length})</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Review student testimonials and ratings</p>
            </div>
          </div>
          {activeTab === 'feedback' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-rose-500 rounded-t-full shadow-[0_-2px_10px_rgba(244,63,94,0.8)]"></div>
          )}
        </div>

        {/* Tab 2: Support Tickets */}
        <div
          onClick={() => { setActiveTab('problem'); setSearchTerm(''); }}
          className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
            activeTab === 'problem'
              ? 'bg-blue-600/10 border-blue-500/60 shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)]'
              : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'problem' ? 'bg-blue-500/25 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-slate-400'
            }`}>
              <LuInfo className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm tracking-tight">Problem Reports ({problems.length})</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Manage support tickets and admin replies</p>
            </div>
          </div>
          {activeTab === 'problem' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.8)]"></div>
          )}
        </div>
      </div>

      {/* Search Filter row */}
      <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-3xl p-4">
        <div className="relative w-full md:max-w-md">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'feedback' ? 'client testimonials' : 'problem tickets'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-white/5 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-500">Synchronizing contact databases...</span>
        </div>
      ) : (
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {activeTab === 'feedback' ? (
              filteredFeedbacks.length === 0 ? null : (
                filteredFeedbacks.map(fb => (
                  <motion.div
                    key={fb.id}
                    variants={itemVariants}
                    layout
                    className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-[2rem] p-6 relative group overflow-hidden transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar with rating stars and delete icon */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <LuStar key={i} size={14} className={i <= fb.rating ? 'text-amber-500' : 'text-slate-700'} fill={i <= fb.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenEditFeedback(fb)}
                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                            title="Edit Feedback"
                          >
                            <LuPencil size={13} />
                          </button>
                          <button 
                            onClick={() => handleDeleteFeedback(fb.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Delete Feedback"
                          >
                            <LuTrash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Comment text */}
                      <p className="text-sm text-slate-300 font-medium leading-relaxed italic mb-6">"{fb.comment}"</p>
                    </div>

                    <div>
                      {/* Avatar & author profile information */}
                      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                        {fb.avatar ? (
                          <img src={fb.avatar.startsWith('http') ? fb.avatar : `http://localhost:5001${fb.avatar}`} alt={fb.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-black text-sm">
                            {fb.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-white uppercase tracking-widest truncate">{fb.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold truncate">{fb.institution || 'Verified Member'}</p>
                        </div>
                      </div>

                      {/* Status indicator button */}
                      <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          fb.status === 'Approved' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' 
                          : fb.status === 'Rejected'
                          ? 'bg-red-500/15 text-red-400 border-red-500/20'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                        }`}>
                          {fb.status}
                        </span>

                        {fb.status === 'Pending' && (
                          <button
                            onClick={() => handleQuickApproveFeedback(fb)}
                            className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
                          >
                            Approve Now <LuArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            ) : (
              filteredProblems.length === 0 ? null : (
                filteredProblems.map(prob => (
                  <motion.div
                    key={prob.id}
                    variants={itemVariants}
                    layout
                    className="bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-[2rem] p-6 relative group overflow-hidden transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Ticket top bar with status & actions */}
                      <div className="flex justify-between items-center mb-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          prob.status === 'Resolved' 
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' 
                          : 'bg-red-500/15 text-red-400 border-red-500/25'
                        }`}>
                          {prob.status}
                        </span>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenReplyProblem(prob)}
                            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
                            title="Reply to Ticket"
                          >
                            <LuMessageSquare size={13} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProblem(prob.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Delete Ticket"
                          >
                            <LuTrash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Ticket message details */}
                      <div className="mb-6">
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">{prob.inquiryType}</p>
                        <h3 className="text-sm font-semibold text-slate-200 leading-relaxed line-clamp-4 italic">"{prob.message}"</h3>
                      </div>
                    </div>

                    <div>
                      {/* Contact metadata */}
                      <div className="space-y-2.5 pt-4 border-t border-white/5 text-slate-400">
                        <div className="flex items-center gap-2">
                          <LuUser size={12} className="text-indigo-500/60" />
                          <span className="text-[10px] font-bold text-slate-300 truncate">{prob.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <LuMail size={12} className="text-indigo-500/60" />
                          <span className="text-[10px] font-bold text-slate-400 truncate">{prob.email}</span>
                        </div>
                      </div>

                      {/* Bottom action reply / status info */}
                      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          {new Date(prob.createdAt).toLocaleDateString()}
                        </span>
                        
                        <button
                          onClick={() => handleOpenReplyProblem(prob)}
                          className="text-[9px] font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                        >
                          {prob.status === 'Resolved' ? 'View Thread' : 'Write Reply'} <LuArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty States */}
      {!loading && (
        ((activeTab === 'feedback' && filteredFeedbacks.length === 0) || (activeTab === 'problem' && filteredProblems.length === 0)) && (
          <div className="py-32 text-center border border-white/5 border-dashed rounded-[2.5rem] bg-white/[0.01]">
            <LuInfo className="mx-auto text-slate-700 size-10 mb-4" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No entries found</p>
            <p className="text-slate-600 text-xs mt-1">Try refining your search terms or verify database connectivity.</p>
          </div>
        )
      )}

      {/* --- EDIT & APPROVE FEEDBACK MODAL --- */}
      <AnimatePresence>
        {selectedFeedback && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeedback(null)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative"
              >
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LuX size={16} />
                </button>

                <div className="mb-6">
                  <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <LuPencil className="text-pink-500" /> Edit & Review Testimonial
                  </h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Refine and set approval state before publishing</p>
                </div>

                <form onSubmit={handleSaveFeedback} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">Client Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">Club / Institution</label>
                      <input
                        type="text"
                        value={editInstitution}
                        onChange={(e) => setEditInstitution(e.target.value)}
                        className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors"
                        placeholder="e.g. Club President, UOM"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">Client Comment (Clean & Refine)</label>
                    <textarea
                      required
                      rows={4}
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      className="w-full px-5 py-3 bg-black/40 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-pink-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-black/30 border border-white/5">
                    {/* Star selector */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block ml-1">Star Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((stars) => (
                          <button
                            key={stars}
                            type="button"
                            onClick={() => setEditRating(stars)}
                            className="focus:outline-none hover:scale-110 transition-transform"
                          >
                            <LuStar 
                              size={22}
                              className={stars <= editRating ? 'text-amber-500 fill-amber-500' : 'text-slate-600'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status selection */}
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block ml-1">Approval Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-xs text-white font-bold uppercase tracking-wider focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setSelectedFeedback(null)}
                      className="px-6 py-3 rounded-2xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-white/5"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {isSubmitting ? 'Saving...' : 'Apply Changes'} <LuCheck size={14} />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* --- WRITE REPLY / DETAILS MODAL FOR SUPPORT TICKETS --- */}
      <AnimatePresence>
        {selectedProblem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedProblem(null); if (isPlayingSpeech) handleSpeak(''); }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative"
              >
                <button
                  onClick={() => { setSelectedProblem(null); if (isPlayingSpeech) handleSpeak(''); }}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <LuX size={16} />
                </button>

                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <LuMessageSquare className="text-blue-500" /> Support Conversation
                    </h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Review ticket message and reply to resolved ticket</p>
                  </div>
                  {/* Read Aloud voice assistance */}
                  <button
                    onClick={() => handleSpeak(`${selectedProblem.name} reported the following issue on their ticket: ${selectedProblem.message}`)}
                    className={`p-3 rounded-2xl transition-all flex items-center justify-center border ${
                      isPlayingSpeech 
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse' 
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10'
                    }`}
                    title={isPlayingSpeech ? "Stop speaking" : "Speak ticket content"}
                  >
                    {isPlayingSpeech ? <LuVolumeX size={16} /> : <LuVolume2 size={16} />}
                  </button>
                </div>

                {/* Ticket Message Thread Visualizer */}
                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 mb-6 custom-scrollbar">
                  {/* User message block */}
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-2">
                      <span>{selectedProblem.name}</span>
                      <span>•</span>
                      <span>{new Date(selectedProblem.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="p-4 rounded-3xl bg-slate-800 text-slate-200 text-sm leading-relaxed border border-white/5 max-w-[90%]">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1.5">{selectedProblem.inquiryType}</p>
                      <p className="font-semibold italic">"{selectedProblem.message}"</p>
                    </div>
                  </div>

                  {/* Previous Admin Reply if exists */}
                  {selectedProblem.adminReply && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-wider mr-2">
                        <span>Admin Assistant</span>
                        <span>•</span>
                        <span>{selectedProblem.repliedAt ? new Date(selectedProblem.repliedAt).toLocaleString() : 'Just now'}</span>
                      </div>
                      <div className="p-4 rounded-3xl bg-emerald-500/10 text-slate-200 text-sm leading-relaxed border border-emerald-500/20 max-w-[90%] text-right">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">Reply Sent</p>
                        <p className="font-semibold italic">"{selectedProblem.adminReply}"</p>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendReply} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 ml-1">Write Response</label>
                    <textarea
                      required
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a suitable reply message to send to the student's notifications and profile inbox..."
                      className="w-full px-5 py-3.5 bg-black/40 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => { setSelectedProblem(null); if (isPlayingSpeech) handleSpeak(''); }}
                      className="px-6 py-3 rounded-2xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all text-xs font-black uppercase tracking-widest border border-white/5"
                    >
                      Close
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !replyText.trim()}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Reply'} <LuCheck size={14} />
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactsPage;
