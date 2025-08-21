import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaEye } from 'react-icons/fa';
import AnnexForm from '../../components/annex/AnnexForm';
import { IoClose } from 'react-icons/io5';

interface Annex {
  id: string;
  title: string;
  campus: string;
  price: string;
  status: 'Pending' | 'Active' | 'Rejected' | 'Expired';
  postedDate: string;
  images: string[];
  description: string;
  address: string;
  features: string[];
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
}

const DUMMY_ANNEXES: Annex[] = [
  {
    id: 'a1',
    title: 'Peradeniya Annex - Single Room',
    campus: 'University of Peradeniya',
    price: 'Rs. 15,000/month',
    status: 'Pending',
    postedDate: '2024-07-20',
    images: ['https://placehold.co/300x200/FF0000/FFFFFF?text=Annex1'],
    description: 'A cozy single room near the university with all basic amenities. Ideal for a single student looking for a quiet place.',
    address: 'Peradeniya Rd, Kandy',
    features: ['Single Room', 'Attached Bathroom', 'Furnished', 'Study Table'],
    contactName: 'Kasun Perera',
    contactPhone: '0712345678',
    contactEmail: 'kasun@example.com'
  },
  {
    id: 'a2',
    title: 'Colombo Annex - Spacious 2BHK',
    campus: 'University of Colombo',
    price: 'Rs. 30,000/month',
    status: 'Active',
    postedDate: '2024-07-15',
    images: ['https://placehold.co/300x200/00FF00/000000?text=Annex2', 'https://placehold.co/300x200/00FF00/000000?text=Annex2B'],
    description: '2-bedroom house ideal for students. Located close to public transport and supermarkets.',
    address: 'Bambalapitiya, Colombo 04',
    features: ['2 Bedrooms', 'Attached Bathroom', 'Furnished', 'Parking', 'Hot Water'],
    contactName: 'Nimal Bandara',
    contactPhone: '0778765432',
    contactEmail: 'nimal@example.com'
  },
  {
    id: 'a3',
    title: 'Moratuwa Annex - Shared Room',
    campus: 'University of Moratuwa',
    price: 'Rs. 10,000/month',
    status: 'Rejected',
    postedDate: '2024-07-22',
    images: ['https://placehold.co/300x200/0000FF/FFFFFF?text=Annex3'],
    description: 'Shared room available for female students. Friendly neighborhood and walkable distance to university.',
    address: 'Katubedda, Moratuwa',
    features: ['Shared Room', 'Parking', 'Electricity Included'],
    contactName: 'Priya Fernando',
    contactPhone: '0754567890',
    contactEmail: 'priya@example.com'
  },
  {
    id: 'a4',
    title: 'Ruhunu Annex - New Building',
    campus: 'University of Ruhuna',
    price: 'Rs. 20,000/month',
    status: 'Active',
    postedDate: '2024-07-18',
    images: ['https://placehold.co/300x200/FFFF00/000000?text=Annex4', 'https://placehold.co/300x200/FFFF00/000000?text=Annex4B', 'https://placehold.co/300x200/FFFF00/000000?text=Annex4C'],
    description: 'Brand new annex with modern facilities. Close to Ruhuna University main gate.',
    address: 'Wellamadama, Matara',
    features: ['Single Room', 'Attached Bathroom', 'AC', 'Washing Machine'],
    contactName: 'Samantha Silva',
    contactPhone: '0701234567',
    contactEmail: 'samantha@example.com'
  },
];

// Annex Detail Modal Component
interface AnnexDetailModalProps {
  annex: Annex;
  onClose: () => void;
}

const AnnexDetailModal: React.FC<AnnexDetailModalProps> = ({ annex, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6">
        <div className='flex justify-between items-center mb-4'>
          <h2 className="text-2xl font-bold text-gray-800">{annex.title}</h2>
          <div
            onClick={onClose}
            className="bg-gray-300 p-2 rounded-md cursor-pointer"
          >
            <IoClose className='h-4 w-4'/>
          </div>
        </div>

        {annex.images && annex.images.length > 0 && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {annex.images.map((img, index) => (
              <img key={index} src={img} alt={`${annex.title} - Image ${index + 1}`} className="w-full h-40 object-cover rounded-md" />
            ))}
          </div>
        )}

        <div className="space-y-3 text-gray-700">
          <p><strong>University/Institute:</strong> {annex.campus}</p>
          <p><strong>Price:</strong> {annex.price}</p>
          <p><strong>Status:</strong> <span className={`py-1 px-3 rounded-full text-xs font-semibold ${annex.status === 'Active' ? 'bg-green-200 text-green-800' :
              annex.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                annex.status === 'Rejected' ? 'bg-red-200 text-red-800' :
                  'bg-gray-200 text-gray-800'
            }`}>{annex.status}</span></p>
          <p><strong>Posted Date:</strong> {annex.postedDate}</p>
          <p><strong>Address:</strong> {annex.address}</p>
          <p><strong>Description:</strong> {annex.description}</p>

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

          <h3 className="text-xl font-semibold text-gray-800 mt-5 border-t pt-4">Contact Information</h3>
          {annex.contactName && <p><strong>Contact Name:</strong> {annex.contactName}</p>}
          {annex.contactPhone && <p><strong>Contact Phone:</strong> {annex.contactPhone}</p>}
          {annex.contactEmail && <p><strong>Alternative Email:</strong> {annex.contactEmail}</p>}
        </div>
      </div>
    </div>
  );
};


