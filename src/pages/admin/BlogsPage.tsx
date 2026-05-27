import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuSearch, LuMessageCircle, LuUser, LuTag,
  LuTrash2, LuCircleCheck, LuX, LuPencilLine
} from 'react-icons/lu';

// Mock Data for Blogs
const DUMMY_BLOGS = [
  {
    id: 1,
    title: 'How I Survived My First Semester',
    category: 'Campus Life',
    author: 'Dulaj Silva',
    excerpt: 'Sharing my personal journey of navigating university life, from exams to social clubs.',
    content: '<p>University life can be overwhelming at first. The transition from school is a major leap...</p>',
    tags: 'lifestyle, campus, advice',
    image: 'https://images.unsplash.com/photo-1523050335392-9bc5675e7753?q=80&w=800',
    status: 'pending',
    createdAt: '2024-10-25T10:30:00Z'
  },
  {
    id: 2,
    title: 'Top 5 Exam Tips for Engineering Students',
    category: 'Exam Tips',
    author: 'Kaja Perera',
    excerpt: 'Proven strategies to ace your mid-terms and finals without losing your sanity.',
    content: '<ul><li>Start early</li><li>Practice past papers</li></ul>',
    tags: 'exams, engineering, study',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800',
    status: 'approved',
    createdAt: '2024-10-24T14:45:00Z'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

const BlogsPage = () => {
  const [blogs, setBlogs] = useState(DUMMY_BLOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlog, setSelectedBlog] = useState<typeof DUMMY_BLOGS[0] | null>(null);

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.tags.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: number, newStatus: string) => {
    setBlogs(blogs.map(b => b.id === id ? { ...b, status: newStatus } : b));
    if (selectedBlog?.id === id) setSelectedBlog({ ...selectedBlog, status: newStatus });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      setBlogs(blogs.filter(b => b.id !== id));
      setSelectedBlog(null);
    }
  };

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
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {blog.status}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-base font-black text-white mb-1 truncate">{blog.title}</h3>
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-bold">
                    <div className="flex items-center gap-1"><LuUser size={12} className="text-blue-500" /> {blog.author}</div>
                    <div className="flex items-center gap-1"><LuTag size={12} className="text-blue-500" /> {blog.category}</div>
                  </div>
                </div>
              </motion.div>
            ))}
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
                      className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-all backdrop-blur-md"
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-black">
                      {selectedBlog.author.charAt(0)}
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

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Content Analysis</p>
                      <div className="prose prose-invert prose-sm max-w-none text-slate-400 line-clamp-6">
                        {selectedBlog.content.replace(/<[^>]*>/g, '')}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.split(',').map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-500 text-[10px] font-bold uppercase">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 gap-3">
                    {selectedBlog.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleStatusChange(selectedBlog.id, 'approved')}
                          className="py-4 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 hover:scale-[1.02] transition-all"
                        >
                          <LuCircleCheck size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleStatusChange(selectedBlog.id, 'rejected')}
                          className="py-4 rounded-2xl bg-red-500/10 text-red-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all border border-red-500/10"
                        >
                          <LuX size={14} /> Reject
                        </button>
                      </>
                    ) : (
                      <button 
                         onClick={() => handleStatusChange(selectedBlog.id, 'pending')}
                         className="col-span-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
                      >
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
