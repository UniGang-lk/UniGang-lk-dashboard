import { useState, useEffect } from 'react';
import { LuCheck, LuX, LuGraduationCap, LuBriefcase, LuChevronLeft, LuEye } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { fetchAdminProposals, fetchAdminProposalChats, updateAdminProposalStatus, fetchAdminProposalChatMessages } from '../../api/api';

type TabView = 'PROFILES' | 'CHATS' | 'CHAT_MESSAGES';

const ProposalsPage = () => {
  const [activeTab, setActiveTab] = useState<TabView>('PROFILES');
  
  // Data States
  const [proposals, setProposals] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Profiles
  useEffect(() => {
    if (activeTab === 'PROFILES') {
      loadProposals();
    } else if (activeTab === 'CHATS') {
      loadChats();
    }
  }, [activeTab]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminProposals();
      // Filter out already verified users for the moderation queue
      setProposals(data.filter((p: any) => p.user && !p.user.is_verified_student));
    } catch (err) {
      toast.error('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminProposalChats();
      setChats(data);
    } catch (err) {
      toast.error('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number, name: string) => {
    try {
      await updateAdminProposalStatus(id, 'APPROVED');
      setProposals(prev => prev.filter(p => p.id !== id));
      toast.success(`Approved & Verified Proposal for ${name}!`);
    } catch (err) {
      toast.error('Error verifying user');
    }
  };

  const handleReject = async (id: number, name: string) => {
    try {
      await updateAdminProposalStatus(id, 'REJECTED');
      setProposals(prev => prev.filter(p => p.id !== id));
      toast.error(`Rejected Proposal submission for ${name}.`);
    } catch (err) {
      toast.error('Error rejecting proposal');
    }
  };

  const openChatLog = async (matchId: number) => {
    try {
      setLoading(true);
      const data = await fetchAdminProposalChatMessages(matchId.toString());
      setActiveChat(data.match);
      setChatMessages(data.messages);
      setActiveTab('CHAT_MESSAGES');
    } catch (err) {
      toast.error('Failed to fetch chat logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Proposals & Chats</h1>
          <p className="text-sm text-slate-400 mt-1">Monitor Elite matchmaking profiles and private chats</p>
        </div>
      </div>

      {/* Tab Navigation */}
      {activeTab !== 'CHAT_MESSAGES' && (
        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            onClick={() => setActiveTab('PROFILES')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'PROFILES' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            Moderate Profiles
          </button>
          <button
            onClick={() => setActiveTab('CHATS')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'CHATS' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
          >
            Monitor Chats
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <div className="text-center py-12 text-slate-500 text-sm">Loading...</div>}

      {/* PROFILES TAB */}
      {!loading && activeTab === 'PROFILES' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Profile Moderation Control</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Review and verify student proposals and identity proofs.</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-500 font-bold text-xs">
              {proposals.length} Pending Approval
            </span>
          </div>

          {proposals.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 font-medium text-xs">
              All proposals have been verified!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 transition-transform hover:scale-[1.02]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-black text-white">{p.user?.name || 'Unknown'}, {p.age}</h4>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        {p.blur_photo ? 'ID Uploaded' : 'Pending Upload'}
                      </span>
                    </div>
                    <p className="text-xs text-rose-400 font-bold flex items-center gap-2 mb-2">
                      <LuBriefcase size={14} /> {p.profession}
                    </p>
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-2">
                      <LuGraduationCap size={14} /> {p.university} • 📍 {p.district}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => handleVerify(p.id, p.user?.name || 'User')}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl border-none cursor-pointer flex items-center justify-center gap-1 transition-colors"
                    >
                      <LuCheck size={14} /> Approve & Verify
                    </button>
                    <button
                      onClick={() => handleReject(p.id, p.user?.name || 'User')}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-rose-500 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-wider rounded-xl border-none cursor-pointer transition-colors"
                    >
                      <LuX size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CHATS TAB */}
      {!loading && activeTab === 'CHATS' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Active Matches Monitoring</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Audit active proposal matches and their conversation logs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chats.map(chat => (
              <div key={chat.id} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    <img src={chat.Sender?.profile_pic || 'https://via.placeholder.com/150'} alt="Sender" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover" />
                    <img src={chat.Receiver?.profile_pic || 'https://via.placeholder.com/150'} alt="Receiver" className="w-10 h-10 rounded-full border-2 border-slate-900 object-cover z-10" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{chat.Sender?.name?.split(' ')[0]} & {chat.Receiver?.name?.split(' ')[0]}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Matched on: {new Date(chat.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => openChatLog(chat.id)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-slate-600 dark:text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LuEye size={20} />
                </button>
              </div>
            ))}
            {chats.length === 0 && <p className="text-sm text-slate-500">No active matches found.</p>}
          </div>
        </>
      )}

      {/* CHAT MESSAGES LOG (READ-ONLY) */}
      {!loading && activeTab === 'CHAT_MESSAGES' && activeChat && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[700px] shadow-2xl">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50 dark:bg-slate-950/50">
            <button 
              onClick={() => setActiveTab('CHATS')}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <LuChevronLeft size={24} />
            </button>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Chat Log: {activeChat.Sender?.name} <span className="text-slate-500 font-normal mx-2">&</span> {activeChat.Receiver?.name}
              </h3>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] text-rose-500 mt-1">Read-Only Moderation Mode</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
            {chatMessages.length === 0 ? (
              <div className="text-center text-sm font-bold text-slate-500 mt-10">No messages exchanged yet.</div>
            ) : (
              chatMessages.map((msg) => {
                const isUser1 = msg.sender_id === activeChat.sender_id;

                return (
                  <div key={msg.id} className={`flex ${isUser1 ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-3 max-w-[75%] ${isUser1 ? 'flex-row-reverse' : 'flex-row'}`}>
                      <img src={msg.Sender?.profile_pic || 'https://via.placeholder.com/150'} alt="Avatar" className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-700" />
                      
                      <div className={`p-4 rounded-2xl text-sm shadow-sm ${isUser1 ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'}`}>
                        <div className="font-bold text-[10px] opacity-70 mb-1.5 uppercase tracking-wider">{msg.Sender?.name}</div>
                        <p className="leading-relaxed">{msg.text}</p>
                        <div className="text-[10px] opacity-50 text-right mt-2 font-medium">
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsPage;
