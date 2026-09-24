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
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200'
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[status]}`}>
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
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white border border-slate-200 shadow-2xl rounded-2xl pointer-events-auto flex flex-col p-5`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 tracking-wide">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => hotToast.dismiss(t.id)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
            Cancel
          </button>
          <button onClick={() => { hotToast.dismiss(t.id); onConfirm(); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20">
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

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Service Requests</h2>
          <p className="text-slate-500 text-xs font-semibold tracking-wide mt-1">Manage client project inquiries and custom task requests</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs transition-all hover:border-slate-300">
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Inquiries</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white border border-amber-200/70 rounded-2xl p-5 shadow-xs transition-all hover:border-amber-300">
          <p className="text-amber-700 text-xs font-bold uppercase tracking-wider">Pending Review</p>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white border border-indigo-200/70 rounded-2xl p-5 shadow-xs transition-all hover:border-indigo-300">
          <p className="text-indigo-700 text-xs font-bold uppercase tracking-wider">In Progress</p>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">{stats.inProgress}</p>
        </div>
        <div className="bg-white border border-emerald-200/70 rounded-2xl p-5 shadow-xs transition-all hover:border-emerald-300">
          <p className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Completed</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search inquiries by title, client phone, email, or brief..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">Loading service requests...</div>
          ) : error ? (
            <div className="py-12 px-6 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
              <p className="font-bold text-sm mb-4">{error}</p>
              <button 
                onClick={loadRequests} 
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-xs"
              >
                Retry Connection
              </button>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No inquiries matching filters</p>
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
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden bg-white ${
                    selectedRequest?.id === request.id 
                    ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md' 
                    : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <StatusBadge status={request.status} />
                    <span className="text-[11px] font-semibold text-slate-400">
                      {new Date(request.created_at || request.updated_at || '').toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1.5">{request.serviceName}</h3>
                  <p className="text-slate-600 text-xs line-clamp-2 mb-4 font-normal leading-relaxed">{request.brief}</p>
                  
                  <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <LuDollarSign size={14} className="text-blue-600" /> {request.budget || 'Open'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <LuCalendar size={14} className="text-blue-600" /> {request.deadline || 'Flexible'}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 sticky top-6 shadow-sm"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                    <LuMonitor size={20} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(selectedRequest.id)}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border border-rose-100"
                      title="Delete inquiry"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-4 leading-snug">{selectedRequest.serviceName}</h3>
                
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Request Brief</p>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">{selectedRequest.brief}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Budget Range</p>
                      <p className="text-xs font-bold text-blue-600 uppercase">{selectedRequest.budget || 'Open'}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target Deadline</p>
                      <p className="text-xs font-bold text-slate-800 uppercase">{selectedRequest.deadline || 'Flexible'}</p>
                    </div>
                  </div>

                  {selectedRequest.user && (
                    <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center gap-3">
                      <img
                        src={selectedRequest.user.profile_pic || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                        alt={selectedRequest.user.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-0.5">Registered Owner</p>
                        <p className="text-xs font-bold text-slate-900 truncate leading-tight">{selectedRequest.user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{selectedRequest.user.email}</p>
                      </div>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Client Details</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LuPhone className="text-slate-400" size={14} />
                          <p className="text-xs font-bold text-slate-800">{selectedRequest.clientPhone}</p>
                        </div>
                        <a 
                          href={`https://wa.me/${selectedRequest.clientPhone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-emerald-200"
                          title="Open WhatsApp chat"
                        >
                          WhatsApp <LuExternalLink size={11} />
                        </a>
                      </div>
                      {selectedRequest.clientEmail && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                          <LuMail className="text-slate-400" size={14} />
                          <p className="text-xs font-medium text-slate-600 truncate max-w-[200px]" title={selectedRequest.clientEmail}>
                            {selectedRequest.clientEmail}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Stepper Timeline */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Lifecycle Progress</p>
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
                                idx < currentIdx ? 'bg-emerald-500' : 'bg-slate-200'
                              }`} />
                            )}
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-200 ${
                              isCurrent
                                ? isRejected
                                  ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                                  : 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : isDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                              {isRejected ? '✕' : isDone && !isCurrent ? '✓' : idx + 1}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${
                              isCurrent ? 'text-blue-600' : 'text-slate-500'
                            }`}>
                              {isRejected ? 'Rejected' : step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Admin Notes Section */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Internal Admin Notes</p>
                    <textarea
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Add internal notes about this request..."
                      rows={3}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="mt-2 w-full py-2 bg-slate-900 hover:bg-slate-800 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <LuSave size={12} /> {savingNotes ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>

                  {/* Admin-Client Chat Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col h-[280px]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Direct client discussion</p>
                    
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar flex flex-col">
                      {loadingMessages ? (
                        <div className="my-auto text-center text-slate-400 text-[10px] font-bold uppercase tracking-wider animate-pulse">
                          Syncing comments...
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="my-auto text-center text-slate-400 text-[10px] font-semibold">
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
                              <span className="text-[8px] font-bold text-slate-400 mb-0.5 px-1">
                                {isAdmin ? 'You (Admin)' : (selectedRequest.user?.name || 'Client')} • {new Date(msg.created_at || msg.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <div className={`p-2.5 rounded-xl text-xs font-medium leading-relaxed ${
                                isAdmin 
                                  ? 'bg-blue-600 text-white rounded-tr-none shadow-xs' 
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
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
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all shadow-xs flex items-center justify-center cursor-pointer"
                        aria-label="Send message"
                      >
                        <LuSend size={14} />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Workflow Status Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Change Progress State</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => handleStatusChange(selectedRequest.id, 'approved')}
                      className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all ${
                        selectedRequest.status === 'approved'
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedRequest.id, 'in_progress')}
                      className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all ${
                        selectedRequest.status === 'in_progress'
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white border-slate-200 text-indigo-600 hover:bg-indigo-50'
                      }`}
                    >
                      In Progress
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedRequest.id, 'completed')}
                      className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all ${
                        selectedRequest.status === 'completed'
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-white border-slate-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      Complete
                    </button>
                    <button 
                      onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                      className={`py-2 rounded-lg font-bold text-xs uppercase tracking-wider border transition-all ${
                        selectedRequest.status === 'rejected'
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[360px] flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-2xl p-8 bg-white">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                  <LuMessageSquare size={24} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Select a request to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
