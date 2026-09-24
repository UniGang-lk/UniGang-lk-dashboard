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
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Notifications</h2>
          <p className="text-slate-500 text-xs font-semibold tracking-wide mt-1">Broadcast messages to all university students & hosts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer"
        >
          <LuPlus size={16} />
          Create Broadcast
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        <AnimatePresence mode="popLayout">
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 relative group overflow-hidden hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                  <LuMegaphone size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button 
                    onClick={() => handleOpenModal(notif)}
                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
                    title="Edit notification"
                  >
                    <LuPencil size={15} />
                  </button>
                  <button 
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all border border-rose-100 cursor-pointer"
                    title="Delete notification"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-base font-bold text-slate-900 mb-2 tracking-tight">{notif.topic}</h3>
                <p className="text-slate-600 text-xs font-normal leading-relaxed mb-6">{notif.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <LuClock size={13} className="text-slate-400" />
                    <span className="text-[11px] font-medium">{new Date(notif.date).toDateString()}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                    {notif.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {notifications.length === 0 && (
        <div className="py-20 text-center border border-dashed border-slate-200 rounded-2xl bg-white">
           <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No notifications broadcasted yet</p>
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
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {editingNotif ? 'Edit Notification' : 'New Broadcast'}
                </h3>
                <button onClick={handleCloseModal} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer">
                  <LuX size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Topic / Heading</label>
                  <input 
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    type="text" 
                    placeholder="e.g. Scheduled Downtime"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Message Description</label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Detailed information for the users..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Broadcast Date</label>
                  <input 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    type="date"
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                  />
                </div>

                <div className="pt-3">
                  <button 
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <LuSend size={15} />
                    {editingNotif ? 'Save Changes' : 'Post Notification'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
