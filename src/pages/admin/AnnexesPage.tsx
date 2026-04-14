import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaEye } from 'react-icons/fa';
import AnnexForm, { type AnnexData } from '../../components/annex/AnnexForm';
import { IoClose } from 'react-icons/io5';
import { fetchAnnexes, updateAnnexStatus as updateAnnexStatusApi, updateEntity } from '../../api/api';
import { Annex } from '../../types/schema';

// Annex Detail Modal Component
interface AnnexDetailModalProps {
  annex: Annex;
  onClose: () => void;
}

const AnnexDetailModal: React.FC<AnnexDetailModalProps> = ({ annex, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-8 custom-scrollbar">
        <div className='flex justify-between items-center mb-6'>
          <h2 className="text-2xl font-black text-white tracking-tight">{annex.title}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all"
          >
            <IoClose className='h-5 w-5'/>
          </button>
        </div>

        {annex.images && annex.images.length > 0 && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {annex.images.map((img, index) => (
              <img key={index} src={img} alt={`${annex.title} - Image ${index + 1}`} className="w-full h-40 object-cover rounded-md" />
            ))}
          </div>
        )}

        <div className="space-y-4 text-slate-300">
          <p className="flex items-center gap-2"><strong className="text-white">University/Institute:</strong> {annex.campus}</p>
          <p className="flex items-center gap-2"><strong className="text-white">Price:</strong> <span className="text-blue-400 font-black">{annex.price}</span></p>
          <div className="flex items-center gap-2">
            <strong className="text-white">Status:</strong> 
            <span className={`py-1 px-3 rounded-full text-[10px] font-black border ${
              annex.status === 'Approved' || annex.status === 'Active' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
              annex.status === 'Pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/20' :
              annex.status === 'Rejected' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
              'bg-slate-500/20 text-slate-400 border-slate-500/20'
            }`}>{annex.status}</span>
          </div>
          <p><strong className="text-white">Posted Date:</strong> {annex.createdAt ? new Date(annex.createdAt).toLocaleDateString() : annex.postedDate}</p>
          <p><strong className="text-white">Address:</strong> {annex.address}</p>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <strong className="text-white block mb-2">Description:</strong>
            <p className="text-sm leading-relaxed">{annex.description}</p>
          </div>

          {annex.features && annex.features.length > 0 && (
            <div>
              <strong>Features:</strong>
              <ul className="list-disc list-inside ml-4">
                {annex.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

          <h3 className="text-lg font-black text-white mt-8 mb-4 border-t border-white/[0.08] pt-6 tracking-tight">Contact Information</h3>
          {annex.contactName && <p><strong>Contact Name:</strong> {annex.contactName}</p>}
          {annex.contactPhone && <p><strong>Contact Phone:</strong> {annex.contactPhone}</p>}
          {annex.contactEmail && <p><strong>Alternative Email:</strong> {annex.contactEmail}</p>}
        </div>
      </div>
    </div>
  );
};




const AnnexesPage = () => {
  const [annexes, setAnnexes] = useState<Annex[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [selectedAnnexForView, setSelectedAnnexForView] = useState<Annex | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  // CHANGED: Edit functionality සඳහා අලුත් states
  const [editingAnnex, setEditingAnnex] = useState<Annex | null>(null); // Edit කරන Annex එක
  const [currentView, setCurrentView] = useState<'table' | 'editForm'>('table'); // වත්මන් View එක control කරන්න

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
            annex.id === annexId ? { ...annex, status: 'approved' } : annex
          )
        );
        alert(`Ads ID ${annexId} approved successfully.`);
      } catch (error) {
        console.error("Failed to approve annex:", error);
        alert("Failed to approve ads.");
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
            annex.id === annexId ? { ...annex, status: 'rejected' } : annex
          )
        );
        alert(`Ads ID ${annexId} rejected successfully`);
      } catch (error) {
        console.error("Failed to reject annex:", error);
        alert("Failed to reject ads.");
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
        // Mock delete via update status or actual delete if implemented in api.ts
        // For now, let's keep it in UI state or implement delete in StorageService
        setAnnexes(annexes.filter(annex => annex.id !== annexId));
        alert(`Ads ID ${annexId} deleted successfully.`);
      } catch (error) {
        console.error("Failed to delete annex:", error);
        alert("Failed to delete ads.");
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

  const handleUpdateAnnexSubmit = (updatedData: AnnexData, isEditing: boolean) => {
    if (isEditing && editingAnnex) {
      console.log('Updating Annex:', editingAnnex.id, updatedData);
      // මෙතන backend API call එක දාලා annex update කරන්න ඕන
      // දැනට dummy data update කරනවා
      setAnnexes(prevAnnexes =>
        prevAnnexes.map(annex =>
          annex.id === editingAnnex.id ? {
            ...annex,
            title: updatedData.title,
            campus: updatedData.selectedCampus || '', 
            address: updatedData.address,
            price: `Rs. ${updatedData.price}/month`,
            description: updatedData.description,
            features: updatedData.features,
            images: updatedData.existingImages.concat(updatedData.newImages.map((file: File) => URL.createObjectURL(file))), // Images update කරන්න
            contactName: updatedData.contactName,
            contactPhone: updatedData.contactPhone,
            contactEmail: updatedData.contactEmail,
          } : annex
        )
      );
      alert(`Ads ID ${editingAnnex.id} updated successfully!`);
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
      <h2 className="text-2xl font-extrabold text-white tracking-tight">Ads Management</h2>

      {currentView === 'table' ? (
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
            } as AnnexData : undefined}
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
