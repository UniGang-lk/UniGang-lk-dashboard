import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSearch, FaEye, FaAd, FaChartLine, FaHourglassHalf } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { LuTrash2 } from 'react-icons/lu';
import { fetchAdvertisements, updateAdvertisementStatus, updateAdvertisement, deleteAdvertisement } from '../../api/api';
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-8 custom-scrollbar"
        >
          <div className='flex justify-between items-center mb-6'>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{ad.ad_title}</h2>
              <p className="text-blue-600 text-xs font-bold uppercase tracking-wider">{ad.company_name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
            >
              <IoClose size={20} />
            </button>
          </div>

          {ad.image_url && (
            <div className="mb-6 relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
              <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${ad.image_url}`} alt={ad.ad_title} className="w-full h-full object-cover" />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-blue-600 text-[10px] font-bold text-white rounded-lg shadow-sm uppercase tracking-wider">{ad.placement_type}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Placement Details</p>
                <div className="flex flex-col gap-1.5">
                  <p className="text-base font-bold text-slate-900">{ad.placement_type}</p>
                  <p className="text-xs text-slate-600 font-medium">Duration: <span className="text-slate-900 font-bold">{ad.duration_days} Days</span></p>
                  {ad.target_link && (
                    <a href={ad.target_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-semibold hover:underline mt-1 inline-flex items-center gap-1">
                      Target Link &rarr;
                    </a>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Engagement Metrics</p>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5"><FaEye className="text-emerald-600"/> Views</span> 
                    <span className="text-slate-900 font-bold bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">{ad.views}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="flex items-center gap-1.5"><FaChartLine className="text-blue-600"/> Clicks</span> 
                    <span className="text-slate-900 font-bold bg-white border border-slate-200 px-2.5 py-0.5 rounded-md">{ad.clicks}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 h-full">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Status & Contact</p>
                
                <div className="mb-4">
                  <span className={`py-1 px-3 rounded-full text-xs font-bold border uppercase tracking-wider ${
                    ad.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    ad.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    ad.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>{ad.status}</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Company</p>
                    <p className="text-xs font-bold text-slate-900">{ad.company_name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                    <p className="text-xs text-slate-700 font-medium">{ad.contact_email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Phone</p>
                    <p className="text-xs text-slate-700 font-medium">{ad.contact_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Ad Description</p>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">{ad.ad_description}</p>
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
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
          className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full p-6 relative"
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-bold text-slate-900">Edit Advertisement</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer"><IoClose size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Company Name</label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Ad Title</label>
              <input type="text" name="ad_title" value={formData.ad_title} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Target Link</label>
              <input type="url" name="target_link" value={formData.target_link} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Placement</label>
                <select name="placement_type" value={formData.placement_type} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs">
                  <option value="BANNER">Banner</option>
                  <option value="SIDEBAR">Sidebar Widget</option>
                  <option value="NATIVE_FEED">Native Feed</option>
                  <option value="POPUP">Popup</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Duration (Days)</label>
                <input type="number" name="duration_days" value={formData.duration_days} onChange={handleChange} disabled={isDurationLocked} className={`w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs ${isDurationLocked ? 'opacity-50 cursor-not-allowed' : ''}`} required min="1" />
                {isDurationLocked && <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Locked (Ad is ACTIVE)</p>}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea name="ad_description" value={formData.ad_description} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-20 resize-none shadow-xs" required></textarea>
            </div>
            
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider cursor-pointer transition-all">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm disabled:opacity-50 cursor-pointer transition-all">
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
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white border border-slate-200 shadow-2xl rounded-2xl pointer-events-auto flex flex-col p-5`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 tracking-wide leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2.5 justify-end">
          <button onClick={() => hotToast.dismiss(t.id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
            Cancel
          </button>
          <button onClick={() => { hotToast.dismiss(t.id); onConfirm(); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20">
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

    const interval = setInterval(() => {
      setNow(new Date().getTime());
    }, 60000);
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
        toast.success(`Advertisement approved successfully!`);
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

  const handleDeleteAd = async (id: number) => {
    confirmAction(`Are you sure you want to completely delete this advertisement? This action cannot be undone.`, async () => {
      try {
        await deleteAdvertisement(id);
        setAds(prev => prev.filter(ad => ad.id !== id));
        toast.success(`Advertisement deleted permanently.`);
      } catch (error) {
        console.error("Failed to delete ad:", error);
        toast.error("Failed to delete advertisement.");
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

  const getRemainingTime = (endDateStr: string) => {
    if (!endDateStr) return 'N/A';
    const end = new Date(endDateStr).getTime();
    const diff = end - now;
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  const activeAdsCount = ads.filter(a => a.status === 'ACTIVE').length;
  const pendingAdsCount = ads.filter(a => a.status === 'PENDING').length;
  const totalViews = ads.reduce((sum, ad) => sum + (ad.views || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Advertisement Hub</h2>
        <p className="text-slate-500 text-xs font-semibold tracking-wide mt-1">Manage partner promotional banners, placements, and billing</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: FaAd, label: 'Active Campaigns', value: activeAdsCount, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { icon: FaHourglassHalf, label: 'Pending Reviews', value: pendingAdsCount, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
          { icon: FaEye, label: 'Total Impressions', value: totalViews.toLocaleString(), color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
          { icon: FaChartLine, label: 'Total Clicks', value: totalClicks.toLocaleString(), color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' }
        ].map((stat, idx) => (
          <div 
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{stat.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} border flex items-center justify-center text-base`}>
              <stat.icon />
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search campaigns by company or title..."
            className="w-full pl-9 pr-4 py-2.5 text-slate-900 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="PENDING">Pending Review</option>
          <option value="ACTIVE">Active</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75">
                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Campaign Details</th>
                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Duration</th>
                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Placement</th>
                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Performance</th>
                <th className="py-3 px-5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 font-bold uppercase tracking-wider text-xs animate-pulse">
                    Loading Campaigns...
                  </td>
                </tr>
              ) : filteredAds.length > 0 ? (
                filteredAds.map((ad: any) => (
                  <tr key={ad.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{ad.ad_title}</span>
                        <span className="text-slate-400 text-[11px] font-semibold">{ad.company_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800 text-xs">{ad.duration_days} Days</span>
                        {ad.status === 'ACTIVE' && ad.end_date && (
                          <span className="text-[10px] font-bold text-amber-600">
                            {getRemainingTime(ad.end_date)} left
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ad.placement_type === 'POPUP' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {ad.placement_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`py-0.5 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        ad.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        ad.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        ad.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                        <span>Views: <b className="text-slate-900">{ad.views}</b></span>
                        <span>Clicks: <b className="text-slate-900">{ad.clicks}</b></span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewAd(ad)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
                          title="Inspect Campaign"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        
                        <button
                          onClick={() => handleEditAd(ad)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
                          title="Edit Campaign"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>

                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer border border-rose-100"
                          title="Delete Campaign"
                        >
                          <LuTrash2 size={14} />
                        </button>

                        {ad.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveAd(ad.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all cursor-pointer border border-emerald-100"
                              title="Approve Campaign"
                            >
                              <FaCheckCircle className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleRejectAd(ad.id)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer border border-rose-100"
                              title="Reject Campaign"
                            >
                              <FaTimesCircle className="text-xs" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-bold uppercase tracking-wider text-xs">
                    No Campaigns Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
