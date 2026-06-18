import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSearch, FaEye, FaAd, FaChartLine, FaHourglassHalf, FaMoneyBillWave } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { fetchAdvertisements, updateAdvertisementStatus, updateAdvertisement } from '../../api/api';
import { useToast } from '../../context/ToastContext';
import { toast as hotToast } from 'react-hot-toast';

// Ad Detail Modal Component
interface AdDetailModalProps {
  ad: any;
  onClose: () => void;
}

const AdDetailModal: React.FC<AdDetailModalProps> = ({ ad, onClose }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-slate-900/90 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-8 custom-scrollbar"
        >
          <div className='flex justify-between items-center mb-8'>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{ad.ad_title}</h2>
              <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">{ad.company_name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all hover:rotate-90 font-bold uppercase tracking-wider"
            >
              <IoClose className='h-6 w-6'/>
            </button>
          </div>

          {ad.image_url && (
            <div className="mb-8 relative aspect-video rounded-2xl overflow-hidden border border-white/10 group shadow-2xl shadow-blue-500/10">
              <img src={`http://localhost:5001${ad.image_url}`} alt={ad.ad_title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
              <span className="absolute bottom-4 left-4 px-3 py-1.5 bg-blue-600/90 backdrop-blur-sm text-[10px] font-black text-white rounded-lg shadow-lg uppercase tracking-widest">{ad.placement_type}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-6">
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] hover:border-white/[0.15] transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Placement Details</p>
                <div className="flex flex-col gap-2">
                  <p className="text-xl font-black text-white">{ad.placement_type}</p>
                  <p className="text-sm text-slate-400">Duration: <span className="text-white font-bold">{ad.duration_days} Days</span></p>
                  {ad.target_link && (
                    <a href={ad.target_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 font-bold hover:text-blue-300 hover:underline mt-2 inline-flex items-center gap-1">
                      Target Link &rarr;
                    </a>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] hover:border-white/[0.15] transition-colors">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Engagement Metrics</p>
                <div className="space-y-4 text-sm font-bold">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-2"><FaEye className="text-emerald-400"/> Views</span> 
                    <span className="text-white text-lg bg-white/5 px-3 py-1 rounded-lg">{ad.views}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="flex items-center gap-2"><FaChartLine className="text-blue-400"/> Clicks</span> 
                    <span className="text-white text-lg bg-white/5 px-3 py-1 rounded-lg">{ad.clicks}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] hover:border-white/[0.15] transition-colors h-full">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Status & Contact</p>
                
                <div className="mb-6 flex items-center gap-3">
                  <span className={`py-1.5 px-4 rounded-full text-xs font-black border uppercase tracking-widest shadow-lg ${
                    ad.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20' :
                    ad.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/20' :
                    ad.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border-red-500/30 shadow-red-500/20' :
                    'bg-slate-500/20 text-slate-400 border-slate-500/30 shadow-slate-500/20'
                  }`}>{ad.status}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Company</p>
                    <p className="text-sm font-black text-white">{ad.company_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Email</p>
                    <p className="text-sm text-slate-300">{ad.contact_email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Phone</p>
                    <p className="text-sm text-slate-300">{ad.contact_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] hover:border-white/[0.15] transition-colors">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Ad Description</p>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">{ad.ad_description}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Edit Ad Modal Component
interface EditAdModalProps {
  ad: any;
  onClose: () => void;
  onUpdate: (updatedAd: any) => void;
}

const EditAdModal: React.FC<EditAdModalProps> = ({ ad, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    company_name: ad.company_name,
    ad_title: ad.ad_title,
    ad_description: ad.ad_description,
    target_link: ad.target_link || '',
    placement_type: ad.placement_type,
    duration_days: ad.duration_days,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isDurationLocked = ad.status === 'ACTIVE';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedAd = await updateAdvertisement(ad.id, formData);
      onUpdate(updatedAd);
      toast.success('Advertisement updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update advertisement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-900 border border-white/[0.08] rounded-3xl shadow-2xl max-w-xl w-full p-6 relative"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-white">Edit Advertisement</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white"><IoClose size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Company Name</label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Ad Title</label>
              <input type="text" name="ad_title" value={formData.ad_title} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Target Link</label>
              <input type="url" name="target_link" value={formData.target_link} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Placement</label>
                <select name="placement_type" value={formData.placement_type} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500">
                  <option value="BANNER">Banner</option>
                  <option value="SIDEBAR">Sidebar Widget</option>
                  <option value="NATIVE_FEED">Native Feed</option>
                  <option value="POPUP">Popup</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1 block">Duration (Days)</label>
                <input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} disabled={isDurationLocked} className={`w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 ${isDurationLocked ? 'opacity-50 cursor-not-allowed' : ''}`} required min="1" />
                {isDurationLocked && <p className="text-[10px] text-amber-500 mt-1">Locked (Ad is ACTIVE)</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 mb-1 block">Description</label>
              <textarea name="ad_description" value={formData.ad_description} onChange={handleChange} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 h-24" required></textarea>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800">Cancel</button>
              <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 disabled:opacity-50">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};



const AdvertisementsPage = () => {
  const { toast } = useToast();
  const [ads, setAds] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [selectedAdForView, setSelectedAdForView] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAdForEdit, setSelectedAdForEdit] = useState<any | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [now, setNow] = useState(new Date().getTime());

  const confirmAction = (message: string, onConfirm: () => void) => {
    hotToast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900/90 border border-white/10 shadow-2xl rounded-[2rem] pointer-events-auto flex flex-col p-6 backdrop-blur-xl`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <p className="text-sm font-bold text-white tracking-wide leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => hotToast.dismiss(t.id)} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-black uppercase tracking-widest rounded-xl transition-all">
            Cancel
          </button>
          <button onClick={() => { hotToast.dismiss(t.id); onConfirm(); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5">
            Confirm
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  useEffect(() => {
    const loadAds = async () => {
      setLoading(true);
      try {
        const data = await fetchAdvertisements();
        setAds(data);
      } catch (error) {
        console.error("Failed to fetch advertisements:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAds();

    // Timer for countdown updates
    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.ad_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.company_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || ad.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApproveAd = async (id: number) => {
    confirmAction(`Are you sure you want to approve this advertisement? It will immediately go live across the platform.`, async () => {
      try {
        await updateAdvertisementStatus(id, 'ACTIVE');
        setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: 'ACTIVE' } : ad));
        toast.success(`Advertisement approved successfully! Notification sent to the user.`);
      } catch (error) {
        console.error("Failed to approve ad:", error);
        toast.error("Failed to approve advertisement.");
      }
    });
  };

  const handleRejectAd = async (id: number) => {
    confirmAction(`Are you sure you want to reject this advertisement?`, async () => {
      try {
        await updateAdvertisementStatus(id, 'REJECTED');
        setAds(prev => prev.map(ad => ad.id === id ? { ...ad, status: 'REJECTED' } : ad));
        toast.success(`Advertisement rejected.`);
      } catch (error) {
        console.error("Failed to reject ad:", error);
        toast.error("Failed to reject advertisement.");
      }
    });
  };

  const handleViewAd = (ad: any) => {
    setSelectedAdForView(ad);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setSelectedAdForView(null);
    setShowViewModal(false);
  };

  const handleEditAd = (ad: any) => {
    setSelectedAdForEdit(ad);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setSelectedAdForEdit(null);
    setShowEditModal(false);
  };

  const handleUpdateAd = (updatedAd: any) => {
    setAds(prev => prev.map(a => a.id === updatedAd.id ? { ...a, ...updatedAd } : a));
    handleCloseEditModal();
  };

  // Helper for Countdown
  const getRemainingTime = (endDateStr: string) => {
    if (!endDateStr) return 'N/A';
    const end = new Date(endDateStr).getTime();
    const diff = end - now;
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  // Calculate Metrics
  const activeAdsCount = ads.filter(a => a.status === 'ACTIVE').length;
  const pendingAdsCount = ads.filter(a => a.status === 'PENDING').length;
  const totalViews = ads.reduce((sum, ad) => sum + (ad.views || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Advertisement <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Hub</span></h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Manage global ad campaigns and monetization</p>
        </div>
      </motion.div>

      {/* Premium Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: FaAd, label: 'Active Campaigns', value: activeAdsCount, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { icon: FaHourglassHalf, label: 'Pending Reviews', value: pendingAdsCount, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { icon: FaEye, label: 'Total Impressions', value: totalViews.toLocaleString(), color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { icon: FaChartLine, label: 'Total Clicks', value: totalClicks.toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-400/10' }
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.08] relative overflow-hidden group hover:border-white/[0.15] transition-colors shadow-2xl"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{stat.label}</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl`}>
                <stat.icon />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4 items-center bg-white/[0.02] p-4 rounded-[2rem] border border-white/[0.05]"
      >
        <div className="relative w-full sm:flex-grow">
          <input
            type="text"
            placeholder="Search campaigns..."
            className="w-full pl-12 pr-4 py-3.5 text-white text-sm bg-white/[0.03] border border-white/[0.08] rounded-2xl
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/[0.05] transition-all font-bold placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
        </div>

        <select
          className="w-full sm:w-auto text-sm font-bold text-white bg-white/[0.03] border border-white/[0.08] rounded-2xl
            py-3.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer hover:bg-white/[0.05] transition-colors"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All" className="bg-slate-900 text-white font-bold">All Statuses</option>
          <option value="PENDING" className="bg-slate-900 text-amber-400 font-bold">Pending Review</option>
          <option value="ACTIVE" className="bg-slate-900 text-emerald-400 font-bold">Active</option>
          <option value="REJECTED" className="bg-slate-900 text-red-400 font-bold">Rejected</option>
          <option value="EXPIRED" className="bg-slate-900 text-slate-400 font-bold">Expired</option>
        </select>
      </motion.div>

      {/* Main Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-[2.5rem] overflow-hidden border border-white/[0.08] bg-slate-900/50 shadow-2xl relative"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                <th className="py-5 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Campaign Details</th>
                <th className="py-5 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Duration</th>
                <th className="py-5 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Placement</th>
                <th className="py-5 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="py-5 px-6 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Performance</th>
                <th className="py-5 px-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                    </td>
                  </tr>
                ) : filteredAds.length > 0 ? (
                  filteredAds.map((ad: any) => (
                    <motion.tr 
                      key={ad.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="py-5 px-6">
                        <div className="flex flex-col">
                          <span className="font-black text-white text-base group-hover:text-blue-400 transition-colors">{ad.ad_title}</span>
                          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{ad.company_name}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-slate-300">{ad.duration_days} Days</span>
                          {ad.status === 'ACTIVE' && ad.end_date && (
                            <span className="text-[10px] font-black text-amber-400 uppercase">
                              {getRemainingTime(ad.end_date)} left
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          ad.placement_type === 'POPUP' ? 'bg-purple-500/10 text-purple-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {ad.placement_type}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`py-1.5 px-3 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                          ad.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-emerald-500/10' :
                          ad.status === 'PENDING' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20 shadow-amber-500/10' :
                          ad.status === 'REJECTED' ? 'bg-red-500/15 text-red-400 border border-red-500/20 shadow-red-500/10' :
                          'bg-slate-500/20 text-slate-400 border border-slate-500/20 shadow-slate-500/10'
                        }`}>
                          {ad.status}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1 text-xs font-bold">
                          <span className="text-slate-400 flex justify-between w-16">Views: <span className="text-white">{ad.views}</span></span>
                          <span className="text-slate-400 flex justify-between w-16">Clicks: <span className="text-white">{ad.clicks}</span></span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleViewAd(ad)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-blue-500/20 text-white hover:text-blue-400 border border-white/5 hover:border-blue-500/30 transition-all shadow-lg"
                            title="Inspect Campaign"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          
                          <button
                            onClick={() => handleEditAd(ad)}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-purple-500/20 text-white hover:text-purple-400 border border-white/5 hover:border-purple-500/30 transition-all shadow-lg"
                            title="Edit Campaign"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>

                          {ad.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApproveAd(ad.id)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-emerald-500/20 text-white hover:text-emerald-400 border border-white/5 hover:border-emerald-500/30 transition-all shadow-lg"
                                title="Approve Campaign"
                              >
                                <FaCheckCircle className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleRejectAd(ad.id)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all shadow-lg"
                                title="Reject Campaign"
                              >
                                <FaTimesCircle className="text-sm" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="inline-flex flex-col items-center">
                        <FaAd className="text-4xl text-white/10 mb-4" />
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">No Campaigns Found</span>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modals */}
      {showViewModal && selectedAdForView && (
        <AdDetailModal ad={selectedAdForView} onClose={handleCloseViewModal} />
      )}
      {showEditModal && selectedAdForEdit && (
        <EditAdModal ad={selectedAdForEdit} onClose={handleCloseEditModal} onUpdate={handleUpdateAd} />
      )}
    </div>
  );
};

export default AdvertisementsPage;
