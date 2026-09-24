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
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<SupportProblem | null>(null);
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
      const [feedbacksData, problemsData] = await Promise.all([fetchAdminFeedbacks(), fetchAdminProblems()]);
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
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingSpeech) { window.speechSynthesis.cancel(); setIsPlayingSpeech(false); }
      else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsPlayingSpeech(false);
        utterance.onerror = () => setIsPlayingSpeech(false);
        setIsPlayingSpeech(true);
        window.speechSynthesis.speak(utterance);
      }
    } else { toast.error("Text-to-speech is not supported in this browser."); }
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

  const handleOpenEditFeedback = (fb: Feedback) => {
    setSelectedFeedback(fb); setEditName(fb.name); setEditInstitution(fb.institution || '');
    setEditComment(fb.comment); setEditRating(fb.rating); setEditStatus(fb.status);
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    try {
      setIsSubmitting(true);
      await updateAdminFeedback(selectedFeedback.id, { name: editName, institution: editInstitution || null, comment: editComment, rating: editRating, status: editStatus });
      toast.success('Feedback successfully updated'); setSelectedFeedback(null); await loadData();
    } catch (err: any) { toast.error(err.message || 'Failed to update feedback'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!window.confirm('Delete this feedback?')) return;
    try { await deleteAdminFeedback(id); toast.success('Feedback deleted'); await loadData(); }
    catch (err: any) { toast.error(err.message || 'Failed to delete feedback'); }
  };

  const handleQuickApproveFeedback = async (fb: Feedback) => {
    try { await updateAdminFeedback(fb.id, { status: 'Approved' }); toast.success('Feedback approved!'); await loadData(); }
    catch (err: any) { toast.error(err.message || 'Failed to approve feedback'); }
  };

  const handleOpenReplyProblem = (prob: SupportProblem) => { setSelectedProblem(prob); setReplyText(prob.adminReply || ''); };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem || !replyText.trim()) return;
    try {
      setIsSubmitting(true);
      await replyToAdminProblem(selectedProblem.id, replyText.trim());
      toast.success('Reply submitted!'); setSelectedProblem(null); setReplyText(''); await loadData();
    } catch (err: any) { toast.error(err.message || 'Failed to reply'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteProblem = async (id: string) => {
    if (!window.confirm('Delete this ticket?')) return;
    try { await deleteAdminProblem(id); toast.success('Ticket deleted'); await loadData(); }
    catch (err: any) { toast.error(err.message || 'Failed to delete ticket'); }
  };

  return (
    <div className="space-y-6 min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Support & Feedback Hub</h2>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">Review testimonials, approve feedback, and reply to user tickets</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button onClick={() => { setActiveTab('feedback'); setSearchTerm(''); }}
          className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 text-left ${activeTab === 'feedback' ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl ${activeTab === 'feedback' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}><LuMessageSquare className="text-lg" /></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Client Feedbacks ({feedbacks.length})</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Review student testimonials and ratings</p>
            </div>
          </div>
          {activeTab === 'feedback' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-rose-500 rounded-t-full" />}
        </button>

        <button onClick={() => { setActiveTab('problem'); setSearchTerm(''); }}
          className={`relative p-5 rounded-2xl border cursor-pointer transition-all duration-200 text-left ${activeTab === 'problem' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 rounded-xl ${activeTab === 'problem' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}><LuInfo className="text-lg" /></div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Problem Reports ({problems.length})</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">Manage support tickets and admin replies</p>
            </div>
          </div>
          {activeTab === 'problem' && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-500 rounded-t-full" />}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3">
        <div className="relative w-full md:max-w-md">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" placeholder={`Search ${activeTab === 'feedback' ? 'client testimonials' : 'problem tickets'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading contacts...</span>
        </div>
      ) : (
        <motion.div key={activeTab} variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {activeTab === 'feedback' ? (
              filteredFeedbacks.length === 0 ? null : filteredFeedbacks.map(fb => (
                <motion.div key={fb.id} variants={itemVariants} layout className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 relative transition-all flex flex-col justify-between shadow-xs hover:shadow-sm">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <LuStar key={i} size={13} className={i <= fb.rating ? 'text-amber-500' : 'text-slate-200'} fill={i <= fb.rating ? 'currentColor' : 'none'} />)}</div>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleOpenEditFeedback(fb)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer" title="Edit"><LuPencil size={12} /></button>
                        <button onClick={() => handleDeleteFeedback(fb.id)} className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all cursor-pointer" title="Delete"><LuTrash2 size={12} /></button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic mb-5">"{fb.comment}"</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 pt-3.5 border-t border-slate-100">
                      {fb.avatar ? <img src={fb.avatar.startsWith('http') ? fb.avatar : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${fb.avatar}`} alt={fb.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                        : <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-black text-sm">{fb.name.charAt(0)}</div>}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-900 truncate">{fb.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate">{fb.institution || 'Verified Member'}</p>
                      </div>
                    </div>
                    <div className="mt-3.5 flex items-center justify-between pt-3 border-t border-slate-100">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${fb.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : fb.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>{fb.status}</span>
                      {fb.status === 'Pending' && <button onClick={() => handleQuickApproveFeedback(fb)} className="text-[9px] font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-widest flex items-center gap-1 transition-colors cursor-pointer">Approve Now <LuArrowRight size={10} /></button>}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              filteredProblems.length === 0 ? null : filteredProblems.map(prob => (
                <motion.div key={prob.id} variants={itemVariants} layout className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 relative transition-all flex flex-col justify-between shadow-xs hover:shadow-sm">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${prob.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>{prob.status}</span>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleOpenReplyProblem(prob)} className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer" title="Reply"><LuMessageSquare size={12} /></button>
                        <button onClick={() => handleDeleteProblem(prob.id)} className="p-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all cursor-pointer" title="Delete"><LuTrash2 size={12} /></button>
                      </div>
                    </div>
                    <div className="mb-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-1">{prob.inquiryType}</p>
                      <h3 className="text-sm font-semibold text-slate-700 leading-relaxed line-clamp-4 italic">"{prob.message}"</h3>
                    </div>
                  </div>
                  <div>
                    <div className="space-y-1.5 pt-3.5 border-t border-slate-100">
                      <div className="flex items-center gap-2"><LuUser size={11} className="text-slate-400" /><span className="text-[10px] font-bold text-slate-700 truncate">{prob.name}</span></div>
                      <div className="flex items-center gap-2"><LuMail size={11} className="text-slate-400" /><span className="text-[10px] font-medium text-slate-500 truncate">{prob.email}</span></div>
                    </div>
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{new Date(prob.createdAt).toLocaleDateString()}</span>
                      <button onClick={() => handleOpenReplyProblem(prob)} className="text-[9px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors cursor-pointer">{prob.status === 'Resolved' ? 'View Thread' : 'Write Reply'} <LuArrowRight size={10} /></button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && ((activeTab === 'feedback' && filteredFeedbacks.length === 0) || (activeTab === 'problem' && filteredProblems.length === 0)) && (
        <div className="py-24 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <LuInfo className="mx-auto text-slate-300 size-10 mb-3" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No entries found</p>
          <p className="text-slate-400 text-xs mt-1">Try refining your search terms.</p>
        </div>
      )}

      {/* Edit Feedback Modal */}
      <AnimatePresence>
        {selectedFeedback && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFeedback(null)} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-7 shadow-2xl relative">
                <button onClick={() => setSelectedFeedback(null)} className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"><LuX size={15} /></button>
                <div className="mb-5">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><LuPencil className="text-rose-500" /> Edit & Review Testimonial</h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">Refine and set approval state before publishing</p>
                </div>
                <form onSubmit={handleSaveFeedback} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Client Name</label>
                      <input type="text" required value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-400 transition-colors" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Club / Institution</label>
                      <input type="text" value={editInstitution} onChange={(e) => setEditInstitution(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-400 transition-colors" placeholder="e.g. Club President, UOM" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Client Comment</label>
                    <textarea required rows={4} value={editComment} onChange={(e) => setEditComment(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-blue-400 transition-colors resize-none" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Star Rating</label>
                      <div className="flex gap-1.5">{[1,2,3,4,5].map((stars) => (<button key={stars} type="button" onClick={() => setEditRating(stars)} className="focus:outline-none hover:scale-110 transition-transform cursor-pointer"><LuStar size={20} className={stars <= editRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} /></button>))}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Approval Status</label>
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as any)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-400 cursor-pointer">
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => setSelectedFeedback(null)} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer">Discard</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer">{isSubmitting ? 'Saving...' : 'Apply Changes'} <LuCheck size={13} /></button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Support Ticket Reply Modal */}
      <AnimatePresence>
        {selectedProblem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedProblem(null); if (isPlayingSpeech) handleSpeak(''); }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-7 shadow-2xl relative">
                <button onClick={() => { setSelectedProblem(null); if (isPlayingSpeech) handleSpeak(''); }} className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"><LuX size={15} /></button>
                <div className="mb-5 flex items-start justify-between pr-8">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><LuMessageSquare className="text-blue-500" /> Support Conversation</h3>
                    <p className="text-slate-500 text-xs font-medium mt-0.5">Review ticket message and reply to the student</p>
                  </div>
                  <button onClick={() => handleSpeak(`${selectedProblem.name} reported: ${selectedProblem.message}`)} className={`p-2.5 rounded-xl flex items-center justify-center border cursor-pointer transition-all ${isPlayingSpeech ? 'bg-rose-50 text-rose-500 border-rose-200 animate-pulse' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`} title={isPlayingSpeech ? 'Stop' : 'Speak'}>
                    {isPlayingSpeech ? <LuVolumeX size={15} /> : <LuVolume2 size={15} />}
                  </button>
                </div>
                <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1 mb-5">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-2">
                      <span>{selectedProblem.name}</span><span>•</span><span>{new Date(selectedProblem.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-800 text-sm leading-relaxed max-w-[90%]">
                      <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1.5">{selectedProblem.inquiryType}</p>
                      <p className="font-medium italic">"{selectedProblem.message}"</p>
                    </div>
                  </div>
                  {selectedProblem.adminReply && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mr-2">
                        <span>Admin</span><span>•</span><span>{selectedProblem.repliedAt ? new Date(selectedProblem.repliedAt).toLocaleString() : 'Just now'}</span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-emerald-50 text-slate-800 text-sm leading-relaxed border border-emerald-100 max-w-[90%] text-right">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1.5">Reply Sent</p>
                        <p className="font-medium italic">"{selectedProblem.adminReply}"</p>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendReply} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Write Response</label>
                    <textarea required rows={3} value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a suitable reply..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-400 transition-colors resize-none" />
                  </div>
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                    <button type="button" onClick={() => { setSelectedProblem(null); if (isPlayingSpeech) handleSpeak(''); }} className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold cursor-pointer">Close</button>
                    <button type="submit" disabled={isSubmitting || !replyText.trim()} className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer">{isSubmitting ? 'Sending...' : 'Send Reply'} <LuCheck size={13} /></button>
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