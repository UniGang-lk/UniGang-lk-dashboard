import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, LuMonitor, LuCalendar, LuDollarSign, 
  LuTrash2, LuCircleCheck, LuX, LuMessageSquare,
  LuExternalLink, LuMail, LuPhone, LuClock, LuPlay,
  LuSave, LuSend
} from 'react-icons/lu';
import { 
  fetchServiceRequests, 
  updateServiceRequestStatus, 
  deleteServiceRequest,
  fetchServiceMessages,
  addServiceMessage
} from '../../api/api';
import type { ServiceRequest } from '../../types/schema';
import { useToast } from '../../context/ToastContext';
import { toast as hotToast } from 'react-hot-toast';


const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const StatusBadge = ({ status }: { status: ServiceRequest['status'] }) => {
  const styles = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };

  const Icons = {
    pending: LuClock,
    approved: LuCircleCheck,
    rejected: LuX,
    in_progress: LuPlay,
    completed: LuCircleCheck
  };

  const Icon = Icons[status] || LuClock;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${styles[status]}`}>
      <Icon className="text-xs" />
      {status.replace('_', ' ')}
    </span>
  );
};

const ServicesPage = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [notesInput, setNotesInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedRequest) return;
      try {
        setLoadingMessages(true);
        const data = await fetchServiceMessages(selectedRequest.id);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadMessages();
  }, [selectedRequest]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !newMessageText.trim()) return;
    try {
      const sent = await addServiceMessage(selectedRequest.id, newMessageText);
      setMessages([...messages, sent]);
      setNewMessageText('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message.');
    }
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchServiceRequests();
      setRequests(data);
      // Keep selected request in sync if it exists
      if (selectedRequest) {
        const updated = data.find(r => r.id === selectedRequest.id);
        if (updated) {
          setSelectedRequest(updated);
          setNotesInput(updated.adminNotes || '');
        } else {
          setSelectedRequest(null);
          setNotesInput('');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch service requests. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSelectRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setNotesInput(request.adminNotes || '');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateServiceRequestStatus(id, newStatus, notesInput);
      toast.success(`Request status updated to "${newStatus}"`);
      await loadRequests();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status. Please try again.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedRequest) return;
    try {
      setSavingNotes(true);
      await updateServiceRequestStatus(selectedRequest.id, selectedRequest.status, notesInput);
      toast.success('Admin notes updated successfully.');
      await loadRequests();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const confirmAction = (message: string, onConfirm: () => void) => {
    hotToast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900/90 border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex flex-col p-5 backdrop-blur-xl`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <p className="text-sm font-bold text-white tracking-wide">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => hotToast.dismiss(t.id)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-900/60">
            Cancel
          </button>
          <button onClick={() => { hotToast.dismiss(t.id); onConfirm(); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40">
            Confirm
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  const handleDelete = async (id: string) => {
    confirmAction('Are you sure you want to delete this service request? This action is permanent.', async () => {
      try {
        await deleteServiceRequest(id);
        toast.success('Service request deleted.');
        if (selectedRequest?.id === id) {
          setSelectedRequest(null);
          setNotesInput('');
        }
        await loadRequests();
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete request.');
      }
    });
  };


  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.clientPhone.includes(searchTerm) ||
      (r.clientEmail && r.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.brief.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase underline decoration-blue-500/30 underline-offset-8">Service Requests Center</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Manage project requests submitted by clients</p>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 relative overflow-hidden">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Total Inquiries</p>
          <p className="text-3xl font-black text-white mt-2">{stats.total}</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-5 relative overflow-hidden">
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Pending Review</p>
          <p className="text-3xl font-black text-amber-400 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-3xl p-5 relative overflow-hidden">
          <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">In Progress</p>
          <p className="text-3xl font-black text-indigo-400 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-3xl p-5 relative overflow-hidden">
          <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Completed</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by service name, phone, email, or brief..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white focus:outline-none outline-none appearance-none cursor-pointer"
        >
          <option value="all" className="bg-slate-900">All Statuses</option>
          <option value="pending" className="bg-slate-900">Pending</option>
          <option value="approved" className="bg-slate-900">Approved</option>
          <option value="in_progress" className="bg-slate-900">In Progress</option>
          <option value="completed" className="bg-slate-900">Completed</option>
          <option value="rejected" className="bg-slate-900">Rejected</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="py-20 text-center text-slate-500 animate-pulse font-black uppercase tracking-[0.3em] text-xs">Fetching Sync Stream...</div>
          ) : error ? (
            <div className="py-12 px-6 text-center bg-red-500/5 border border-red-500/10 rounded-[2rem] text-red-400">
              <p className="font-bold text-sm mb-4">{error}</p>
              <button 
                onClick={loadRequests} 
                className="px-6 py-3 bg-red-500/20 rounded-2xl hover:bg-red-500/30 font-bold uppercase tracking-wider text-xs transition-all"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-24 text-center bg-white/[0.02] border border-white/5 border-dashed rounded-[3rem]">
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">No inquiries matching filters</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filteredRequests.map(request => (
                <motion.div
                  key={request.id}
                  variants={itemVariants}
                  onClick={() => handleSelectRequest(request)}
                  className={`cursor-pointer p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group ${
                    selectedRequest?.id === request.id 
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <StatusBadge status={request.status} />
                    <span className="text-[10px] font-bold text-slate-500">
                      {new Date(request.created_at || request.updated_at || '').toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-white mb-2">{request.serviceName}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2 mb-4 font-medium leading-relaxed">{request.brief}</p>
                  
                  <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <LuDollarSign size={12} className="text-blue-500" /> {request.budget || 'Open'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LuCalendar size={12} className="text-blue-500" /> {request.deadline || 'Flexible'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-4">
          <AnimatePresence mode="wait">
            {selectedRequest ? (
              <motion.div
                key={selectedRequest.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 sticky top-6 backdrop-blur-xl"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                    <LuMonitor size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(selectedRequest.id)}
                      className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                      title="Delete inquiry"
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white mb-6 tracking-tight leading-tight">{selectedRequest.serviceName}</h3>
                
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Request Brief</p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{selectedRequest.brief}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Budget Range</p>
                      <p className="text-sm font-black text-blue-400 uppercase tracking-tighter">{selectedRequest.budget || 'Open'}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Target Deadline</p>
                      <p className="text-sm font-black text-white uppercase tracking-tighter">{selectedRequest.deadline || 'Flexible'}</p>
                    </div>
                  </div>

                  {selectedRequest.user && (
                    <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-3">
                      <img
                        src={selectedRequest.user.profile_pic || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                        alt={selectedRequest.user.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/10"
                      />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-0.5">Registered Owner</p>
                        <p className="text-sm font-black text-white leading-tight">{selectedRequest.user.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-none mt-1">{selectedRequest.user.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Client Details</p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LuPhone className="text-slate-500" size={14} />
                          <p className="text-sm font-black text-white">{selectedRequest.clientPhone}</p>
                        </div>
                        <a 
                          href={`https://wa.me/${selectedRequest.clientPhone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                          title="Open WhatsApp chat"
                        >
                          WhatsApp <LuExternalLink size={12} />
                        </a>
                      </div>
                      {selectedRequest.clientEmail && (
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <LuMail className="text-slate-500" size={14} />
                          <p className="text-xs font-bold text-slate-300 truncate max-w-[200px]" title={selectedRequest.clientEmail}>
                            {selectedRequest.clientEmail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Stepper Timeline */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 text-left">Lifecycle Progress</p>
                    <div className="flex justify-between items-center relative">
                      {[
                        { id: 'pending', label: 'Pending' },
                        { id: 'approved', label: 'Approved' },
                        { id: 'in_progress', label: 'Active' },
                        { id: 'completed', label: 'Done' }
                      ].map((step, idx, arr) => {
                        const getStepIndex = (s: string) => {
                          if (s === 'rejected') return 1;
                          const stepsMap = ['pending', 'approved', 'in_progress', 'completed'];
                          const pos = stepsMap.indexOf(s);
                          return pos === -1 ? 0 : pos;
                        };
                        const currentIdx = getStepIndex(selectedRequest.status);
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;
                        const isRejected = selectedRequest.status === 'rejected' && idx === 1;

                        return (
                          <div key={step.id} className="flex flex-col items-center flex-1 w-full relative z-10">
                            {idx < arr.length - 1 && (
                              <div className={`absolute left-1/2 top-3 w-full h-0.5 -z-10 ${
                                idx < currentIdx ? 'bg-emerald-500' : 'bg-white/10'
                              }`} />
                            )}
                            <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[9px] font-black border-2 transition-all duration-300 ${
                              isCurrent
                                ? isRejected
                                  ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/20'
                                  : 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20'
                                : isDone
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-slate-900 border-white/10 text-slate-500'
                            }`}>
                              {isRejected ? '✕' : isDone && !isCurrent ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-tighter mt-1.5 ${
                              isCurrent ? 'text-blue-400 font-extrabold' : 'text-slate-500'
                            }`}>
                              {isRejected ? 'Rejected' : step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Admin Notes Section */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 text-left">Internal Admin Notes</p>
                    <textarea
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Add internal notes about this request..."
                      rows={3}
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
                    />
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="mt-2 w-full py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <LuSave size={12} /> {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>

                  {/* Admin-Client Chat Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex flex-col h-[280px]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 text-left">Direct client discussion</p>
                    
                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar flex flex-col">
                      {loadingMessages ? (
                        <div className="my-auto text-center text-slate-550 text-[9px] font-black uppercase tracking-wider animate-pulse">
                          Syncing comments...
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="my-auto text-center text-slate-550 text-[9px] font-black uppercase tracking-wider">
                          No comments yet. Send a note to start chat.
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isAdmin = msg.senderType === 'admin';
                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col max-w-[85%] ${isAdmin ? 'self-end items-end text-right' : 'self-start items-start text-left'}`}
                            >
                              <span className="text-[8px] font-bold text-slate-500 mb-0.5 px-1">
                                {isAdmin ? 'You (Admin)' : (selectedRequest.user?.name || 'Client')} • {new Date(msg.created_at || msg.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className={`p-2.5 rounded-2xl text-[11px] font-semibold leading-relaxed ${
                                isAdmin 
                                  ? 'bg-blue-600 text-white rounded-tr-none shadow-xs' 
                                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                              }`}>
                                {msg.message}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form onSubmit={handleSendMessage} className="mt-2 flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Type response to client..."
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        className="flex-1 bg-slate-950/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-2xl transition-all shadow-xs flex items-center justify-center cursor-pointer font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40"
                        aria-label="Send message"
                      >
                        <LuSend size={14} />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Workflow Status Actions */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Change Progress State</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleStatusChange(selectedRequest.id, 'approved')}
                      className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                        selectedRequest.status === 'approved'
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-white/5 border-white/10 text-blue-400 hover:bg-blue-500/10'
                      }`}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedRequest.id, 'in_progress')}
                      className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                        selectedRequest.status === 'in_progress'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-white/5 border-white/10 text-indigo-400 hover:bg-indigo-500/10'
                      }`}
                    >
                      In Progress
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedRequest.id, 'completed')}
                      className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                        selectedRequest.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-white/5 border-white/10 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                    >
                      Complete
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                      className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                        selectedRequest.status === 'rejected'
                          ? 'bg-red-600 border-red-500 text-white'
                          : 'bg-white/5 border-white/10 text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center border border-white/5 border-dashed rounded-[2.5rem] p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-4">
                  <LuMessageSquare size={32} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select a request to inspect details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
