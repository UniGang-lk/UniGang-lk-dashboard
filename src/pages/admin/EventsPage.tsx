import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LuSearch, LuPlus, LuCalendar, LuMapPin, 
  LuTrash2, LuCircleCheck, 
  LuX, LuClock, LuPhone
} from 'react-icons/lu';
import { fetchEvents, updateEventStatus, deleteEvent } from '../../api/api';
import type { SystemEvent } from '../../types/schema';
import { useToast } from '../../context/ToastContext';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const StatusBadge = ({ status }: { status: SystemEvent['status'] }) => {
  const styles = {
    upcoming:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    ongoing:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    completed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
    pending:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected:  'bg-red-500/10 text-red-400 border-red-500/20',
  };
  
  const Icons = {
    upcoming: LuClock,
    ongoing: LuCircleCheck,
    completed: LuCircleCheck,
    cancelled: LuX,
    pending: LuClock,
    approved: LuCircleCheck,
    rejected: LuX,
  };
  
  const Icon = Icons[status as keyof typeof Icons] || LuClock;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${styles[status as keyof typeof styles]}`}>
      <Icon className="text-xs" />
      {status}
    </span>
  );
};

// Helper to resolve image URL
const getImageUrl = (image?: string) => {
  if (!image) return 'https://images.unsplash.com/photo-1540575861501-7ad058ad37fa?q=80&w=800';
  return image.startsWith('http') ? image : `http://localhost:5000${image}`;
};

// Event Detail Modal Component
interface EventDetailModalProps {
  event: SystemEvent;
  onClose: () => void;
  onStatusChange: (id: number | string, status: string) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onStatusChange }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-8 custom-scrollbar">
        <div className='flex justify-between items-start mb-8'>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{event.title}</h2>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">{event.location}</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all hover:rotate-90"
          >
            <LuX className='h-6 w-6'/>
          </button>
        </div>

        <div className="mb-8 rounded-[2rem] overflow-hidden border border-white/10 aspect-video relative group">
          <img src={getImageUrl(event.image)} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Event Metadata</p>
            <div className="space-y-3">
               <div className="flex items-center gap-3 text-white text-sm font-bold">
                 <LuCalendar className="text-blue-500" /> {new Date(event.date).toDateString()}
               </div>
               <div className="flex items-center gap-3 text-white text-sm font-bold">
                 <LuMapPin className="text-blue-500" /> {event.location}
               </div>
               <div className="flex items-center gap-3 text-white text-sm font-bold">
                 <LuPhone className="text-blue-500" /> {event.contact || 'N/A'}
               </div>
            </div>
          </div>

          <div className="p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Participation & Status</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Entry Fee:</span>
                <span className="text-sm font-black text-white">{event.price ? `Rs. ${event.price}` : 'FREE'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Current Status:</span>
                <StatusBadge status={event.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Event Description</p>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">{event.description || 'No description provided.'}</p>
          </div>

          {event.extra && (
            <div className="p-6 rounded-[2rem] bg-amber-500/[0.03] border border-amber-500/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-4">Special Instructions / Extras</p>
              <p className="text-sm text-amber-100/70 leading-relaxed font-medium italic">"{event.extra}"</p>
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-white/10 flex gap-3">
          <button 
            onClick={() => { onStatusChange(event.id, 'approved'); onClose(); }}
            className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all"
          >
            <LuCircleCheck size={16} /> Approve Event
          </button>
          <button 
             onClick={() => { onStatusChange(event.id, 'rejected'); onClose(); }}
             className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <LuX size={16} /> Reject / Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const EventsPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<SystemEvent | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          e.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        setEvents(events.filter(e => e.id !== id));
        if (selectedEvent?.id === id) setSelectedEvent(null);
        toast.success('Event deleted successfully.');
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Failed to delete event.');
      }
    }
  };

  const handleStatusUpdate = async (id: number | string, status: any) => {
    try {
      await updateEventStatus(id, status);
      setEvents(events.map(e => e.id === id ? { ...e, status } : e));
      toast.success(`Event status updated to ${status}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update event status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase underline decoration-blue-500/30 underline-offset-8">Event Command Center</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Manage and moderate campus activities</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-600/20"
        >
          <LuPlus className="text-lg" />
          Create Event
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white focus:outline-none outline-none appearance-none cursor-pointer"
        >
          <option value="all" className="bg-slate-900">All Statuses</option>
          <option value="pending" className="bg-slate-900">Pending</option>
          <option value="approved" className="bg-slate-900">Approved</option>
          <option value="rejected" className="bg-slate-900">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 animate-pulse font-black uppercase tracking-[0.3em] text-xs">Initializing Sync...</div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEvents.map(event => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedEvent(event)}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-md relative overflow-hidden group cursor-pointer transition-all hover:bg-white/[0.08]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
              
              <div className="flex justify-between items-start mb-6">
                <StatusBadge status={event.status} />
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-5 border border-white/5">
                <img src={getImageUrl(event.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Cover" />
              </div>

              <h3 className="text-xl font-black text-white mb-2 line-clamp-1 tracking-tight">{event.title}</h3>
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-6">{event.location}</p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-slate-400">
                  <LuCalendar className="text-blue-500/60" size={16} />
                  <span className="text-[11px] font-bold uppercase tracking-widest">{new Date(event.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-5 border-t border-white/10">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Fee</div>
                <div className="text-base font-black text-white">{event.price ? `Rs. ${event.price}` : 'FREE'}</div>
              </div>
            </motion.div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white/[0.02] border border-white/5 border-dashed rounded-[3rem]">
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">No active signals in this frequency</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Detail Modal */}
      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onStatusChange={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default EventsPage;
