import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, LuMonitor, LuCalendar, LuDollarSign, 
  LuTrash2, LuCircleCheck, LuX, LuMessageSquare,
  LuExternalLink
} from 'react-icons/lu';

// Mock Data for Service Requests
const DUMMY_SERVICES = [
  {
    id: 1,
    service: 'Web Development',
    phone: '+94 77 123 4567',
    brief: 'I need a premium portfolio website for our university club with smooth animations.',
    deadline: '2024-12-15',
    budget: 'LKR 45,000',
    status: 'pending',
    createdAt: '2024-10-25T10:30:00Z'
  },
  {
    id: 2,
    service: 'Graphic Design',
    phone: '+94 72 447 8148',
    brief: 'Logo and branding for a new student startup. Minimalist and modern aesthetic.',
    deadline: '2024-11-20',
    budget: 'LKR 15,000',
    status: 'approved',
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

const ServicesPage = () => {
  const [requests, setRequests] = useState(DUMMY_SERVICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<typeof DUMMY_SERVICES[0] | null>(null);

  const filteredRequests = requests.filter(r => 
    r.service.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.phone.includes(searchTerm) ||
    r.brief.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: number, newStatus: string) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    if (selectedRequest?.id === id) setSelectedRequest({ ...selectedRequest, status: newStatus });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      setRequests(requests.filter(r => r.id !== id));
      setSelectedRequest(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Service Requests</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage project inquiries from users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by service, phone or brief..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-8">
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
                onClick={() => setSelectedRequest(request)}
                className={`cursor-pointer p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group ${
                  selectedRequest?.id === request.id 
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                    request.status === 'approved' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {request.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>

                <h3 className="text-lg font-black text-white mb-2">{request.service}</h3>
                <p className="text-slate-400 text-xs line-clamp-2 mb-4 font-medium leading-relaxed">{request.brief}</p>
                
                <div className="flex items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <LuDollarSign size={12} className="text-blue-500" /> {request.budget}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <LuCalendar size={12} className="text-blue-500" /> {request.deadline}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
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
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                </div>

                <h3 className="text-2xl font-black text-white mb-6 tracking-tight">{selectedRequest.service}</h3>
                
                <div className="space-y-6">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Request Brief</p>
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{selectedRequest.brief}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Budget Range</p>
                      <p className="text-sm font-black text-blue-400 uppercase tracking-tighter">{selectedRequest.budget}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Target Deadline</p>
                      <p className="text-sm font-black text-white uppercase tracking-tighter">{selectedRequest.deadline}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Contact Details</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-black text-white">{selectedRequest.phone}</p>
                      <a 
                        href={`https://wa.me/${selectedRequest.phone.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                      >
                        <LuExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/10 flex flex-col gap-3">
                  {selectedRequest.status === 'pending' ? (
                    <>
                      <button 
                        onClick={() => handleStatusChange(selectedRequest.id, 'approved')}
                        className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        <LuCircleCheck size={16} /> Accept Project
                      </button>
                      <button 
                         onClick={() => handleStatusChange(selectedRequest.id, 'rejected')}
                         className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                      >
                        <LuX size={16} /> Mark as Spam
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                       <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Project Accepted</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center border border-white/5 border-dashed rounded-[2.5rem] p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-4">
                  <LuMessageSquare size={32} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select a request to view details</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
