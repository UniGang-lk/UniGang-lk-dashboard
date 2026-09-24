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
import { toast as hotToast } from 'react-hot-toast';

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
    upcoming:  'bg-blue-50 text-blue-700 border-blue-200',
    ongoing:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    pending:   'bg-amber-50 text-amber-700 border-amber-200',
    approved:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected:  'bg-rose-50 text-rose-700 border-rose-200',
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${styles[status as keyof typeof styles]}`}>
      <Icon className="text-xs" />
      {status}
    </span>
  );
};

const getImageUrl = (image?: string) => {
  if (!image) return 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800';
  return image.startsWith('http') ? image : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${image}`;
};

interface EventDetailModalProps {
  event: SystemEvent;
  onClose: () => void;
  onStatusChange: (id: number | string, status: string) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onStatusChange }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-8 custom-scrollbar">
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{event.title}</h2>
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">{event.location}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all hover:bg-slate-200 cursor-pointer"
          >
            <LuX className='h-5 w-5'/>
          </button>
        </div>

        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 aspect-video relative group">
          <img src={getImageUrl(event.image)} alt={event.title} className="w-full h-full object-cover" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Event Metadata</p>
            <div className="space-y-2">
               <div className="flex items-center gap-2.5 text-slate-800 text-xs font-semibold">
                 <LuCalendar className="text-blue-600" /> {new Date(event.date).toDateString()}
               </div>
               <div className="flex items-center gap-2.5 text-slate-800 text-xs font-semibold">
                 <LuMapPin className="text-blue-600" /> {event.location}
               </div>
               <div className="flex items-center gap-2.5 text-slate-800 text-xs font-semibold">
                 <LuPhone className="text-blue-600" /> {event.contact || 'N/A'}
               </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Participation & Status</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Entry Fee:</span>
                <span className="text-sm font-bold text-slate-900">{event.price ? `Rs. ${event.price}` : 'FREE'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Current Status:</span>
                <StatusBadge status={event.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Event Description</p>
            <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
          </div>

          {event.extra && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800 mb-2">Special Instructions / Extras</p>
              <p className="text-xs text-amber-900 leading-relaxed font-normal italic">"{event.extra}"</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-slate-100 flex gap-3">
          <button 
            onClick={() => { onStatusChange(event.id, 'approved'); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <LuCircleCheck size={16} /> Approve Event
          </button>
          <button 
             onClick={() => { onStatusChange(event.id, 'rejected'); onClose(); }}
             className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
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

  const handleDelete = async (id: number | string) => {
    confirmAction('Are you sure you want to delete this event?', async () => {
      try {
        await deleteEvent(id);
        setEvents(events.filter(e => e.id !== id));
        if (selectedEvent?.id === id) setSelectedEvent(null);
        toast.success('Event deleted successfully.');
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Failed to delete event.');
      }
    });
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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Events Management</h2>
          <p className="text-slate-500 text-xs font-semibold tracking-wide mt-1">Manage and moderate campus activities & workshops</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
        >
          <LuPlus className="text-base" />
          Create Event
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search events by title or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-wider text-xs">Loading Events Console...</div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filteredEvents.map(event => (
            <motion.div
              key={event.id}
              variants={itemVariants}
              onClick={() => setSelectedEvent(event)}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden group cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <StatusBadge status={event.status} />
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                    className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100 cursor-pointer"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 border border-slate-100 bg-slate-50">
                <img src={getImageUrl(event.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1 tracking-tight">{event.title}</h3>
              <p className="text-blue-600 text-xs font-semibold mb-4">{event.location}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <LuCalendar className="text-slate-400" size={14} />
                  <span className="text-xs font-medium">{new Date(event.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entry Fee</div>
                <div className="text-sm font-extrabold text-slate-900">{event.price ? `Rs. ${event.price}` : 'FREE'}</div>
              </div>
            </motion.div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No events found matching filters</p>
            </div>
          )}
        </motion.div>
      )}

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
