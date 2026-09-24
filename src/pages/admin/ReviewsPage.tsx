import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, LuMessageSquare, 
  LuCheck, LuX, LuStar, LuUser 
} from 'react-icons/lu';
import { FiHome } from 'react-icons/fi';
import { fetchPendingReviews, approveReview, deleteReview } from '../../api/api';
import type { AnnexReview } from '../../types/schema';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const ReviewsPage = () => {
  const [reviews, setReviews] = useState<AnnexReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState<AnnexReview | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchPendingReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to load pending reviews:', error);
      toast.error('Failed to load pending reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = reviews.filter(r => 
    (r.comment && r.comment.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (r.user?.name && r.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (r.annex?.title && r.annex.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const confirmAction = (message: string, onConfirm: () => void) => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white border border-slate-200 shadow-2xl rounded-2xl pointer-events-auto flex flex-col p-5`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800 tracking-wide">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
            Cancel
          </button>
          <button onClick={() => { toast.dismiss(t.id); onConfirm(); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20">
            Confirm
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  const handleApprove = async (id: string) => {
    confirmAction('Are you sure you want to approve this review?', async () => {
      const loadingToast = toast.loading('Approving review...');
      try {
        await approveReview(id);
        setReviews(prev => prev.filter(r => r.id !== id));
        if (selectedReview?.id === id) {
          setSelectedReview(null);
        }
        toast.success('Review approved and published!', { id: loadingToast });
      } catch (error) {
        console.error(error);
        toast.error('Failed to approve review.', { id: loadingToast });
      }
    });
  };

  const handleReject = async (id: string) => {
    confirmAction('Are you sure you want to reject and delete this review?', async () => {
      const loadingToast = toast.loading('Deleting review...');
      try {
        await deleteReview(id);
        setReviews(prev => prev.filter(r => r.id !== id));
        if (selectedReview?.id === id) {
          setSelectedReview(null);
        }
        toast.success('Review deleted successfully.', { id: loadingToast });
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete review.', { id: loadingToast });
      }
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <LuStar 
            key={star} 
            size={13} 
            className={star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-slate-400 font-bold uppercase tracking-wider text-xs animate-pulse">Loading Reviews Console...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Review Moderation</h2>
        <p className="text-slate-500 text-xs font-semibold tracking-wide mt-1">Approve or reject student accommodation reviews</p>
      </div>

      {/* Search Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by comment, reviewer or annex..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* List of Reviews */}
        <div className="lg:col-span-7">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredReviews.map(review => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                onClick={() => setSelectedReview(review)}
                className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden bg-white flex flex-col gap-3 ${
                  selectedReview?.id === review.id 
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md' 
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-0.5">
                      <LuUser className="w-4 h-4 text-blue-600" />
                      {review.user?.name || 'Anonymous Student'}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-400">{review.user?.email}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <FiHome className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 truncate">{review.annex?.title || 'Unknown Annex'}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Overall:</span>
                    {renderStars(review.overallRating)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Cleanliness:</span>
                    {renderStars(review.cleanlinessRating)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Landlord:</span>
                    {renderStars(review.landlordRating)}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50/70 p-3 rounded-xl border border-slate-100 mt-1">
                    "{review.comment}"
                  </p>
                )}
              </motion.div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No pending reviews found</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedReview ? (
              <motion.div
                key={selectedReview.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 sticky top-6 shadow-sm space-y-5"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900">Review Moderation Panel</h3>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">Take action to approve or reject review</p>
                </div>

                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Review Details</p>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-900">Rater: {selectedReview.user?.name}</p>
                      <p className="text-xs text-slate-600">Email: {selectedReview.user?.email}</p>
                      <p className="text-xs text-slate-600">Annex Title: {selectedReview.annex?.title}</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ratings Breakdown</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Overall Experience:</span>
                        {renderStars(selectedReview.overallRating)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Property Cleanliness:</span>
                        {renderStars(selectedReview.cleanlinessRating)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-medium">Landlord Behavior:</span>
                        {renderStars(selectedReview.landlordRating)}
                      </div>
                    </div>
                  </div>

                  {selectedReview.comment && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Written Comment</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal italic">"{selectedReview.comment}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleApprove(selectedReview.id)}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer border-none"
                  >
                    <LuCheck size={14} /> Approve & Publish
                  </button>
                  <button 
                    onClick={() => handleReject(selectedReview.id)}
                    className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-rose-200 transition-all cursor-pointer"
                  >
                    <LuX size={14} /> Reject & Delete
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-2xl p-8 bg-white">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                  <LuMessageSquare size={24} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Select a review to moderate</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
