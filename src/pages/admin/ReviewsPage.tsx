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
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900/90 border border-white/10 shadow-2xl rounded-2xl pointer-events-auto flex flex-col p-5 backdrop-blur-xl`}>
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1">
            <p className="text-sm font-bold text-white tracking-wide">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-350 text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
            Cancel
          </button>
          <button onClick={() => { toast.dismiss(t.id); onConfirm(); }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all">
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
            size={12} 
            className={star <= rating ? "text-amber-500 fill-amber-500" : "text-slate-600"} 
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Reviews Console...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Review Moderation</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Approve or reject student accommodation reviews</p>
      </div>

      {/* Search Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by comment, reviewer or annex..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
            className="space-y-4"
          >
            {filteredReviews.map(review => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                onClick={() => setSelectedReview(review)}
                className={`cursor-pointer p-5 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group flex flex-col gap-3 ${
                  selectedReview?.id === review.id 
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                      <LuUser className="w-4 h-4 text-blue-400" />
                      {review.user?.name || 'Anonymous Student'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{review.user?.email}</p>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl">
                  <FiHome className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-300 truncate">{review.annex?.title || 'Unknown Annex'}</span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Overall:</span>
                    {renderStars(review.overallRating)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Cleanliness:</span>
                    {renderStars(review.cleanlinessRating)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Landlord:</span>
                    {renderStars(review.landlordRating)}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-xs text-slate-400 leading-relaxed italic bg-black/10 p-3 rounded-xl border border-white/5 mt-1">
                    "{review.comment}"
                  </p>
                )}
              </motion.div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="text-center py-20 border border-white/5 border-dashed rounded-[2.5rem]">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No pending reviews found</p>
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] p-8 sticky top-6 backdrop-blur-xl space-y-6"
              >
                <div>
                  <h3 className="text-lg font-black text-white">Review Moderation Panel</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Action review for publication</p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Review Details</p>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white">Rater: {selectedReview.user?.name}</p>
                      <p className="text-xs text-slate-400">Email: {selectedReview.user?.email}</p>
                      <p className="text-xs text-slate-400">Annex Title: {selectedReview.annex?.title}</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ratings Breakdown</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Overall Experience:</span>
                        {renderStars(selectedReview.overallRating)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Property Cleanliness:</span>
                        {renderStars(selectedReview.cleanlinessRating)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Landlord Behavior:</span>
                        {renderStars(selectedReview.landlordRating)}
                      </div>
                    </div>
                  </div>

                  {selectedReview.comment && (
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Written Comment</p>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{selectedReview.comment}"</p>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleApprove(selectedReview.id)}
                    className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all cursor-pointer border-none"
                  >
                    <LuCheck size={14} /> Approve & Publish
                  </button>
                  <button 
                    onClick={() => handleReject(selectedReview.id)}
                    className="px-6 py-3 rounded-2xl bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500/10 shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/20 hover:bg-red-500/20 hover:scale-105 transition-all cursor-pointer"
                  >
                    <LuX size={14} /> Reject & Delete
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center border border-white/5 border-dashed rounded-[2.5rem] p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-4">
                  <LuMessageSquare size={32} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select a review request to moderate</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
