import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaCommentDots, FaUser, FaInfoCircle, FaCalendarAlt, FaEnvelope } from 'react-icons/fa';
import { fetchAdminChats, fetchAdminChatMessages } from '../../api/api';
import toast from 'react-hot-toast';

interface AuditPanelProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
}

export const AuditPanel: React.FC<AuditPanelProps> = ({ selectedChatId, onSelectChat }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatsSearchTerm, setChatsSearchTerm] = useState('');
  const [chatTypeFilter, setChatTypeFilter] = useState<'ALL' | 'GIG' | 'PRODUCT'>('ALL');
  
  // Active chat state
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load all chat rooms
  const loadChats = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchAdminChats();
      setChats(data);
    } catch (error) {
      console.error(error);
      if (!silent) toast.error('Failed to load active chats for audit.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadChats(false);
    // Poll the list of chats silently in the background
    const interval = setInterval(() => {
      loadChats(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages if a chatId is selected/changed
  useEffect(() => {
    if (selectedChatId) {
      const fetchChatLogs = async (silent = false) => {
        if (!silent) setMessagesLoading(true);
        try {
          const res = await fetchAdminChatMessages(selectedChatId);
          setActiveChat(res.chat);
          setMessages(res.messages);
        } catch (error) {
          console.error(error);
          if (!silent) toast.error('Failed to load chat transcript.');
        } finally {
          if (!silent) setMessagesLoading(false);
        }
      };
      
      fetchChatLogs(false);

      // Poll messages silently every 4 seconds
      const interval = setInterval(() => {
        fetchChatLogs(true);
      }, 4000);

      return () => clearInterval(interval);
    } else {
      setActiveChat(null);
      setMessages([]);
    }
  }, [selectedChatId]);

  // Scroll to bottom of message logs when loaded
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const getAvatarUrl = (profilePic: string | null, name: string) => {
    if (profilePic) {
      if (profilePic.startsWith('http') || profilePic.startsWith('data:image')) return profilePic;
      return `http://localhost:5001${profilePic}`;
    }
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`;
  };

  const getProductImageUrl = (images: string | string[]) => {
    let imgPath = '';
    if (Array.isArray(images) && images.length > 0) {
      imgPath = images[0];
    } else if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) imgPath = parsed[0];
      } catch {
        imgPath = images;
      }
    }
    if (!imgPath) return '';
    if (imgPath.startsWith('http') || imgPath.startsWith('data:image')) return imgPath;
    return `http://localhost:5001${imgPath}`;
  };

  const filteredChats = chats.filter(chat => {
    // Search filter
    const matchesSearch = 
      chat.id.toLowerCase().includes(chatsSearchTerm.toLowerCase()) ||
      (chat.buyer?.name || '').toLowerCase().includes(chatsSearchTerm.toLowerCase()) ||
      (chat.seller?.name || '').toLowerCase().includes(chatsSearchTerm.toLowerCase()) ||
      (chat.item?.title || '').toLowerCase().includes(chatsSearchTerm.toLowerCase());
      
    // Category filter
    const itemType = chat.item?.type;
    const matchesType = 
      chatTypeFilter === 'ALL' ||
      (chatTypeFilter === 'GIG' && itemType === 'GIG') ||
      (chatTypeFilter === 'PRODUCT' && (itemType === 'PRODUCT' || itemType === 'OFFICIAL_PRODUCT'));

    return matchesSearch && matchesType;
  });

  return (
    <div className="flex flex-col lg:flex-row h-[70vh] rounded-[24px] overflow-hidden border border-white/[0.08] bg-white/[0.02] backdrop-blur-md shadow-2xl">
      {/* LEFT PANEL: Chats List */}
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-white/[0.08] flex flex-col h-full bg-slate-950/20">
        <div className="p-4 border-b border-white/[0.08] space-y-3">
          <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
            <FaCommentDots className="text-rose-500" /> Active Chats List
          </h3>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search chat ID or buyer/seller..."
              className="w-full pl-9 pr-3 py-2 text-xs text-white bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500/50"
              value={chatsSearchTerm}
              onChange={(e) => setChatsSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
          </div>

          {/* Quick filters */}
          <div className="flex gap-1.5 pt-1">
            {(['ALL', 'GIG', 'PRODUCT'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setChatTypeFilter(filter)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border-none cursor-pointer ${
                  chatTypeFilter === filter
                    ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter === 'ALL' ? 'All Chats' : filter === 'GIG' ? 'Gigs' : 'Products'}
              </button>
            ))}
          </div>
        </div>

        {/* Chats Feed Container */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {loading ? (
            <div className="text-center py-10 text-xs text-slate-500">Loading audit chats...</div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const isActive = selectedChatId === chat.id;
              const productImg = getProductImageUrl(chat.item?.images);
              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
                    isActive
                      ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_4px_15px_-3px_rgba(244,63,94,0.15)]'
                      : 'bg-white/[0.01] border-transparent hover:bg-white/[0.04] hover:border-white/[0.05]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Item Thumbnail */}
                    {productImg ? (
                      <img src={productImg} alt="" className="w-10 h-10 object-cover rounded-lg border border-white/10 flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center text-slate-700 text-[9px] flex-shrink-0 font-bold uppercase">
                        No image
                      </div>
                    )}
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-white truncate">{chat.item?.title || 'Deleted Item'}</h4>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                          chat.item?.type === 'GIG' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {chat.item?.type || 'ITEM'}
                        </span>
                      </div>
                      
                      {/* Buyer and Seller info */}
                      <p className="text-[10px] text-slate-400 mt-1 truncate">
                        <span className="font-semibold text-slate-300">Buyer:</span> {chat.buyer?.name || 'Unknown'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        <span className="font-semibold text-slate-300">Seller:</span> {chat.seller?.name || 'Unknown'}
                      </p>
                      <p className="text-[9px] text-slate-600 mt-1.5 tracking-tight font-semibold">
                        ID: {chat.id.substring(0, 18)}...
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-xs text-slate-600">No chat sessions found.</div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Chat Transcript Visualizer */}
      <div className="flex-1 flex flex-col h-full bg-slate-950/10">
        {selectedChatId ? (
          activeChat ? (
            <>
              {/* Transcript Header info card */}
              <div className="p-4 border-b border-white/[0.08] bg-slate-950/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="text-left">
                    <h4 className="font-bold text-white text-sm tracking-tight">{activeChat.item?.title}</h4>
                    <p className="text-xs text-slate-500 font-semibold tracking-tight mt-0.5">
                      Chat Audit Log: <span className="font-mono text-[10px] text-rose-400 font-semibold select-all">{activeChat.id}</span>
                    </p>
                  </div>
                </div>

                {/* Buyer / Seller details badges */}
                <div className="flex flex-wrap gap-2.5">
                  <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 py-1 px-2.5 rounded-xl">
                    <img src={getAvatarUrl(activeChat.buyer?.profile_pic, activeChat.buyer?.name)} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <div className="text-[10px] text-left">
                      <p className="font-bold text-white max-w-[80px] truncate leading-none">{activeChat.buyer?.name}</p>
                      <span className="text-[8px] text-indigo-400 font-black uppercase tracking-wider">Buyer</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 py-1 px-2.5 rounded-xl">
                    <img src={getAvatarUrl(activeChat.seller?.profile_pic, activeChat.seller?.name)} alt="" className="w-5 h-5 rounded-full object-cover" />
                    <div className="text-[10px] text-left">
                      <p className="font-bold text-white max-w-[80px] truncate leading-none">{activeChat.seller?.name}</p>
                      <span className="text-[8px] text-emerald-400 font-black uppercase tracking-wider">Seller</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message History Feed */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3.5">
                {messagesLoading ? (
                  <div className="text-center py-20 text-slate-500 text-xs flex items-center justify-center gap-2">
                    <span className="animate-spin text-rose-500">&#9696;</span> Loading message transcript...
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => {
                    const isBuyer = msg.sender_id === activeChat.buyer_id;
                    const senderName = isBuyer ? activeChat.buyer?.name : activeChat.seller?.name;
                    const timeString = new Date(msg.createdAt).toLocaleString();
                    
                    return (
                      <div key={msg.id} className={`flex items-start gap-2.5 max-w-[85%] ${isBuyer ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
                        {/* Avatar */}
                        <img
                          src={getAvatarUrl(msg.sender?.profile_pic, senderName)}
                          alt={senderName}
                          className="w-7 h-7 rounded-full object-cover border border-white/10 flex-shrink-0 mt-1"
                        />
                        
                        <div>
                          {/* Sender name & bubble header */}
                          <div className={`flex items-center gap-1.5 mb-1 ${isBuyer ? 'justify-start' : 'justify-end'}`}>
                            <span className="text-[9px] font-bold text-slate-400">{senderName}</span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1 py-0.2 rounded-full ${
                              isBuyer ? 'bg-indigo-500/20 text-indigo-400' : 'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {isBuyer ? 'Buyer' : 'Seller'}
                            </span>
                          </div>

                          {/* Chat Bubble Body */}
                          <div className={`p-3 rounded-2xl text-left leading-normal ${
                            isBuyer 
                              ? 'bg-gradient-to-br from-indigo-600/90 to-indigo-700/80 text-white rounded-tl-none border border-indigo-500/20' 
                              : 'bg-gradient-to-br from-emerald-600/90 to-emerald-700/80 text-white rounded-tr-none border border-emerald-500/20'
                          }`}>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          </div>

                          {/* Timestamp */}
                          <span className={`text-[8px] text-slate-500 mt-1 block tracking-tight font-semibold ${isBuyer ? 'text-left' : 'text-right'}`}>
                            {timeString}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center text-slate-600">
                    <FaInfoCircle className="text-2xl text-slate-700 mb-2" />
                    <p className="text-xs">No message records exist for this chat room.</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-600 text-xs">Failed to load chat details.</div>
          )
        ) : (
          /* Empty state visual placeholders */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/5 select-none">
            <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-slate-500 mb-4 shadow-xl">
              <FaEnvelope className="text-3xl text-rose-500/80" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5 tracking-tight">No Active Audit Selected</h4>
            <p className="text-xs text-slate-500 max-w-[280px] leading-relaxed">
              Click the "View History" button in Peer Gigs or Customer Orders, or select an active chat session from the list on the left to inspect logs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
