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

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.tags.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button onClick={() => toast.dismiss(t.id)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-900/60">
            Cancel
          </button>
          <button onClick={() => { toast.dismiss(t.id); onConfirm(); }} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/40">
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
        <div className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Blogs Console...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase">Blog Management</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Review and moderate campus voices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[300px]">
          <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, author or tags..."
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
            {filteredBlogs.map(blog => (
              <motion.div
                key={blog.id}
                variants={itemVariants}
                onClick={() => setSelectedBlog(blog)}
                className={`cursor-pointer p-4 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group flex gap-5 ${
                  selectedBlog?.id === blog.id 
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/10' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  <img src={blog.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={blog.title} />
                </div>
                
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                      blog.status === 'approved' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : blog.status === 'rejected'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {blog.status}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-base font-black text-white mb-1 truncate">{blog.title}</h3>
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold">
                    <div className="flex items-center gap-1">
                      {blog.authorImage ? (
                        <img src={blog.authorImage} className="w-3.5 h-3.5 rounded-full object-cover" alt={blog.author} />
                      ) : (
                        <LuUser size={12} className="text-blue-500" />
                      )}
                      {blog.author}
                    </div>
                    <div className="flex items-center gap-1"><LuTag size={12} className="text-blue-500" /> {blog.category}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredBlogs.length === 0 && (
              <div className="text-center py-20 border border-white/5 border-dashed rounded-[2.5rem]">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No blogs found</p>
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-slate-900/50 border border-white/10 rounded-[2.5rem] overflow-hidden sticky top-6 backdrop-blur-xl"
              >
                {/* Banner Image */}
                <div className="h-48 relative">
                  <img src={selectedBlog.image} className="w-full h-full object-cover" alt="Banner" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-4 right-4 flex gap-2">
                     <button 
                      onClick={() => handleDelete(selectedBlog.id)}
                      className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-all backdrop-blur-md"
                    >
                      <LuTrash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20">
                      {selectedBlog.category}
                    </span>
                    <span className="text-slate-500 text-xs font-bold">{new Date(selectedBlog.createdAt).toDateString()}</span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">{selectedBlog.title}</h3>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black overflow-hidden">
                      {selectedBlog.authorImage ? (
                        <img src={selectedBlog.authorImage} alt={selectedBlog.author} className="w-full h-full object-cover" />
                      ) : (
                        selectedBlog.author.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest">{selectedBlog.author}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Contributor</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Excerpt</p>
                      <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{selectedBlog.excerpt}"</p>
                    </div>

                    <div className="flex flex-col max-h-[500px] rounded-2xl bg-slate-950/50 border border-white/5 p-6 shadow-inner">
                      <div className="flex items-center justify-between mb-4 shrink-0 border-b border-white/5 pb-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Content Analysis</p>
                      </div>
                      <div 
                        className="blog-content overflow-y-auto custom-scrollbar pr-4 flex-1"
                        dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.split(',').map(tag => {
                        const trimmedTag = tag.trim();
                        if (!trimmedTag) return null;
                        return (
                          <span key={trimmedTag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-500 text-[10px] font-bold uppercase">
                            #{trimmedTag}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 gap-3">
                    {selectedBlog.status === 'pending' ? (
                      <>
                        <button onClick={() => handleStatusChange(selectedBlog.id, 'approved')} className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105 transition-all">
                          <LuCircleCheck size={14} /> Approve
                        </button>
                        <button onClick={() => handleStatusChange(selectedBlog.id, 'rejected')} className="px-6 py-3 rounded-2xl bg-red-500/10 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-red-500/10 shadow-lg shadow-red-500/10 hover:shadow-xl hover:shadow-red-500/20 hover:bg-red-500/20 hover:scale-105 transition-all">
                          <LuX size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleStatusChange(selectedBlog.id, 'pending')} className="col-span-2 px-6 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-900/60 hover:bg-slate-700 hover:scale-105 transition-all">
                        <LuPencilLine size={14} /> Revert to Pending
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[400px] flex flex-col items-center justify-center text-center border border-white/5 border-dashed rounded-[2.5rem] p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600 mb-4">
                  <LuMessageCircle size={32} />
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Select a blog post to review</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;
