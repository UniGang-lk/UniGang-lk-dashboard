import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LuSearch, LuCalendar, LuMapPin, 
  LuTrash2, LuCircleCheck, 
  LuX, LuClock, LuPhone, LuTag, LuGraduationCap, LuFileText
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
  const normStatus = (status || '').toLowerCase();
  const styles: Record<string, string> = {
    upcoming:  'bg-blue-50 text-blue-700 border-blue-200',
    ongoing:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    pending:   'bg-amber-50 text-amber-700 border-amber-200',
    approved:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected:  'bg-rose-50 text-rose-700 border-rose-200',
  };
  
  const Icons: Record<string, any> = {
    upcoming: LuClock,
    ongoing: LuCircleCheck,
    completed: LuCircleCheck,
    cancelled: LuX,
    pending: LuClock,
    approved: LuCircleCheck,
    rejected: LuX,
  };
  
  const Icon = Icons[normStatus] || LuClock;
  const style = styles[normStatus] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${style}`}>
      <Icon className="text-xs" />
      {status}
    </span>
  );
};

const getImageUrl = (image?: string) => {
  if (!image) return 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800';
  if (image.startsWith('http')) return image;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  return `${baseUrl.replace(/\/$/, '')}/${image.replace(/^\//, '')}`;
};

const formatDateTime = (dateStr?: string, timeStr?: string) => {
  if (!dateStr) return 'Date TBA';
  const parsed = new Date(dateStr);
  const formattedDate = isNaN(parsed.getTime()) ? dateStr : parsed.toLocaleDateString();
  return timeStr ? `${formattedDate} • ${timeStr}` : formattedDate;
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
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {event.category && (
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <LuTag size={11} /> {event.category}
                </span>
              )}
              <StatusBadge status={event.status} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{event.title}</h2>
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <LuGraduationCap size={14} /> {event.uni || event.university || 'Campus Event'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all hover:bg-slate-200 cursor-pointer"
          >
            <LuX className='h-5 w-5'/>
          </button>
        </div>

        <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 aspect-video relative group bg-slate-100">
          <img src={getImageUrl(event.image)} alt={event.title} className="w-full h-full object-cover" />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">Event Schedule & Location</p>
            <div className="space-y-2">
               <div className="flex items-center gap-2.5 text-slate-800 text-xs font-semibold">
                 <LuCalendar className="text-blue-600" /> {formatDateTime(event.date, event.time)}
               </div>
               <div className="flex items-center gap-2.5 text-slate-800 text-xs font-semibold">
                 <LuMapPin className="text-blue-600" /> {event.location}
               </div>
               <div className="flex items-center gap-2.5 text-slate-800 text-xs font-semibold">
                 <LuPhone className="text-blue-600" /> {event.contact || event.phone || 'N/A'}
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

          {event.requirements && (
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1.5 flex items-center gap-1">
                <LuFileText size={12} /> Requirements & Eligibility
              </p>
              <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">{event.requirements}</p>
            </div>
          )}

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
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer border-none"
          >
            <LuCircleCheck size={16} /> Approve Event
          </button>
          <button 
             onClick={() => { onStatusChange(event.id, 'rejected'); onClose(); }}
             className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200"
          >
            <LuX size={16} /> Reject Event
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

  const loadEvents = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchEvents();
      setEvents(Array.isArray(data) ? data : []);
      if (selectedEvent) {
        const updated = (Array.isArray(data) ? data : []).find(e => e.id === selectedEvent.id);
        if (updated) setSelectedEvent(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    const interval = setInterval(() => loadEvents(true), 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter(e => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (e.title || '').toLowerCase().includes(term) || 
      (e.location || '').toLowerCase().includes(term) ||
      (e.uni || e.university || '').toLowerCase().includes(term) ||
      (e.category || '').toLowerCase().includes(term);
    const matchesStatus = filterStatus === 'all' || (e.status || '').toLowerCase() === filterStatus.toLowerCase();
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
          <button onClick={() => hotToast.dismiss(t.id)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border-none">
            Cancel
          </button>
          <button onClick={() => { hotToast.dismiss(t.id); onConfirm(); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20 cursor-pointer border-none">
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
      loadEvents(true);
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
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search events by title, campus, or location..."
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
              className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden group cursor-pointer transition-all hover:border-slate-300 hover:shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={event.status} />
                    {event.category && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-200/70">
                        {event.category}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100 cursor-pointer"
                      title="Delete Event"
                    >
                      <LuTrash2 size={15} />
                    </button>
                  </div>
                </div>

                <div className="aspect-[16/10] rounded-xl overflow-hidden mb-4 border border-slate-100 bg-slate-50 relative">
                  <img src={getImageUrl(event.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1 tracking-tight">{event.title}</h3>
                <p className="text-blue-600 text-xs font-bold mb-3 flex items-center gap-1 truncate">
                  <LuGraduationCap size={13} className="shrink-0" />
                  {event.uni || event.university || event.location}
                </p>
                
                <div className="space-y-1.5 mb-4 text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-2 text-slate-600">
                    <LuCalendar className="text-slate-400 shrink-0" size={14} />
                    <span>{formatDateTime(event.date, event.time)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <LuMapPin className="text-slate-400 shrink-0" size={14} />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
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
