import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LuSearch, LuPlus, LuCalendar, LuMapPin, 
  LuTrash2, LuPencil, LuCheckCircle, 
  LuX, LuClock
} from 'react-icons/lu';
import { fetchEvents, updateEntity } from '../../api/api';
import type { SystemEvent } from '../../types/schema';

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
  };
  
  const Icons = {
    upcoming: LuClock,
    ongoing: LuCheckCircle,
    completed: LuCheckCircle,
    cancelled: LuX,
  };
  
  const Icon = Icons[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${styles[status]}`}>
      <Icon className="text-xs" />
      {status}
    </span>
  );
};

const EventsPage = () => {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-white tracking-tight uppercase underline decoration-blue-500/30 underline-offset-8">System Events</h2>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20"
        >
          <LuPlus className="text-base" />
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
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none outline-none"
        >
          <option value="all" className="bg-slate-900">All Statuses</option>
          <option value="upcoming" className="bg-slate-900">Upcoming</option>
          <option value="ongoing" className="bg-slate-900">Ongoing</option>
          <option value="completed" className="bg-slate-900">Completed</option>
          <option value="cancelled" className="bg-slate-900">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 animate-pulse">Loading Events Command Center...</div>
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
              className="bg-white/5 border border-white/10 rounded-[2rem] p-6 backdrop-blur-md relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
              
              <div className="flex justify-between items-start mb-4">
                <StatusBadge status={event.status} />
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <LuPencil size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(event.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LuTrash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-black text-white mb-4 line-clamp-1">{event.title}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2.5 text-slate-400">
                  <LuCalendar className="text-blue-500/60" size={16} />
                  <span className="text-xs font-bold">{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400">
                  <LuMapPin className="text-blue-500/60" size={16} />
                  <span className="text-xs font-bold truncate">{event.location}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Pricing</div>
                <div className="text-sm font-black text-white">{event.price ? `Rs. ${event.price}` : 'Free'}</div>
              </div>
            </motion.div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 border-dashed rounded-[2rem]">
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No events found in this criteria</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default EventsPage;
