import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, LuMessageCircle, LuUser, LuTag,
  LuTrash2, LuCircleCheck, LuX, LuPencilLine
} from 'react-icons/lu';
import { fetchBlogs, updateBlogStatus, deleteBlog } from '../../api/api';
import type { Blog } from '../../types/schema';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const BlogsPage = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const data = await fetchBlogs();
      setBlogs(data);
    } catch (error) {
      console.error('Failed to load blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const pendingCount = blogs.filter(b => (b.status || '').toLowerCase() === 'pending').length;
  const approvedCount = blogs.filter(b => (b.status || '').toLowerCase() === 'approved').length;
  const rejectedCount = blogs.filter(b => (b.status || '').toLowerCase() === 'rejected').length;

  const filteredBlogs = blogs.filter(b => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (b.title || '').toLowerCase().includes(term) || 
      (b.author || '').toLowerCase().includes(term) ||
      (b.tags || '').toLowerCase().includes(term) ||
      (b.category || '').toLowerCase().includes(term);
    
    const blogStatus = (b.status || 'pending').toLowerCase();
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && blogStatus === statusFilter;
  });

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

  const handleStatusChange = async (id: number | string, newStatus: string) => {
    confirmAction(`Are you sure you want to change status to ${newStatus}?`, async () => {
      const loadingToast = toast.loading('Updating status...');
      try {
        await updateBlogStatus(id, newStatus);
        setBlogs(prev => prev.map(b => b.id === id ? { ...b, status: newStatus as 'pending' | 'approved' | 'rejected' } : b));
        if (selectedBlog?.id === id) {
          setSelectedBlog(prev => prev ? { ...prev, status: newStatus as 'pending' | 'approved' | 'rejected' } : null);
        }
        toast.success(`Status updated to ${newStatus}`, { id: loadingToast });
      } catch (error) {
        console.error(error);
        toast.error('Failed to update blog status.', { id: loadingToast });
      }
    });
  };

  const handleDelete = async (id: number | string) => {
    confirmAction('Are you sure you want to delete this blog?', async () => {
      const loadingToast = toast.loading('Deleting blog...');
      try {
        await deleteBlog(id);
        setBlogs(prev => prev.filter(b => b.id !== id));
        setSelectedBlog(null);
        toast.success('Blog deleted successfully', { id: loadingToast });
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete blog.', { id: loadingToast });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-slate-400 font-bold uppercase tracking-wider text-xs animate-pulse">Loading Blogs Console...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Blog Management</h2>
          <p className="text-slate-500 text-xs font-semibold tracking-wide mt-1">Review and moderate campus voices & student articles</p>
        </div>
      </div>

      {/* Filters & Status Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 min-w-[280px]">
          <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by title, author, category or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 overflow-x-auto">
          {[
            { key: 'all', label: 'All', count: blogs.length },
            { key: 'pending', label: 'Pending', count: pendingCount, highlight: pendingCount > 0 },
            { key: 'approved', label: 'Approved', count: approvedCount },
            { key: 'rejected', label: 'Rejected', count: rejectedCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === tab.key
                  ? tab.highlight ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-800'
                  : tab.highlight ? 'bg-amber-200/70 text-amber-800' : 'bg-slate-200/60 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-7">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {filteredBlogs.map(blog => (
              <motion.div
                key={blog.id}
                variants={itemVariants}
                onClick={() => setSelectedBlog(blog)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden bg-white flex gap-4 ${
                  selectedBlog?.id === blog.id 
                  ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md' 
                  : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-100">
                  <img src={blog.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={blog.title} />
                </div>
                
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      blog.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : blog.status === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {blog.status}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 truncate">{blog.title}</h3>
                  <div className="flex items-center gap-3 text-slate-500 text-xs">
                    <div className="flex items-center gap-1.5">
                      {blog.authorImage ? (
                        <img src={blog.authorImage} className="w-4 h-4 rounded-full object-cover" alt={blog.author} />
                      ) : (
                        <LuUser size={13} className="text-blue-600" />
                      )}
                      <span className="font-medium text-slate-700">{blog.author}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium text-slate-500"><LuTag size={12} className="text-blue-600" /> {blog.category}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredBlogs.length === 0 && (
              <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white">
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No blogs found</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedBlog ? (
              <motion.div
                key={selectedBlog.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden sticky top-6 shadow-sm"
              >
                {/* Banner Image */}
                <div className="h-44 relative bg-slate-100">
                  <img src={selectedBlog.image} className="w-full h-full object-cover" alt="Banner" />
                  <div className="absolute top-3 right-3 flex gap-2">
                     <button 
                      onClick={() => handleDelete(selectedBlog.id)}
                      className="w-9 h-9 rounded-full bg-white/90 text-rose-600 border border-slate-200 flex items-center justify-center hover:bg-rose-50 transition-all shadow-sm cursor-pointer"
                      title="Delete blog"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                      {selectedBlog.category}
                    </span>
                    <span className="text-slate-400 text-xs font-medium">{new Date(selectedBlog.createdAt).toDateString()}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 leading-snug">{selectedBlog.title}</h3>
                  
                  <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {selectedBlog.authorImage ? (
                        <img src={selectedBlog.authorImage} alt={selectedBlog.author} className="w-full h-full object-cover" />
                      ) : (
                        (selectedBlog.author || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{selectedBlog.author}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Author / Contributor</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Excerpt</p>
                      <p className="text-xs text-slate-700 leading-relaxed font-normal italic">"{selectedBlog.excerpt}"</p>
                    </div>

                    <div className="flex flex-col max-h-[350px] rounded-xl bg-slate-50 border border-slate-100 p-4">
                      <div className="flex items-center justify-between mb-2.5 shrink-0 border-b border-slate-200/60 pb-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full Content Analysis</p>
                      </div>
                      <div 
                        className="blog-content overflow-y-auto custom-scrollbar pr-2 flex-1 text-xs text-slate-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(selectedBlog.tags || '').split(',').map(tag => {
                        const trimmedTag = tag.trim();
                        if (!trimmedTag) return null;
                        return (
                          <span key={trimmedTag} className="px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold">
                            #{trimmedTag}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                    {selectedBlog.status === 'pending' ? (
                      <>
                        <button onClick={() => handleStatusChange(selectedBlog.id, 'approved')} className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer border-none">
                          <LuCircleCheck size={14} /> Approve
                        </button>
                        <button onClick={() => handleStatusChange(selectedBlog.id, 'rejected')} className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-rose-200 transition-all cursor-pointer">
                          <LuX size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleStatusChange(selectedBlog.id, 'pending')} className="col-span-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-200">
                        <LuPencilLine size={14} /> Revert to Pending
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-2xl p-8 bg-white">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                  <LuMessageCircle size={24} />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">Select a blog post to review</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
