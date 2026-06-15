import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuPlus, LuMegaphone, LuTrash2, LuPencil, 
  LuX, LuSend, LuClock
} from 'react-icons/lu';

interface Notification {
  id: number;
  topic: string;
  description: string;
  date: string;
  status: 'published' | 'draft';
}

const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    topic: 'Platform Maintenance',
    description: 'The dashboard will be offline for 2 hours on Sunday for security updates.',
    date: '2024-10-28',
    status: 'published'
  },
  {
    id: 2,
    topic: 'New Blog Feature!',
    description: 'Users can now submit their own stories through the "Voice of Campus" portal.',
    date: '2024-10-26',
    status: 'published'
  }
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotif, setEditingNotif] = useState<Notification | null>(null);
  
  // Form State
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleOpenModal = (notif?: Notification) => {
    if (notif) {
      setEditingNotif(notif);
      setTopic(notif.topic);
      setDescription(notif.description);
      setDate(notif.date);
    } else {
      setEditingNotif(null);
      setTopic('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingNotif(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotif) {
      setNotifications(notifications.map(n => n.id === editingNotif.id ? { ...n, topic, description, date } : n));
    } else {
      const newNotif: Notification = {
        id: Date.now(),
        topic,
        description,
        date,
        status: 'published'
      };
      setNotifications([newNotif, ...notifications]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this notification?')) {
      setNotifications(notifications.filter(n => n.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">System Notifications</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Broadcast messages to all users</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20"
        >
          <LuPlus size={18} />
          Create Broadcast
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <AnimatePresence mode="popLayout">
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                  <LuMegaphone size={24} />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button 
                    onClick={() => handleOpenModal(notif)}
                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LuPencil size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(notif.id)}
                    className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    <LuTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{notif.topic}</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">{notif.description}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <LuClock size={14} className="text-blue-500/60" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{new Date(notif.date).toDateString()}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-tighter border border-emerald-500/10">
                    {notif.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notifications.length === 0 && (
        <div className="py-20 text-center border border-white/5 border-dashed rounded-[2.5rem]">
           <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No notifications broadcasted yet</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl p-10 overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-3xl rounded-full" />
              
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">
                  {editingNotif ? 'Edit Notification' : 'New Broadcast'}
                </h3>
                <button onClick={handleCloseModal} className="text-slate-500 hover:text-white transition-all font-bold uppercase tracking-wider">
                  <LuX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Topic / Heading</label>
                  <input 
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    type="text" 
                    placeholder="e.g. Scheduled Downtime"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Message Description</label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Detailed information for the users..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1">Broadcast Date</label>
                  <input 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] transition-all"
                >
                  <LuSend size={18} />
                  {editingNotif ? 'Save Changes' : 'Post Notification'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
