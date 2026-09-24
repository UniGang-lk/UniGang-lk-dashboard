import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaEye, FaStar } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import {
  LuExternalLink, LuClipboardList, LuMessageSquare,
  LuChevronLeft, LuChevronRight, LuChevronsLeft, LuChevronsRight,
  LuCheck, LuX
} from 'react-icons/lu';
import AnnexForm, { type AnnexData } from '../../components/annex/AnnexForm';
import {
  fetchAnnexes, updateAnnexStatus as updateAnnexStatusApi,
  fetchPendingReviews, approveReview as approveReviewApi,
  deleteReview as deleteReviewApi, updateAnnex as updateAnnexApi,
  deleteAnnex as deleteAnnexApi
} from '../../api/api';
import type { Annex } from '../../types/schema';
import { useToast } from '../../context/ToastContext';
import { toast as hotToast } from 'react-hot-toast';

// ðŸŒŸ Clean Light Annex Detail Modal ðŸŒŸ
interface AnnexDetailModalProps {
  annex: Annex;
  onClose: () => void;
}

const AnnexDetailModal: React.FC<AnnexDetailModalProps> = ({ annex, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 sm:p-8 custom-scrollbar">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{annex.title}</h2>
            <p className="text-blue-600 text-xs font-bold uppercase tracking-wider mt-0.5">{annex.campus}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <IoClose className="h-5 w-5" />
          </button>
        </div>

        {annex.images && annex.images.length > 0 && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {annex.images.map((img, index) => (
              <div key={index} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-xs group">
                <img src={img} alt={`${annex.title} - Image ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {index === 0 && <span className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-[10px] font-black text-white rounded-md shadow-xs">COVER</span>}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pricing & Deposit</p>
            <p className="text-xl font-black text-blue-600">{annex.price}</p>
            <p className="text-xs font-semibold text-slate-500">Security Deposit: <span className="text-slate-800 font-bold">{annex.securityDeposit || 'N/A'}</span></p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location Context</p>
            <p className="text-xs font-bold text-slate-800">Address: <span className="font-medium text-slate-600">{annex.address}</span></p>
            <p className="text-xs font-bold text-slate-800">Proximity: <span className="font-medium text-slate-600">{annex.proximityHub || 'N/A'}</span></p>
            {annex.googleMapsUrl && (
              <a href={annex.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline mt-1">
                <LuExternalLink size={12} /> View on Google Maps
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Status Control</p>
            <div className="flex items-center gap-3">
              <span className={`py-1 px-3 rounded-full text-xs font-bold ${
                annex.status === 'Approved' || annex.status === 'Active' || annex.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                annex.status === 'Pending' || annex.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-red-100 text-red-800 border border-red-200'
              }`}>{annex.status}</span>
              <span className="text-xs text-slate-400">{annex.createdAt ? new Date(annex.createdAt).toLocaleDateString() : annex.postedDate}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Contact Information</p>
            <p className="text-sm font-bold text-slate-900">{annex.contactName}</p>
            <p className="text-xs font-semibold text-slate-600">{annex.contactPhone}</p>
            {annex.contactEmail && <p className="text-xs text-slate-500">{annex.contactEmail}</p>}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description & Rules</p>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">{annex.description}</p>
          {annex.features && annex.features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {annex.features.map((feature, index) => (
                <span key={index} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold">
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnnexesPage = () => {
  const { toast } = useToast();
  const [annexes, setAnnexes] = useState<Annex[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [loading, setLoading] = useState(false);
  const [selectedAnnexForView, setSelectedAnnexForView] = useState<Annex | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingAnnex, setEditingAnnex] = useState<Annex | null>(null);
  const [currentView, setCurrentView] = useState<'table' | 'editForm'>('table');

  // Reviews Moderation state
  const [activeTab, setActiveTab] = useState<'ads' | 'reviews'>('ads');
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Pagination State (Sigma reference style)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    if (activeTab === 'reviews') {
      const loadReviews = async () => {
        setReviewsLoading(true);
        try {
          const data = await fetchPendingReviews();
          setPendingReviews(data);
        } catch (error) {
          console.error('Failed to fetch pending reviews:', error);
        } finally {
          setReviewsLoading(false);
        }
      };
      loadReviews();
    }
  }, [activeTab]);

  const confirmAction = (message: string, onConfirm: () => void) => {
    hotToast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 flex flex-col gap-4 text-slate-800`}>
        <p className="text-sm font-bold text-slate-900">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => hotToast.dismiss(t.id)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => { hotToast.dismiss(t.id); onConfirm(); }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  useEffect(() => {
    const loadAnnexes = async () => {
      setLoading(true);
      try {
        const data = await fetchAnnexes();
        setAnnexes(data);
      } catch (error) {
        console.error('Failed to fetch annexes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAnnexes();
  }, []);

  const handleApproveAnnex = async (annexId: number) => {
    confirmAction(`Approve this property ad (ID: ${annexId})?`, async () => {
      try {
        await updateAnnexStatusApi(annexId, 'approved');
        setAnnexes(prev => prev.map(a => a.id === annexId ? { ...a, status: 'Approved' } : a));
        toast.success(`Ad #${annexId} approved successfully.`);
      } catch (error) {
        console.error('Failed to approve annex:', error);
        toast.error('Failed to approve ad.');
      }
    });
  };

  const handleRejectAnnex = async (annexId: number) => {
    confirmAction(`Reject this property ad (ID: ${annexId})?`, async () => {
      try {
        await updateAnnexStatusApi(annexId, 'rejected');
        setAnnexes(prev => prev.map(a => a.id === annexId ? { ...a, status: 'Rejected' } : a));
        toast.success(`Ad #${annexId} rejected.`);
      } catch (error) {
        console.error('Failed to reject annex:', error);
        toast.error('Failed to reject ad.');
      }
    });
  };

  const handleToggleStatus = (annex: Annex) => {
    const isCurrentlyApproved = annex.status === 'Approved' || annex.status === 'Active' || annex.status === 'approved';
    if (isCurrentlyApproved) {
      handleRejectAnnex(annex.id);
    } else {
      handleApproveAnnex(annex.id);
    }
  };

  const handleEditAnnex = (annex: Annex) => {
    setEditingAnnex(annex);
    setCurrentView('editForm');
  };

  const handleDeleteAnnex = async (annexId: number) => {
    confirmAction(`Are you sure you want to delete ad #${annexId}?`, async () => {
      try {
        await deleteAnnexApi(annexId);
        setAnnexes(prev => prev.filter(a => a.id !== annexId));
        toast.success(`Ad #${annexId} deleted.`);
      } catch (error) {
        console.error('Failed to delete annex:', error);
        toast.error('Failed to delete ad.');
      }
    });
  };

  const handleApproveReview = async (reviewId: number | string) => {
    confirmAction('Approve this review?', async () => {
      try {
        await approveReviewApi(reviewId);
        setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
        toast.success('Review approved successfully.');
      } catch (error) {
        console.error('Failed to approve review:', error);
        toast.error('Failed to approve review.');
      }
    });
  };

  const handleDeleteReview = async (reviewId: number | string) => {
    confirmAction('Delete this review?', async () => {
      try {
        await deleteReviewApi(reviewId);
        setPendingReviews(prev => prev.filter(r => r.id !== reviewId));
        toast.success('Review deleted.');
      } catch (error) {
        console.error('Failed to delete review:', error);
        toast.error('Failed to delete review.');
      }
    });
  };

  const handleUpdateAnnexSubmit = async (updatedData: AnnexData, isEditing: boolean) => {
    if (isEditing && editingAnnex) {
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
          images: result.images ? result.images.map((img: any) => typeof img === 'object' ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}${img.imageUrl}` : img) : []
        };
        setAnnexes(prev => prev.map(a => a.id === editingAnnex.id ? mappedAnnex : a));
        toast.success(`Ad #${editingAnnex.id} updated!`);
      } catch (error: any) {
        console.error('Failed to update annex:', error);
        toast.error(error.message || 'Failed to update ad.');
      } finally {
        setLoading(false);
      }
    }
    setEditingAnnex(null);
    setCurrentView('table');
  };

  // Filtered List
  const filteredAnnexes = annexes.filter(a => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.contactName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'All' ||
      (filterStatus === 'Approved' && (a.status === 'Approved' || a.status === 'Active' || a.status === 'approved')) ||
      (filterStatus === 'Pending' && (a.status === 'Pending' || a.status === 'pending')) ||
      (filterStatus === 'Rejected' && (a.status === 'Rejected' || a.status === 'rejected'));
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalItems = filteredAnnexes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedAnnexes = filteredAnnexes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const pendingCount = annexes.filter(a => a.status === 'Pending' || a.status === 'pending').length;
  const approvedCount = annexes.filter(a => a.status === 'Approved' || a.status === 'Active' || a.status === 'approved').length;

  return (
    <div className="space-y-6">
      {/* ðŸŒŸ 1. Page Header (Icon + Title) ðŸŒŸ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <LuClipboardList className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Annex Listings & Moderation
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage student accommodation listings, approvals, and review authentications
            </p>
          </div>
        </div>
      </div>

      {/* ðŸŒŸ 2. Sigma Style Underline Filter Tabs ðŸŒŸ */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-bold overflow-x-auto custom-scrollbar">
        <button
          onClick={() => { setActiveTab('ads'); setFilterStatus('All'); setCurrentView('table'); }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ads' && filterStatus === 'All'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <LuClipboardList className="text-base" />
          <span>ALL ADS</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
            {annexes.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('ads'); setFilterStatus('Approved'); setCurrentView('table'); }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ads' && filterStatus === 'Approved'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>ACTIVE</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('ads'); setFilterStatus('Pending'); setCurrentView('table'); }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'ads' && filterStatus === 'Pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>PENDING APPROVAL</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => { setActiveTab('reviews'); setCurrentView('table'); }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <LuMessageSquare className="text-base" />
          <span>REVIEWS</span>
          {pendingReviews.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
              {pendingReviews.length}
            </span>
          )}
        </button>
      </div>

      {/* ðŸŒŸ 3. Main White Card Container (Table & Controls) ðŸŒŸ */}
      {currentView === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {activeTab === 'ads' ? (
            <>
              {/* Card Top Action Bar (Search + Quick Action) */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    placeholder="Search by title, university, owner..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
                  />
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setFilterStatus(filterStatus === 'All' ? 'Pending' : 'All');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {filterStatus === 'Pending' ? 'Show All' : 'Quick Filter: Pending'}
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Listing Name</th>
                      <th className="py-3 px-4">Campus / Area</th>
                      <th className="py-3 px-4">Monthly Rent</th>
                      <th className="py-3 px-4 text-center">Active Status</th>
                      <th className="py-3 px-4 text-center">Status Pill</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          Loading property listings...
                        </td>
                      </tr>
                    ) : paginatedAnnexes.length > 0 ? (
                      paginatedAnnexes.map((annex, index) => {
                        const isApproved = annex.status === 'Approved' || annex.status === 'Active' || annex.status === 'approved';
                        const isPending = annex.status === 'Pending' || annex.status === 'pending';
                        return (
                          <tr key={annex.id} className="hover:bg-blue-50/20 transition-colors">
                            {/* Number */}
                            <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>

                            {/* Title */}
                            <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                              <span
                                onClick={() => { setSelectedAnnexForView(annex); setShowViewModal(true); }}
                                className="cursor-pointer hover:text-blue-600 hover:underline"
                                title={annex.title}
                              >
                                {annex.title}
                              </span>
                              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                By {annex.contactName} ({annex.contactPhone})
                              </p>
                            </td>

                            {/* Campus */}
                            <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                              {annex.campus}
                            </td>

                            {/* Rent */}
                            <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                              {annex.price}
                            </td>

                            {/* ðŸŒŸ Blue iOS Style Toggle Switch (Sigma reference) ðŸŒŸ */}
                            <td className="py-3.5 px-4 text-center">
                              <div
                                onClick={() => handleToggleStatus(annex)}
                                className={`toggle-switch-track mx-auto ${isApproved ? 'active' : 'inactive'}`}
                                title={isApproved ? 'Click to deactivate' : 'Click to approve/activate'}
                              >
                                <div className={`toggle-switch-thumb ${isApproved ? 'active' : 'inactive'}`} />
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isApproved ? 'bg-emerald-100 text-emerald-800' :
                                isPending ? 'bg-amber-100 text-amber-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {annex.status}
                              </span>
                            </td>

                            {/* Action Buttons (View, Edit, Delete) */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => { setSelectedAnnexForView(annex); setShowViewModal(true); }}
                                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                                  title="View Details"
                                >
                                  <FaEye className="text-xs" />
                                </button>
                                <button
                                  onClick={() => handleEditAnnex(annex)}
                                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Edit Listing"
                                >
                                  <FaEdit className="text-xs" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAnnex(annex.id)}
                                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Delete Listing"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                          No matching property listings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* ðŸŒŸ Sigma Style Pagination Bar ðŸŒŸ */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <span>Items per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span>
                    {totalItems > 0 ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}` : '0 of 0'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      title="First Page"
                    >
                      <LuChevronsLeft className="text-sm" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      title="Previous Page"
                    >
                      <LuChevronLeft className="text-sm" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      title="Next Page"
                    >
                      <LuChevronRight className="text-sm" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      title="Last Page"
                    >
                      <LuChevronsRight className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ðŸŒŸ Reviews Moderation View ðŸŒŸ */
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Pending Student Reviews</h3>
                  <p className="text-xs text-slate-500">Approve authentic reviews or reject spam content</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                  {pendingReviews.length} Pending
                </span>
              </div>

              {reviewsLoading ? (
                <div className="py-12 text-center text-slate-400 font-medium text-xs">
                  Loading pending reviews...
                </div>
              ) : pendingReviews.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium text-xs">
                  No reviews waiting for moderation.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingReviews.map((rev) => (
                    <div key={rev.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{rev.authorName || 'Student'}</span>
                          <span className="text-xs text-slate-400">on {rev.annexTitle || 'Listing'}</span>
                          <div className="flex text-amber-400 text-xs">
                            {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                              <FaStar key={i} />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">"{rev.comment}"</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApproveReview(rev.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <LuCheck className="text-sm" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <LuX className="text-sm" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Edit Form View */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">Edit Property Listing</h3>
              <p className="text-xs text-slate-500">Update listing details, pricing, and images</p>
            </div>
            <button
              onClick={() => { setEditingAnnex(null); setCurrentView('table'); }}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel Edit
            </button>
          </div>
          <AnnexForm
            initialData={{
              title: editingAnnex?.title || '',
              selectedCampus: editingAnnex?.campus || '',
              price: String(editingAnnex?.price || '').replace(/[^0-9.]/g, ''),
              address: editingAnnex?.address || '',
              description: editingAnnex?.description || '',
              features: editingAnnex?.features || [],
              newImages: [],
              existingImages: editingAnnex?.images || [],
              contactName: editingAnnex?.contactName || '',
              contactPhone: editingAnnex?.contactPhone || '',
              contactEmail: editingAnnex?.contactEmail || '',
            }}
            onSubmit={handleUpdateAnnexSubmit}
            onCancel={() => { setEditingAnnex(null); setCurrentView('table'); }}
            isEditing={true}
          />
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAnnexForView && (
        <AnnexDetailModal annex={selectedAnnexForView} onClose={() => setShowViewModal(false)} />
      )}
    </div>
  );
};

export default AnnexesPage;
