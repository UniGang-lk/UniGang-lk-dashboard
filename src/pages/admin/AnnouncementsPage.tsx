import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, LuMegaphone, LuPlus, LuTrash2, 
  LuCircleCheck, LuX, LuPencilLine, LuAlertCircle 
} from 'react-icons/lu';
import { 
  fetchAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement 
} from '../../api/api';
import type { Announcement } from '../../types/schema';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to load announcements:', error);
      toast.error('Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const filteredAnnouncements = announcements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const confirmAction = (message: string, onConfirm: () => void) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900/90 border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex flex-col p-5 backdrop-blur-xl`}>
        <div className="flex items-center gap-3 mb-5">
          <LuAlertCircle size={20} className="text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-bold text-white tracking-wide">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all">
            Cancel
          </button>
          <button onClick={() => { toast.dismiss(t.id); onConfirm(); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all">
            Confirm
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error('Title and Content are required.');
      return;
    }

    const loadingToast = toast.loading(isEditing ? 'Updating announcement...' : 'Publishing announcement...');
    try {
      if (isEditing && selectedAnnouncement) {
        const updated = await updateAnnouncement(selectedAnnouncement.id, formTitle, formContent);
        setAnnouncements(prev => prev.map(a => a.id === selectedAnnouncement.id ? updated : a));
        setSelectedAnnouncement(updated);
        toast.success('Announcement updated successfully', { id: loadingToast });
      } else {
        const newAnnouncement = await createAnnouncement(formTitle, formContent);
        setAnnouncements(prev => [newAnnouncement, ...prev]);
        setSelectedAnnouncement(newAnnouncement);
        toast.success('Announcement published successfully', { id: loadingToast });
      }
      setIsEditing(false);
      setIsCreating(false);
      setFormTitle('');
      setFormContent('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save announcement.', { id: loadingToast });
    }
  };

  const handleDelete = async (id: number | string) => {
    confirmAction('Are you sure you want to remove this announcement?', async () => {
      const loadingToast = toast.loading('Removing announcement...');
      try {
        await deleteAnnouncement(id);
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        if (selectedAnnouncement?.id === id) {
          setSelectedAnnouncement(null);
        }
        toast.success('Announcement removed', { id: loadingToast });
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete announcement.', { id: loadingToast });
      }
    });
  };

  const startCreate = () => {
    setIsCreating(true);
    setIsEditing(false);
    setFormTitle('');
    setFormContent('');
    setSelectedAnnouncement(null);
  };

  const startEdit = () => {
    if (!selectedAnnouncement) return;
    setIsEditing(true);
    setIsCreating(false);
    setFormTitle(selectedAnnouncement.title);
    setFormContent(selectedAnnouncement.content);
  };

  const cancelForm = () => {
    setIsEditing(false);
    setIsCreating(false);
    setFormTitle('');
    setFormContent('');
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Announcements Board...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Announcements</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Broadcast official news to all university gangs</p>
        </div>
        <button
          onClick={startCreate}
          className="px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl flex items-center justify-center gap-2"
        >
          <LuPlus size={16} /> Broadcast New
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search announcements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-7">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {filteredAnnouncements.map(announcement => (
              <motion.div
                key={announcement.id}
                variants={itemVariants}
                onClick={() => {
                  setSelectedAnnouncement(announcement);
                  setIsCreating(false);
                  setIsEditing(false);
                }}
                className={`cursor-pointer p-5 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group flex gap-5 ${
                  selectedAnnouncement?.id === announcement.id 
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <LuMegaphone size={20} />
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-bold text-slate-500">
                      {new Date(announcement.created_at || announcement.createdAt || '').toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white mb-1.5 truncate">{announcement.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{announcement.content}</p>
                </div>
              </motion.div>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className="text-center py-20 border border-white/5 border-dashed rounded-[2.5rem]">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No announcements published</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Panel (Detail / Create / Edit) */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {isCreating || isEditing ? (
              <motion.div
                key="form-panel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 sticky top-6 backdrop-blur-xl"
              >
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-6">
                  {isCreating ? 'Publish Announcement' : 'Edit Announcement'}
                </h3>
                
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Announcement Title</label>
                    <input
                      type="text"
                      placeholder="e.g. System Maintenance Window"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Content / Message</label>
                    <textarea
                      placeholder="Write your broadcast message here..."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      rows={8}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={cancelForm}
                      className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black uppercase tracking-wider rounded-2xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      {isCreating ? 'Publish Now' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : selectedAnnouncement ? (
              <motion.div
                key={selectedAnnouncement.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden sticky top-6 backdrop-blur-xl p-8"
              >
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-bold text-slate-500">
                    Published on {new Date(selectedAnnouncement.created_at || selectedAnnouncement.createdAt || '').toLocaleString()}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={startEdit}
                      className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500/20 transition-all"
                      title="Edit Announcement"
                    >
                      <LuPencilLine size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedAnnouncement.id)}
                      className="w-10 h-10 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all"
                      title="Delete Announcement"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-black text-white mb-4 tracking-tight leading-tight uppercase">
                  {selectedAnnouncement.title}
                </h3>
                
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] min-h-[150px]">
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center border border-white/5 border-dashed rounded-[2.5rem] p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-650 mb-4 animate-pulse">
                  <LuMegaphone size={32} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select or broadcast an announcement</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPage;
