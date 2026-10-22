import { useState, useEffect } from 'react';
import { LuCheck, LuX, LuGraduationCap, LuBriefcase, LuChevronLeft, LuEye, LuCreditCard, LuFileText, LuExternalLink, LuClock, LuCheckCircle2, LuXCircle } from 'react-icons/lu';
import toast from 'react-hot-toast';
import { 
  fetchAdminProposals, 
  fetchAdminProposalChats, 
  updateAdminProposalStatus, 
  fetchAdminProposalChatMessages,
  fetchAdminProposalPayments,
  updateAdminProposalPaymentStatus
} from '../../api/api';

type TabView = 'PROFILES' | 'CHATS' | 'CHAT_MESSAGES' | 'PAYMENTS';

const ProposalsPage = () => {
  const [activeTab, setActiveTab] = useState<TabView>('PROFILES');
  
  // Data States
  const [proposals, setProposals] = useState<any[]>([]);
  const [chats, setChats] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  // Fetch Data
  useEffect(() => {
    if (activeTab === 'PROFILES') {
      loadProposals();
    } else if (activeTab === 'CHATS') {
      loadChats();
    } else if (activeTab === 'PAYMENTS') {
      loadPayments();
    }
  }, [activeTab]);

  const loadProposals = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminProposals();
      // Filter out already verified users for the moderation queue
      setProposals(Array.isArray(data) ? data.filter((p: any) => p.user && !p.user.is_verified_student) : []);
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
      setChats(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminProposalPayments();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayment = async (id: string | number, userName: string) => {
    try {
      await updateAdminProposalPaymentStatus(id, 'APPROVED');
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
      toast.success(`Verified & Activated Premium for ${userName}! 👑`);
    } catch (err) {
      toast.error('Failed to approve payment');
    }
  };

  const handleRejectPayment = async (id: string | number, userName: string) => {
    try {
      await updateAdminProposalPaymentStatus(id, 'REJECTED');
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'REJECTED' } : p));
      toast.error(`Payment rejected for ${userName}.`);
    } catch (err) {
      toast.error('Failed to reject payment');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Proposals & Chats</h2>
          <p className="text-xs text-slate-500 font-semibold tracking-wide mt-1">Monitor campus matchmaking profiles, verified badges, and membership payments</p>
        </div>
      </div>

      {/* Tab Navigation */}
      {activeTab !== 'CHAT_MESSAGES' && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('PROFILES')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'PROFILES' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Moderate Profiles
          </button>
          <button
            onClick={() => setActiveTab('CHATS')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
              activeTab === 'CHATS' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Monitor Chats
          </button>
          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PAYMENTS' 
                ? 'bg-amber-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <LuCreditCard size={14} /> Verify Payments
            {payments.filter(p => p.status === 'pending').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                {payments.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-wider text-xs animate-pulse">Loading Proposals...</div>}

      {/* PROFILES TAB */}
      {!loading && activeTab === 'PROFILES' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Profile Moderation Queue</h3>
              <p className="text-xs text-slate-500 font-normal">Review and verify student proposals and identity proofs.</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
              {proposals.length} Pending Approval
            </span>
          </div>

          {proposals.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
              All proposals have been verified!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {proposals.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-base font-bold text-slate-900">{p.user?.name || 'Candidate'}, {p.age}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.nicFront ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {p.nicFront ? '🛡️ NIC Submitted' : 'Pending Verification'}
                      </span>
                    </div>

                    <div className="mb-2.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 inline-block">
                        {p.categoryBadge || '🎓 Campus Graduate'}
                      </span>
                    </div>

                    <p className="text-xs text-rose-600 font-semibold flex items-center gap-2 mb-1.5">
                      <LuBriefcase size={14} /> {p.profession || 'Not Specified'}
                    </p>
                    <p className="text-xs text-slate-500 font-normal flex items-center gap-1.5">
                      <LuGraduationCap size={14} className="text-blue-600" /> {p.university || p.education_category} • 📍 {p.district}
                    </p>

                    {/* NIC Preview if uploaded */}
                    {(p.nicFront || p.nicBack) && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">National ID Proofs</p>
                        <div className="flex gap-2">
                          {p.nicFront && (
                            <a href={p.nicFront} target="_blank" rel="noopener noreferrer" className="block text-[11px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                              📄 View NIC Front
                            </a>
                          )}
                          {p.nicBack && (
                            <a href={p.nicBack} target="_blank" rel="noopener noreferrer" className="block text-[11px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                              📄 View NIC Back
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleVerify(p.id, p.user?.name || 'User')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border-none cursor-pointer flex items-center justify-center gap-1 transition-all shadow-xs"
                    >
                      <LuCheck size={14} /> Approve & Verify Badge
                    </button>
                    <button
                      onClick={() => handleReject(p.id, p.user?.name || 'User')}
                      className="py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs uppercase tracking-wider rounded-xl border border-rose-200 cursor-pointer transition-all"
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
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Active Matches Monitoring</h3>
              <p className="text-xs text-slate-500 font-normal">Audit active proposal matches and their conversation logs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chats.map(chat => (
              <div key={chat.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
                <div className="flex items-center gap-3.5">
                  <div className="flex -space-x-3">
                    <img src={chat.Sender?.profile_pic || 'https://via.placeholder.com/150'} alt="Sender" className="w-9 h-9 rounded-full border-2 border-white object-cover" />
                    <img src={chat.Receiver?.profile_pic || 'https://via.placeholder.com/150'} alt="Receiver" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{chat.Sender?.name?.split(' ')[0]} & {chat.Receiver?.name?.split(' ')[0]}</h4>
                    <p className="text-[10px] font-semibold text-slate-400">Matched on: {new Date(chat.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => openChatLog(chat.id)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all cursor-pointer border border-slate-200"
                  title="View chat history"
                >
                  <LuEye size={18} />
                </button>
              </div>
            ))}
            {chats.length === 0 && (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
                No active matches found
              </div>
            )}
          </div>
        </>
      )}

      {/* CHAT MESSAGES LOG (READ-ONLY) */}
      {!loading && activeTab === 'CHAT_MESSAGES' && activeChat && (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden flex flex-col h-[650px] shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
            <button 
              onClick={() => setActiveTab('CHATS')}
              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
            >
              <LuChevronLeft size={20} />
            </button>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Chat Log: {activeChat.Sender?.name} <span className="text-slate-400 font-normal mx-1.5">&</span> {activeChat.Receiver?.name}
              </h3>
              <p className="text-[10px] text-rose-600 uppercase font-bold tracking-wider mt-0.5">Read-Only Moderation Mode</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50 custom-scrollbar">
            {chatMessages.length === 0 ? (
              <div className="text-center text-xs font-semibold text-slate-400 mt-10">No messages exchanged yet.</div>
            ) : (
              chatMessages.map((msg) => {
                const isUser1 = msg.sender_id === activeChat.sender_id;

                return (
                  <div key={msg.id} className={`flex ${isUser1 ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-end gap-2.5 max-w-[75%] ${isUser1 ? 'flex-row-reverse' : 'flex-row'}`}>
                      <img src={msg.Sender?.profile_pic || 'https://via.placeholder.com/150'} alt="Avatar" className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200" />
                      
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isUser1 ? 'bg-blue-600 text-white rounded-br-xs shadow-xs' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'}`}>
                        <div className="font-bold text-[9px] opacity-70 mb-1 uppercase tracking-wider">{msg.Sender?.name}</div>
                        <p>{msg.text}</p>
                        <div className="text-[9px] opacity-60 text-right mt-1 font-medium">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

      {/* PAYMENTS TAB */}
      {!loading && activeTab === 'PAYMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Proposal Membership Payments Queue</h3>
              <p className="text-xs text-slate-500 font-normal">Review bank deposit slips and activate 3-Month Classic or 6-Month VIP memberships.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs">
                {payments.filter(p => p.status === 'pending').length} Pending Review
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                {payments.filter(p => p.status === 'APPROVED').length} Active Members
              </span>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-xs">
              No proposal payments submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {payments.map((p) => {
                const isVIP = p.plan === 'vip_6m' || p.amount === 4990;

                return (
                  <div key={p.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{p.user?.name || 'Member'}</h4>
                          <p className="text-xs text-slate-400">{p.user?.email}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          p.status === 'APPROVED' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : p.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                        }`}>
                          {p.status === 'APPROVED' ? '✓ Premium Active' : p.status === 'REJECTED' ? '✕ Rejected' : '⏳ Pending Review'}
                        </span>
                      </div>

                      {/* Plan Badge & Price */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 mb-3">
                        <div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                            isVIP ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isVIP ? '👑 VIP Premium (මාස 6)' : '⭐ Classic Plan (මාස 3)'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-slate-900">
                            Rs. {p.amount ? p.amount.toLocaleString() : (isVIP ? '4,990' : '2,990')}
                          </span>
                        </div>
                      </div>

                      {/* Details List */}
                      <div className="space-y-1.5 text-xs text-slate-600">
                        {p.whatsapp_number && (
                          <p className="flex items-center justify-between">
                            <span className="text-slate-400">WhatsApp:</span>
                            <span className="font-semibold text-slate-800">{p.whatsapp_number}</span>
                          </p>
                        )}
                        {p.reference_number && (
                          <p className="flex items-center justify-between">
                            <span className="text-slate-400">Bank Ref:</span>
                            <span className="font-mono font-semibold text-slate-800">{p.reference_number}</span>
                          </p>
                        )}
                        {p.payment_date && (
                          <p className="flex items-center justify-between">
                            <span className="text-slate-400">Transfer Date:</span>
                            <span className="font-medium text-slate-700">{p.payment_date}</span>
                          </p>
                        )}
                        <p className="flex items-center justify-between">
                          <span className="text-slate-400">Submitted:</span>
                          <span className="text-slate-500 font-medium">
                            {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </p>
                      </div>

                      {/* Slip preview */}
                      {p.slip_url && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => setSelectedSlip(p.slip_url)}
                            className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <LuFileText size={14} /> View Transfer Slip Receipt
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {p.status === 'pending' && (
                      <div className="flex gap-2 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleApprovePayment(p.id, p.user?.name || 'Member')}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <LuCheck size={14} /> Approve & Activate
                        </button>
                        <button
                          onClick={() => handleRejectPayment(p.id, p.user?.name || 'Member')}
                          className="py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs uppercase tracking-wider rounded-xl border border-rose-200 cursor-pointer transition-all"
                        >
                          <LuX size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Slip Modal View */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedSlip(null)}>
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-3xl p-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h4 className="text-sm font-bold text-slate-800">Bank Transfer Slip Receipt</h4>
              <button onClick={() => setSelectedSlip(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer">
                <LuX size={20} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center">
              <img src={selectedSlip} alt="Deposit Slip" className="max-w-full h-auto rounded-xl shadow-xs" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsPage;
