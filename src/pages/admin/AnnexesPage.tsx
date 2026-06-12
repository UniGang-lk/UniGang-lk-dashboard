import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaEye, FaStar } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { LuExternalLink } from 'react-icons/lu';
import AnnexForm, { type AnnexData } from '../../components/annex/AnnexForm';
import { fetchAnnexes, updateAnnexStatus as updateAnnexStatusApi, fetchPendingReviews, approveReview as approveReviewApi, deleteReview as deleteReviewApi, updateAnnex as updateAnnexApi, deleteAnnex as deleteAnnexApi } from '../../api/api';
import type { Annex } from '../../types/schema';
import { useToast } from '../../context/ToastContext';


// Annex Detail Modal Component
interface AnnexDetailModalProps {
  annex: Annex;
  onClose: () => void;
}

const AnnexDetailModal: React.FC<AnnexDetailModalProps> = ({ annex, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-8 custom-scrollbar">
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-none mb-2">{annex.title}</h2>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">{annex.campus}</p>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all hover:rotate-90"
          >
            <IoClose className='h-6 w-6'/>
          </button>
        </div>

        {annex.images && annex.images.length > 0 && (
          <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {annex.images.map((img, index) => (
              <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group">
                <img src={img} alt={`${annex.title} - Image ${index + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {index === 0 && <span className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-[8px] font-black text-white rounded-md">COVER</span>}
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-6">
            <div className="p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Pricing & Deposit</p>
              <div className="flex flex-col gap-2">
                <p className="text-xl font-black text-white">{annex.price}</p>
                <p className="text-xs font-bold text-slate-400">Security Deposit: <span className="text-blue-400">{annex.securityDeposit || 'N/A'}</span></p>
              </div>
            </div>

            <div className="p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Location Context</p>
              <div className="space-y-3">
                <p className="text-sm font-bold text-slate-300">Address: <span className="text-white font-medium">{annex.address}</span></p>
                <p className="text-sm font-bold text-slate-300">Proximity: <span className="text-blue-400 font-medium">{annex.proximityHub || 'N/A'}</span></p>
                {annex.googleMapsUrl && (
                  <a href={annex.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 font-black uppercase tracking-widest flex items-center gap-1 hover:underline mt-2">
                    <LuExternalLink size={12}/> View on Maps
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Status Control</p>
              <div className="flex items-center gap-3">
                <span className={`py-1 px-4 rounded-full text-[10px] font-black border uppercase tracking-widest ${
                  annex.status === 'Approved' || annex.status === 'Active' || annex.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                  annex.status === 'Pending' || annex.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                  annex.status === 'Rejected' || annex.status === 'rejected' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                  'bg-slate-500/20 text-slate-400 border-slate-500/20'
                }`}>{annex.status}</span>
                <p className="text-[10px] font-bold text-slate-500 uppercase">{annex.createdAt ? new Date(annex.createdAt).toLocaleDateString() : annex.postedDate}</p>
              </div>
            </div>

            <div className="p-5 rounded-[1.5rem] bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Contact Information</p>
              <div className="space-y-2">
                <p className="text-sm font-black text-white">{annex.contactName}</p>
                <p className="text-sm font-bold text-slate-400">{annex.contactPhone}</p>
                {annex.contactEmail && <p className="text-xs text-slate-500">{annex.contactEmail}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Description & House Rules</p>
            <p className="text-sm text-slate-300 leading-relaxed font-medium mb-4">{annex.description}</p>
            {annex.features && annex.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {annex.features.map((feature, index) => (
                  <span key={index} className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase border border-blue-500/10">
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};




const AnnexesPage = () => {
  const { toast } = useToast();
  const [annexes, setAnnexes] = useState<Annex[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [selectedAnnexForView, setSelectedAnnexForView] = useState<Annex | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  // CHANGED: Edit functionality සඳහා අලුත් states
  const [editingAnnex, setEditingAnnex] = useState<Annex | null>(null); // Edit කරන Annex එක
  const [currentView, setCurrentView] = useState<'table' | 'editForm'>('table'); // වත්මන් View එක control කරන්න

  // Advanced feature: Reviews Moderation state
  const [activeTab, setActiveTab] = useState<'ads' | 'reviews'>('ads');
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Fetch pending reviews when activeTab is 'reviews'
  useEffect(() => {
    if (activeTab === 'reviews') {
      const loadReviews = async () => {
        setReviewsLoading(true);
        try {
          const data = await fetchPendingReviews();
          setPendingReviews(data);
        } catch (error) {
          console.error("Failed to fetch pending reviews:", error);
        } finally {
          setReviewsLoading(false);
        }
      };
      loadReviews();
    }
  }, [activeTab]);

  const handleApproveReview = async (reviewId: number | string) => {
    if (window.confirm(`Do you want to approve this review?`)) {
      try {
        await approveReviewApi(reviewId);
        setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
        toast.success("Review approved successfully.");
      } catch (error) {
        console.error("Failed to approve review:", error);
        toast.error("Failed to approve review.");
      }

    }
  };

  const handleDeleteReview = async (reviewId: number | string) => {
    if (window.confirm(`Do you want to delete this review?`)) {
      try {
        await deleteReviewApi(reviewId);
        setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
        toast.success("Review deleted successfully.");
      } catch (error) {
        console.error("Failed to delete review:", error);
        toast.error("Failed to delete review.");
      }

    }
  };

  // Annex data loading simulation (for future API integration)
  useEffect(() => {
    const loadAnnexes = async () => {
      setLoading(true);
      try {
        const data = await fetchAnnexes();
        setAnnexes(data);
      } catch (error) {
        console.error("Failed to fetch annexes:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAnnexes();
  }, []);

  // Filtered annexes based on search term and status
  const filteredAnnexes = annexes.filter(annex => {
    const matchesSearch = annex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annex.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      annex.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || annex.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle annex approval
  const handleApproveAnnex = async (annexId: number) => {
    if (window.confirm(`Do you want to approve this ads? (ID: ${annexId})`)) {
      try {
        await updateAnnexStatusApi(annexId, 'approved');
        setAnnexes(prevAnnexes =>
          prevAnnexes.map(annex =>
            annex.id === annexId ? { ...annex, status: 'Approved' } : annex
          )
        );
        toast.success(`Ads ID ${annexId} approved successfully.`);
      } catch (error) {
        console.error("Failed to approve annex:", error);
        toast.error("Failed to approve ads.");
      }

    }
  };

  // Handle annex rejection
  const handleRejectAnnex = async (annexId: number) => {
    if (window.confirm(`Do you want to reject this ads? (ID: ${annexId})`)) {
      try {
        await updateAnnexStatusApi(annexId, 'rejected');
        setAnnexes(prevAnnexes =>
          prevAnnexes.map(annex =>
            annex.id === annexId ? { ...annex, status: 'Rejected' } : annex
          )
        );
        toast.success(`Ads ID ${annexId} rejected successfully.`);
      } catch (error) {
        console.error("Failed to reject annex:", error);
        toast.error("Failed to reject ads.");
      }

    }
  };

  // CHANGED: Annex edit functionality
  const handleEditAnnex = (annex: Annex) => {
    setEditingAnnex(annex);
    setCurrentView('editForm');
  };

  // Handle annex delete
  const handleDeleteAnnex = async (annexId: number) => {
    if (window.confirm(`Do you want to delete ads? (ID ${annexId})`)) {
      try {
        await deleteAnnexApi(annexId);
        setAnnexes(annexes.filter(annex => annex.id !== annexId));
        toast.success(`Ads ID ${annexId} deleted successfully.`);
      } catch (error) {
        console.error("Failed to delete annex:", error);
        toast.error("Failed to delete ads.");
      }

    }
  };

  const handleViewAnnex = (annex: Annex) => {
    setSelectedAnnexForView(annex);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setSelectedAnnexForView(null);
    setShowViewModal(false);
  };

  const handleUpdateAnnexSubmit = async (updatedData: AnnexData, isEditing: boolean) => {
    if (isEditing && editingAnnex) {
      console.log('Updating Annex:', editingAnnex.id, updatedData);
      setLoading(true);
      try {
        const result = await updateAnnexApi(editingAnnex.id, updatedData);
        const mappedAnnex = {
          ...result,
          price: `Rs. ${parseFloat(result.price).toLocaleString()}/month`,
          campus: result.university ? result.university.name : (updatedData.selectedCampus || 'Unknown'),
          contactName: result.owner ? result.owner.name : updatedData.contactName,
          contactPhone: result.owner ? result.owner.phone : updatedData.contactPhone,
          postedDate: new Date(result.createdAt).toLocaleDateString(),
          features: result.features ? result.features.map((f: any) => f.featureName || f) : [],
          images: result.images ? result.images.map((img: any) => typeof img === 'object' ? `http://localhost:5000${img.imageUrl}` : img) : []
        };

        setAnnexes(prevAnnexes =>
          prevAnnexes.map(annex =>
            annex.id === editingAnnex.id ? mappedAnnex : annex
          )
        );
        toast.success(`Ads ID ${editingAnnex.id} updated successfully!`);
      } catch (error: any) {
        console.error("Failed to update annex:", error);
        toast.error(error.message || "Failed to update ads.");
      } finally {

        setLoading(false);
      }
    }
    setEditingAnnex(null); 
    setCurrentView('table'); 
  };

  const handleCancelEdit = () => {
    setEditingAnnex(null); 
    setCurrentView('table'); 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Annex Moderation Hub</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Approve property listings and moderate student voice</p>
        </div>
      </div>

      {/* Modern Premium Tabs */}
      <div className="flex gap-4 border-b border-white/[0.08] pb-2">
        <button
          onClick={() => {
            setActiveTab('ads');
            setCurrentView('table');
          }}
          className={`pb-2.5 px-2 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'ads' ? 'text-blue-500' : 'text-slate-500 hover:text-white'
          }`}
        >
          Ads Management
          {activeTab === 'ads' && (
            <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('reviews');
            setCurrentView('table');
          }}
          className={`pb-2.5 px-2 text-xs font-black uppercase tracking-widest transition-all relative flex items-center gap-1.5 ${
            activeTab === 'reviews' ? 'text-blue-500' : 'text-slate-500 hover:text-white'
          }`}
        >
          Reviews Moderation
          {pendingReviews.length > 0 && (
            <span className="bg-blue-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
              {pendingReviews.length}
            </span>
          )}
          {activeTab === 'reviews' && (
            <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-blue-500 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === 'reviews' ? (
        reviewsLoading ? (
          <div className="text-center py-16 text-slate-500 text-sm">Loading reviews...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingReviews.length > 0 ? (
              pendingReviews.map((review: any) => (
                <div 
                  key={review.id} 
                  className="bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:border-white/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-wider line-clamp-1">{review.annex?.title || 'Unknown Property'}</h4>
                        <p className="text-slate-500 text-[10px] font-bold mt-0.5 uppercase tracking-widest">{review.student?.name || 'Anonymous Student'}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/25 px-2 py-0.5 rounded-lg text-xs font-black">
                        <FaStar size={10} className="fill-yellow-400" />
                        {review.overallRating || review.overall_rating || review.rating || 0}
                      </div>
                    </div>

                    <div className="space-y-2 p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl text-xs">
                      <div className="flex justify-between text-slate-400">
                        <span className="font-medium">Cleanliness:</span>
                        <span className="font-bold text-white">{review.cleanlinessRating || review.cleanliness_rating || 0}/5</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span className="font-medium">Landlord:</span>
                        <span className="font-bold text-white">{review.landlordRating || review.landlord_rating || 0}/5</span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-xs leading-relaxed italic font-medium">
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
                    <button
                      onClick={() => handleApproveReview(review.id)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all"
                    >
                      <FaCheckCircle size={10} /> Approve
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-black text-[9px] uppercase tracking-wider flex items-center justify-center gap-1.5 border border-red-500/10 hover:bg-red-500/20 transition-all"
                    >
                      <FaTimesCircle size={10} /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-slate-600 text-sm">
                No pending reviews found. Excellent job!
              </div>
            )}
          </div>
        )
      ) : currentView === 'table' ? (
        <>
          {/* Search and Filter Section */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search by title, campus or name..."
                className="w-full pl-10 pr-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl
                  focus:outline-none focus:ring-1 focus:ring-blue-500/50 placeholder:text-slate-600 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-sm" />
            </div>

            <select
              className="text-sm text-white bg-white/[0.05] border border-white/[0.08] rounded-xl
                py-2.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All" className="bg-slate-900">All Ads</option>
              <option value="Pending" className="bg-slate-900">Pending</option>
              <option value="Active" className="bg-slate-900">Active</option>
              <option value="Rejected" className="bg-slate-900">Rejected</option>
              <option value="Expired" className="bg-slate-900">Expired</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-500 text-sm">Loading ads...</div>
          ) : (
            <div className="rounded-[1.75rem] overflow-hidden border border-white/[0.07] bg-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Title</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Campus</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Price</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Status</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Date</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Owner</th>
                      <th className="py-3.5 px-5 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredAnnexes.length > 0 ? (
                      filteredAnnexes.map((annex: Annex) => (
                        <tr key={annex.id} className="hover:bg-white/[0.04] transition-colors">
                          <td className="py-3.5 px-5 font-semibold text-white whitespace-nowrap">{annex.title}</td>
                          <td className="py-3.5 px-5 text-slate-400">{annex.campus}</td>
                          <td className="py-3.5 px-5 font-bold text-blue-400">{annex.price}</td>
                          <td className="py-3.5 px-5">
                            <span className={`py-1 px-2.5 rounded-full text-[10px] font-bold border ${
                              annex.status === 'Approved' || annex.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                              annex.status === 'Pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
                              annex.status === 'Rejected' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                              'bg-slate-500/20 text-slate-400 border-slate-500/20'
                            }`}>
                              {annex.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 text-xs">{annex.createdAt ? new Date(annex.createdAt).toLocaleDateString() : annex.postedDate}</td>
                          <td className="py-3.5 px-5 text-slate-400">{annex.contactName}</td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleViewAnnex(annex)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 transition-all"
                                title="View"
                              >
                                <FaEye className="text-sm" />
                              </button>

                              {annex.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => handleApproveAnnex(annex.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/25 transition-all"
                                    title="Approve"
                                  >
                                    <FaCheckCircle className="text-sm" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectAnnex(annex.id)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all"
                                    title="Reject"
                                  >
                                    <FaTimesCircle className="text-sm" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleEditAnnex(annex)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all"
                                title="Edit"
                              >
                                <FaEdit className="text-sm" />
                              </button>
                              <button
                                onClick={() => handleDeleteAnnex(annex.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all"
                                title="Delete"
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-600 text-sm">No ads found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        // CHANGED: Edit form එක පෙන්වන්න
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Edit Annex Ad</h3>
          <AnnexForm
            initialData={editingAnnex ? {
              ...editingAnnex,
              selectedCampus: editingAnnex.campus,
              existingImages: editingAnnex.images,
              newImages: []
            } as any as AnnexData : undefined}
            onSubmit={handleUpdateAnnexSubmit}
            onCancel={handleCancelEdit}
            isEditing={true}
          />
        </div>
      )}

      {/* Annex Detail Modal */}
      {showViewModal && selectedAnnexForView && (
        <AnnexDetailModal annex={selectedAnnexForView} onClose={handleCloseViewModal} />
      )}
    </div>
  );
};

export default AnnexesPage;