const AnnexesPage = () => {
  const [annexes, setAnnexes] = useState<Annex[]>(DUMMY_ANNEXES);
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
    setLoading(true);
    const timer = setTimeout(() => {
      setAnnexes(DUMMY_ANNEXES);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
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
  const handleApproveAnnex = (annexId: string) => {
    if (window.confirm(`Do you want to approve this ads? (ID: ${annexId})`)) {
      console.log(`Approving annex with ID: ${annexId}`);
      setAnnexes(prevAnnexes =>
        prevAnnexes.map(annex =>
          annex.id === annexId ? { ...annex, status: 'Active' } : annex
        )
      );
      alert(`Ads ID ${annexId} approved successfully.`);
    }
  };

  // Handle annex rejection
  const handleRejectAnnex = (annexId: string) => {
    if (window.confirm(`Do you want to reject this ads? (ID: ${annexId})`)) {
      console.log(`Rejecting annex with ID: ${annexId}`);
      setAnnexes(prevAnnexes =>
        prevAnnexes.map(annex =>
          annex.id === annexId ? { ...annex, status: 'Rejected' } : annex
        )
      );
      alert(`Ads ID ${annexId} rejected successfully`);
    }
  };

  // CHANGED: Annex edit functionality
  const handleEditAnnex = (annex: Annex) => { // annex object එකම receive කරන්න
    setEditingAnnex(annex); // Edit කරන Annex එක state එකට දාන්න
    setCurrentView('editForm'); // View එක editForm එකට වෙනස් කරන්න
  };

  // Handle annex delete
  const handleDeleteAnnex = (annexId: string) => {
    if (window.confirm(`Do you want to delete ads? (ID ${annexId})`)) {
      console.log(`Deleting annex with ID: ${annexId}`);
      setAnnexes(annexes.filter(annex => annex.id !== annexId));
      alert(`Ads ID ${annexId} deleted successfully.`);
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

  const handleUpdateAnnexSubmit = (updatedData: any, isEditing: boolean) => {
    if (isEditing && editingAnnex) {
      console.log('Updating Annex:', editingAnnex.id, updatedData);
      // මෙතන backend API call එක දාලා annex update කරන්න ඕන
      // දැනට dummy data update කරනවා
      setAnnexes(prevAnnexes =>
        prevAnnexes.map(annex =>
          annex.id === editingAnnex.id ? {
            ...annex,
            title: updatedData.title,
            campus: updatedData.selectedCampus, 
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
    <div className="bg-gray-700 border border-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-6">Ads Management</h2>

      {currentView === 'table' ? (
        <>
          {/* Search and Filter Section */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search Using Title, Campus or Name..."
                className="w-full pl-10 pr-4 py-2 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <select
              className="w-full md:w-auto text-white py-2 pl-3 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-gray-700
              [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2020%2020%22%3E%3Cpath%20fill=%22none%22%20stroke=%22%23fff%22%20stroke-width=%222%22%20d=%22M6%208l4%204%204-4%22/%3E%3C/svg%3E')]
              bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem]"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Ads</option>
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-10 text-white">Ads Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-200 border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-300 text-left text-black uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Title</th>
                    <th className="py-3 px-6 text-left">Campus/Institute</th>
                    <th className="py-3 px-6 text-left">Price</th>
                    <th className="py-3 px-6 text-left">Status</th>
                    <th className="py-3 px-6 text-left">Date</th>
                    <th className="py-3 px-6 text-left">Name</th>
                    <th className="py-3 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-black text-sm font-light">
                  {filteredAnnexes.length > 0 ? (
                    filteredAnnexes.map(annex => (
                      <tr key={annex.id} className="border-b border-gray-200 hover:bg-gray-300">
                        <td className="py-3 px-6 text-left whitespace-nowrap">
                          <div className="flex items-center">
                            <span>{annex.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-left">{annex.campus}</td>
                        <td className="py-3 px-6 text-left">{annex.price}</td>
                        <td className="py-3 px-6 text-left">
                          <span className={`py-1 px-3 rounded-full text-xs font-semibold ${annex.status === 'Active' ? 'bg-green-200 text-green-800' :
                              annex.status === 'Pending' ? 'bg-yellow-200 text-yellow-800' :
                                annex.status === 'Rejected' ? 'bg-red-200 text-red-800' :
                                  'bg-gray-200 text-gray-800'
                            }`}>
                            {annex.status}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-left">{annex.postedDate}</td>
                        <td className="py-3 px-6 text-left">{annex.contactName}</td>
                        <td className="py-3 px-6 text-center">
                          <div className="flex item-center justify-center">
                            {/* View Button */}
                            <button
                              onClick={() => handleViewAnnex(annex)}
                              className="w-8 h-8 mr-2 transform text-black hover:text-blue-600 hover:scale-110"
                              title="View Details"
                            >
                              <FaEye />
                            </button>

                            {annex.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveAnnex(annex.id)}
                                  className="w-8 h-8 mr-2 transform text-black hover:text-green-500 hover:scale-110"
                                  title="Approve"
                                >
                                  <FaCheckCircle />
                                </button>
                                <button
                                  onClick={() => handleRejectAnnex(annex.id)}
                                  className="w-8 h-8 mr-2 transform text-black hover:text-red-500 hover:scale-110"
                                  title="Reject"
                                >
                                  <FaTimesCircle />
                                </button>
                              </>
                            )}
                            {/* CHANGED: Edit button එක Annex object එක handleEditAnnex වෙත යවයි */}
                            <button
                              onClick={() => handleEditAnnex(annex)}
                              className="w-8 h-8 mr-2 transform text-black hover:text-blue-500 hover:scale-110"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnex(annex.id)}
                              className="w-8 h-8 transform text-black hover:text-red-500 hover:scale-110"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-white">No Ads.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        // CHANGED: Edit form එක පෙන්වන්න
        <div className="mt-8">
          <h3 className="text-lg font-bold text-white mb-4">Edit Annex Ad</h3>
          <AnnexForm
            initialData={editingAnnex}
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
