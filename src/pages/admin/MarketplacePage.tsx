import { useState, useEffect } from 'react';
import { 
  FaTrash, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSearch, 
  FaShoppingBag, 
  FaBriefcase, 
  FaStar, 
  FaEye, 
  FaChevronLeft, 
  FaChevronRight,
  FaPlus,
  FaBoxOpen,
  FaClipboardList,
  FaSpinner,
  FaPhone,
  FaMapMarkerAlt,
  FaEdit,
  FaHistory
} from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import { 
  fetchAdminMarketItems, 
  updateMarketItemStatus, 
  deleteMarketItem,
  createMarketItem,
  fetchAdminOrders,
  updateOrderStatus,
  updateMarketItem
} from '../../api/api';
import { AuditPanel } from '../../components/admin/AuditPanel';

const MarketplacePage = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
  
  // Tabs: gigs, products, store, orders, audit
  const [activeTab, setActiveTab] = useState<'gigs' | 'products' | 'store' | 'orders' | 'audit'>('gigs');
  const [selectedAuditChatId, setSelectedAuditChatId] = useState<string | null>(null);
  
  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Add Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    description: '',
    images: [] as File[],
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Edit Product Form State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    price: '',
    description: '',
    status: '',
    condition: '',
    newImages: [] as File[]
  });
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [updatingItem, setUpdatingItem] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminMarketItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to load marketplace items:', error);
      toast.error('Failed to load marketplace items.');
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      toast.error('Failed to load customer orders.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    } else {
      loadItems();
    }
  }, [activeTab]);

  const handleApprove = async (id: string | number) => {
    try {
      await updateMarketItemStatus(id, 'AVAILABLE');
      toast.success('Listing approved successfully.');
      loadItems();
    } catch (error) {
      console.error(error);
      toast.error('Failed to approve listing.');
    }
  };

  const handleReject = async (id: string | number) => {
    try {
      await updateMarketItemStatus(id, 'SUSPENDED');
      toast.error('Listing suspended/rejected.');
      loadItems();
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject/suspend listing.');
    }
  };

  const handleDelete = async (id: string | number) => {
    setConfirmDeleteId(id);
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteMarketItem(confirmDeleteId);
      toast.success('Listing deleted.');
      loadItems();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete listing.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string | number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}.`);
      loadOrders();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order status.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, ...filesArray]
      }));

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.description) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (newProduct.images.length === 0) {
      toast.error('Please upload at least one image.');
      return;
    }

    setSubmittingProduct(true);
    try {
      await createMarketItem({
        title: newProduct.title,
        type: 'OFFICIAL_PRODUCT',
        price: newProduct.price,
        description: newProduct.description,
        images: newProduct.images
      });

      toast.success('Official product published successfully!');
      setShowAddProductModal(false);
      setNewProduct({ title: '', price: '', description: '', images: [] });
      setImagePreviews([]);
      loadItems();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create product.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setEditForm({
      title: item.title,
      price: String(item.price),
      description: item.description,
      status: item.status,
      condition: item.condition || 'Not Applicable',
      newImages: []
    });
    
    // Set previews to existing images
    const existingPreviews = item.images ? item.images.map((img: string) => getImageUrl(img)) : [];
    setEditImagePreviews(existingPreviews);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setEditForm(prev => ({
        ...prev,
        newImages: [...prev.newImages, ...filesArray]
      }));

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setEditImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeEditImage = (index: number) => {
    setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
    const fileIndex = index - (editingItem.images ? editingItem.images.length : 0);
    if (fileIndex >= 0) {
      setEditForm(prev => ({
        ...prev,
        newImages: prev.newImages.filter((_, i) => i !== fileIndex)
      }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title || !editForm.price || !editForm.description) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setUpdatingItem(true);
    try {
      await updateMarketItem(editingItem.id, {
        title: editForm.title,
        price: editForm.price,
        description: editForm.description,
        status: editForm.status,
        condition: editForm.condition,
        images: editForm.newImages
      });

      toast.success('Listing updated successfully.');
      setEditingItem(null);
      setEditImagePreviews([]);
      loadItems();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to update listing.');
    } finally {
      setUpdatingItem(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:image')) return url;
    return `http://localhost:5001${url}`;
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.seller?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'gigs') return matchesSearch && item.type === 'GIG';
    if (activeTab === 'products') return matchesSearch && item.type === 'PRODUCT';
    if (activeTab === 'store') return matchesSearch && item.type === 'OFFICIAL_PRODUCT';
    return false;
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.item?.title || '').toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      (order.buyer?.name || '').toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      (order.delivery_location || '').toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      (order.delivery_phone || '').includes(orderSearchTerm);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <FaShoppingBag className="text-blue-500" /> Marketplace Management
        </h2>

        {activeTab === 'store' && (
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-xl transition-all border-none cursor-pointer"
          >
            <FaPlus /> Add Store Product
          </button>
        )}
      </div>

      {/* Premium Glassmorphic Tab Grid Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tab 1: Peer Gigs */}
        <div
          onClick={() => setActiveTab('gigs')}
          className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
            activeTab === 'gigs'
              ? 'bg-blue-600/10 border-blue-500/60 shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)]'
              : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'gigs' ? 'bg-blue-500/25 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-slate-400'
            }`}>
              <FaBriefcase className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm tracking-tight">Peer Gigs</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Student freelance services</p>
            </div>
          </div>
          {activeTab === 'gigs' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.8)]"></div>
          )}
        </div>

        {/* Tab 2: Peer Products */}
        <div
          onClick={() => setActiveTab('products')}
          className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
            activeTab === 'products'
              ? 'bg-emerald-600/10 border-emerald-500/60 shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)]'
              : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'products' ? 'bg-emerald-500/25 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-slate-400'
            }`}>
              <FaShoppingBag className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm tracking-tight">Peer Products</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Used student items & gear</p>
            </div>
          </div>
          {activeTab === 'products' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-emerald-500 rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,0.8)]"></div>
          )}
        </div>

        {/* Tab 3: Official Store */}
        <div
          onClick={() => setActiveTab('store')}
          className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
            activeTab === 'store'
              ? 'bg-amber-600/10 border-amber-500/60 shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]'
              : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'store' ? 'bg-amber-500/25 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-slate-400'
            }`}>
              <FaBoxOpen className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm tracking-tight">Official Store</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Bouquets, bears & merch</p>
            </div>
          </div>
          {activeTab === 'store' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-amber-500 rounded-t-full shadow-[0_-2px_10px_rgba(245,158,11,0.8)]"></div>
          )}
        </div>

        {/* Tab 4: Customer Orders */}
        <div
          onClick={() => setActiveTab('orders')}
          className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
            activeTab === 'orders'
              ? 'bg-purple-600/10 border-purple-500/60 shadow-[0_0_25px_-5px_rgba(139,92,246,0.3)]'
              : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'orders' ? 'bg-purple-500/25 text-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.2)]' : 'bg-white/5 text-slate-400'
            }`}>
              <FaClipboardList className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm tracking-tight">Customer Orders</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Track & fulfill user sales</p>
            </div>
          </div>
          {activeTab === 'orders' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-purple-500 rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.8)]"></div>
          )}
        </div>

        {/* Tab 5: Audit Logs */}
        <div
          onClick={() => setActiveTab('audit')}
          className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
            activeTab === 'audit'
              ? 'bg-rose-600/10 border-rose-500/60 shadow-[0_0_25px_-5px_rgba(244,63,94,0.3)]'
              : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className={`p-3 rounded-xl transition-all duration-300 ${
              activeTab === 'audit' ? 'bg-rose-500/25 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'bg-white/5 text-slate-400'
            }`}>
              <FaHistory className="text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm tracking-tight">Audit Logs</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Dispute chat transcripts</p>
            </div>
          </div>
          {activeTab === 'audit' && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-rose-500 rounded-t-full shadow-[0_-2px_10px_rgba(244,63,94,0.8)]"></div>
          )}
        </div>
      </div>

      {/* Search Input Bar */}
      {activeTab !== 'audit' && (
        <div className="flex gap-3">
          <div className="relative flex-grow">
            {activeTab !== 'orders' ? (
              <>
                <input
                  type="text"
                  placeholder="Search by title or seller..."
                  className="w-full pl-10 pr-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-sm" />
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search orders by customer, product title, phone, or university..."
                  className="w-full pl-10 pr-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  value={orderSearchTerm}
                  onChange={(e) => setOrderSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-sm" />
              </>
            )}
          </div>
        </div>
      )}

      {/* Table Data View */}
      {activeTab === 'audit' ? (
        <AuditPanel selectedChatId={selectedAuditChatId} onSelectChat={setSelectedAuditChatId} />
      ) : ((activeTab !== 'orders' && loading) || (activeTab === 'orders' && ordersLoading)) ? (
        <div className="text-center py-16 text-slate-500 text-sm flex items-center justify-center gap-2">
          <FaSpinner className="animate-spin text-blue-500" /> Loading data...
        </div>
      ) : (
        <div className="rounded-[1.75rem] overflow-hidden border border-white/[0.07] bg-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  {activeTab !== 'orders' ? (
                    <>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Item</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Price</th>
                      {activeTab !== 'store' && <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Seller</th>}
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Status</th>
                      <th className="py-3.5 px-5 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Order Reference</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Customer</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Product</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Delivery</th>
                      <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Status</th>
                      <th className="py-3.5 px-5 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Actions</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {activeTab !== 'orders' ? (
                  filteredItems.length > 0 ? (
                    filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            {item.is_featured && <FaStar className="text-amber-400" title="Featured" />}
                            {item.title}
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-400">Rs. {parseFloat(item.price).toLocaleString()}</td>
                        {activeTab !== 'store' && (
                          <td className="py-3.5 px-5 text-slate-400">
                            <div>
                              <p className="text-white font-medium">{item.seller?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500">{item.seller?.email || ''}</p>
                            </div>
                          </td>
                        )}
                        <td className="py-3.5 px-5">
                          <span className={`py-1 px-2.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${
                            item.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            item.status === 'SUSPENDED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            item.status === 'SOLD' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {item.status === 'AVAILABLE' ? 'Approved' : item.status === 'SUSPENDED' ? 'Suspended' : item.status === 'SOLD' ? 'Sold' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => { setSelectedItem(item); setActiveImgIndex(0); }} className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 transition-all cursor-pointer border-none" title="View Details">
                              <FaEye className="text-sm" />
                            </button>
                            <button onClick={() => handleEditClick(item)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-400 hover:bg-amber-500/25 transition-all cursor-pointer border-none" title="Edit Item">
                              <FaEdit className="text-sm" />
                            </button>
                            {item.type === 'GIG' && (
                              <button 
                                onClick={() => {
                                  if (item.chats && item.chats.length > 0) {
                                    setSelectedAuditChatId(item.chats[0].id);
                                    setActiveTab('audit');
                                  } else {
                                    toast.error('No chat sessions started for this gig yet.');
                                  }
                                }} 
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-400 hover:bg-rose-500/25 transition-all cursor-pointer border-none" 
                                title="View Chat History"
                              >
                                <FaHistory className="text-sm" />
                              </button>
                            )}
                            {activeTab !== 'store' && (
                              <>
                                {(item.status === 'PENDING_VERIFICATION' || item.status === 'PENDING') && (
                                  <>
                                    <button onClick={() => handleApprove(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 hover:text-white hover:bg-emerald-500/30 transition-all border-none" title="Approve">
                                      <FaCheckCircle className="text-sm" />
                                    </button>
                                    <button onClick={() => handleReject(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-400 hover:text-white hover:bg-amber-500/30 transition-all border-none" title="Suspend">
                                      <FaTimesCircle className="text-sm" />
                                    </button>
                                  </>
                                )}
                                {item.status === 'AVAILABLE' && (
                                  <button onClick={() => handleReject(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10 text-amber-400 hover:text-white hover:bg-amber-500/30 transition-all border-none" title="Suspend">
                                    <FaTimesCircle className="text-sm" />
                                  </button>
                                )}
                                {item.status === 'SUSPENDED' && (
                                  <button onClick={() => handleApprove(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 hover:text-white hover:bg-emerald-500/30 transition-all border-none" title="Approve/Reactivate">
                                    <FaCheckCircle className="text-sm" />
                                  </button>
                                )}
                              </>
                            )}
                            <button onClick={() => handleDelete(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all border-none" title="Delete">
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={activeTab === 'store' ? 4 : 5} className="py-16 text-center text-slate-600 text-sm">No marketplace items found.</td>
                    </tr>
                  )
                ) : (
                  filteredOrders.length > 0 ? (
                    filteredOrders.map(order => {
                      const itemImage = order.item?.images && order.item.images.length > 0
                        ? getImageUrl(order.item.images[0])
                        : '';
                      return (
                        <tr key={order.id} className="hover:bg-white/[0.04] transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-white max-w-[120px] truncate" title={order.id}>
                              {order.id.substring(0, 8)}...
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <img
                                src={order.buyer?.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.buyer?.name}`}
                                alt={order.buyer?.name}
                                className="w-7 h-7 rounded-full object-cover border border-white/10"
                              />
                              <div>
                                <p className="text-white font-medium text-xs leading-tight">{order.buyer?.name || 'Customer'}</p>
                                <p className="text-[10px] text-slate-500">{order.buyer?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              {itemImage ? (
                                <img src={itemImage} alt={order.item?.title} className="w-8 h-8 object-cover rounded-lg border border-white/10" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center text-slate-600 text-[10px]">No Img</div>
                              )}
                              <div>
                                <p className="text-white font-medium text-xs leading-tight">{order.item?.title || 'Unknown Product'}</p>
                                <p className="text-[10px] text-slate-400">Qty: {order.quantity} x Rs. {parseFloat(order.item?.price || '0').toLocaleString()}</p>
                                <p className="text-[11px] font-black text-indigo-400">Rs. {parseFloat(order.total_price || '0').toLocaleString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="text-xs text-slate-400 space-y-0.5">
                              <p className="flex items-center gap-1"><FaPhone className="text-[9px] text-indigo-400" /> {order.delivery_phone}</p>
                              <p className="flex items-center gap-1 max-w-[150px] truncate" title={order.delivery_location}>
                                <FaMapMarkerAlt className="text-[9px] text-indigo-400" /> {order.delivery_location}
                              </p>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`py-1 px-2.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${
                              order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              order.status === 'PROCESSING' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                              order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setSelectedOrder(order)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 hover:bg-blue-500/25 transition-all cursor-pointer border-none" title="View/Edit Order Details">
                                <FaEye className="text-sm" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (order.chatId) {
                                    setSelectedAuditChatId(order.chatId);
                                    setActiveTab('audit');
                                  } else {
                                    toast.error('No active chat history found for this order.');
                                  }
                                }} 
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-400 hover:bg-rose-500/25 transition-all cursor-pointer border-none" 
                                title="View Chat History"
                              >
                                <FaHistory className="text-sm" />
                              </button>
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                className="bg-slate-900/60 backdrop-blur-xs text-white text-[11px] font-bold border border-white/[0.1] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                              >
                                <option value="PENDING">Pending</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="DELIVERED">Delivered</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-600 text-sm">No customer orders found.</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal for Deletion */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-slate-900 border border-white/[0.08] rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Listing</h3>
            <p className="text-slate-400 text-sm mb-6">Are you sure you want to permanently delete this listing? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all border-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all border-none cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Item Detail View Modal Card */}
      {selectedItem && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-white/[0.08] rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative max-h-[90vh] md:max-h-[80vh]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer border-none"
            >
              <FaTimesCircle size={20} />
            </button>

            {/* Left Column: Image carousel */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center bg-black/20 border-b md:border-b-0 md:border-r border-white/[0.05]">
              {selectedItem.images && selectedItem.images.length > 0 ? (
                <div className="relative w-full flex flex-col items-center">
                  <div className="w-full h-64 md:h-80 flex items-center justify-center overflow-hidden rounded-xl bg-slate-950 animate-in fade-in zoom-in">
                    <img
                      src={getImageUrl(selectedItem.images[activeImgIndex])}
                      alt={selectedItem.title}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  {selectedItem.images.length > 1 && (
                    <div className="flex gap-2 justify-center mt-4">
                      <button
                        onClick={() => setActiveImgIndex(prev => prev === 0 ? selectedItem.images.length - 1 : prev - 1)}
                        className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-full cursor-pointer border-none"
                      >
                        <FaChevronLeft size={12} />
                      </button>
                      <button
                        onClick={() => setActiveImgIndex(prev => prev === selectedItem.images.length - 1 ? 0 : prev + 1)}
                        className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-full cursor-pointer border-none"
                      >
                        <FaChevronRight size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-600 text-sm">No images uploaded</div>
              )}
            </div>

            {/* Right Column: Listing info details */}
            <div className="w-full md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    selectedItem.type === 'PRODUCT' ? 'bg-emerald-500/10 text-emerald-400' : 
                    selectedItem.type === 'GIG' ? 'bg-indigo-500/10 text-indigo-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {selectedItem.type}
                  </span>
                  {selectedItem.type === 'PRODUCT' && selectedItem.condition && (
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 text-slate-300">
                      {selectedItem.condition}
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                    selectedItem.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    selectedItem.status === 'SUSPENDED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {selectedItem.status}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 leading-snug">{selectedItem.title}</h3>
                <div className="text-xl font-black text-indigo-400 mb-6">
                  Rs. {parseFloat(selectedItem.price).toLocaleString()}
                </div>

                {/* Rating score details */}
                <div className="flex items-center gap-2 mb-6 border-b border-white/[0.05] pb-4">
                  <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                    <FaStar className="w-3.5 h-3.5 fill-current" />
                    <span>{parseFloat(String(selectedItem.rating || 0)) > 0 ? parseFloat(String(selectedItem.rating)).toFixed(1) : 'No ratings yet'}</span>
                  </div>
                  {parseFloat(String(selectedItem.rating || 0)) > 0 && (
                    <span className="text-slate-500 text-xs">({selectedItem.rating_count} reviews)</span>
                  )}
                </div>

                <div className="mb-6 text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Description</h4>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>
                </div>
              </div>

              {/* Seller details card */}
              <div className="mt-6 border-t border-white/[0.05] pt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Merchant Information</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedItem.seller?.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedItem.seller?.name || 'Store'}`}
                    alt={selectedItem.seller?.name || 'Official Store'}
                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                  />
                  <div className="text-left">
                    <h5 className="text-sm font-semibold text-white leading-tight">
                      {selectedItem.seller?.name || 'Official Store'}
                    </h5>
                    <p className="text-xs text-slate-500">{selectedItem.seller?.email || 'store@unigung.lk'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-white/[0.08] rounded-2xl shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddProductModal(false);
                setNewProduct({ title: '', price: '', description: '', images: [] });
                setImagePreviews([]);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer border-none"
            >
              <FaTimesCircle size={18} />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Add Store Product</h3>
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graduation Teddy Bear, Flower Bouquet..."
                  className="w-full px-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 1500"
                    className="w-full px-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Condition</label>
                  <input
                    type="text"
                    placeholder="e.g. Brand New"
                    value="Brand New"
                    disabled
                    className="w-full px-4 py-2.5 text-slate-400 text-sm bg-white/[0.02] border border-white/[0.05] rounded-xl cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide product details, sizing, options..."
                  className="w-full px-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Upload Images (Max 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 file:cursor-pointer"
                />
                
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {imagePreviews.map((prev, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                        <img src={prev} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer border-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddProductModal(false);
                    setNewProduct({ title: '', price: '', description: '', images: [] });
                    setImagePreviews([]);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg transition-all border-none cursor-pointer flex items-center gap-1.5"
                >
                  {submittingProduct ? (
                    <>
                      <FaSpinner className="animate-spin" /> Publishing...
                    </>
                  ) : (
                    'Publish Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg p-6 bg-slate-900 border border-white/[0.08] rounded-2xl shadow-2xl relative animate-in fade-in duration-200">
            <button
              onClick={() => {
                setEditingItem(null);
                setEditImagePreviews([]);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer border-none"
            >
              <FaTimesCircle size={18} />
            </button>
            <h3 className="text-xl font-bold text-white mb-4">Edit Listing Details</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Listing title..."
                  className="w-full px-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    placeholder="Price..."
                    className="w-full px-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                {editingItem.type === 'PRODUCT' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Condition</label>
                    <select
                      className="w-full px-4 py-2.5 text-white text-sm bg-slate-950 border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                      value={editForm.condition}
                      onChange={(e) => setEditForm(prev => ({ ...prev, condition: e.target.value }))}
                    >
                      <option value="New">New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Condition</label>
                    <input
                      type="text"
                      disabled
                      value="Not Applicable"
                      className="w-full px-4 py-2.5 text-slate-500 text-sm bg-white/[0.02] border border-white/[0.05] rounded-xl cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Listing Status</label>
                  <select
                    className="w-full px-4 py-2.5 text-white text-sm bg-slate-950 border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                    value={editForm.status}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="AVAILABLE">Approved / Available</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="SOLD">Sold</option>
                    <option value="PENDING_VERIFICATION">Pending Student ID Check</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Item Type</label>
                  <input
                    type="text"
                    disabled
                    value={editingItem.type}
                    className="w-full px-4 py-2.5 text-slate-500 text-sm bg-white/[0.02] border border-white/[0.05] rounded-xl cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Listing description details..."
                  className="w-full px-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Replace Images (Optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-blue-600/10 file:text-blue-400 hover:file:bg-blue-600/20 file:cursor-pointer"
                />
                
                {editImagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editImagePreviews.map((prev, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                        <img src={prev} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeEditImage(idx)}
                          className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer border-none"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setEditImagePreviews([]);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingItem}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg transition-all border-none cursor-pointer flex items-center gap-1.5"
                >
                  {updatingItem ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/[0.08] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative max-h-[90vh]">
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer border-none"
            >
              <FaTimesCircle size={20} />
            </button>

            <div className="p-6 md:p-8 overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-2">Order Information</h3>
              <p className="text-xs text-slate-500 mb-6">Order Reference: {selectedOrder.id}</p>

              {/* Order Stepper Status Timeline */}
              <div className="mb-8 bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Delivery Status Timeline</h4>
                {selectedOrder.status === 'CANCELLED' ? (
                  <div className="flex items-center gap-3 text-red-500 font-bold text-sm">
                    <FaTimesCircle className="w-5 h-5" />
                    <span>This order has been CANCELLED.</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between relative mt-2 px-4">
                    {/* Progress Bar background */}
                    <div className="absolute top-[14px] left-[10%] right-[10%] h-0.5 bg-slate-800 -z-1"></div>
                    {/* Active Progress Bar */}
                    <div 
                      className="absolute top-[14px] left-[10%] h-0.5 bg-indigo-500 transition-all duration-500 -z-1"
                      style={{
                        width: selectedOrder.status === 'DELIVERED' 
                          ? '80%' 
                          : selectedOrder.status === 'PROCESSING' 
                          ? '40%' 
                          : '0%'
                      }}
                    ></div>

                    {/* Step 1: Pending */}
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                        ['PENDING', 'PROCESSING', 'DELIVERED'].includes(selectedOrder.status)
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}>
                        1
                      </div>
                      <span className="text-[10px] font-bold text-white">Pending</span>
                    </div>

                    {/* Step 2: Processing */}
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                        ['PROCESSING', 'DELIVERED'].includes(selectedOrder.status)
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}>
                        2
                      </div>
                      <span className={`text-[10px] font-bold ${['PROCESSING', 'DELIVERED'].includes(selectedOrder.status) ? 'text-white' : 'text-slate-500'}`}>Processing</span>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="flex flex-col items-center gap-1.5 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                        selectedOrder.status === 'DELIVERED'
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-900 border-slate-700 text-slate-500'
                      }`}>
                        3
                      </div>
                      <span className={`text-[10px] font-bold ${selectedOrder.status === 'DELIVERED' ? 'text-white' : 'text-slate-500'}`}>Delivered</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid Product / Buyer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Product Detail */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Product Details</h4>
                  <div className="flex gap-4">
                    {selectedOrder.item?.images && selectedOrder.item.images.length > 0 ? (
                      <img
                        src={getImageUrl(selectedOrder.item.images[0])}
                        alt={selectedOrder.item.title}
                        className="w-16 h-16 object-cover rounded-xl bg-slate-950 border border-white/10"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-600 text-xs">
                        No Img
                      </div>
                    )}
                    <div>
                      <h5 className="text-sm font-bold text-white mb-1">{selectedOrder.item?.title || 'Unknown Product'}</h5>
                      <p className="text-xs text-slate-400">Price: Rs. {parseFloat(selectedOrder.item?.price || '0').toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Qty: {selectedOrder.quantity}</p>
                      <p className="text-sm font-black text-indigo-400 mt-2">Total: Rs. {parseFloat(selectedOrder.total_price || '0').toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Buyer Detail */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Customer Details</h4>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={selectedOrder.buyer?.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedOrder.buyer?.name}`}
                      alt={selectedOrder.buyer?.name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <h5 className="text-sm font-semibold text-white leading-tight">{selectedOrder.buyer?.name || 'Customer'}</h5>
                      <p className="text-xs text-slate-500">{selectedOrder.buyer?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5"><FaPhone className="text-[10px] text-indigo-400" /> {selectedOrder.delivery_phone}</div>
                    <div className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-[10px] text-indigo-400" /> {selectedOrder.delivery_location}</div>
                  </div>
                </div>
              </div>

              {/* Extra Details */}
              <div className="space-y-4">
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Order Options</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                    <div>
                      <span className="text-xs text-slate-500 block">Payment Method</span>
                      <span className="font-bold text-white">{selectedOrder.payment_method === 'BANK_TRANSFER' ? '🏦 Direct Bank Transfer' : '💵 Cash on Delivery (COD)'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Order Date</span>
                      <span className="font-semibold text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.payment_method === 'BANK_TRANSFER' && selectedOrder.payment_slip && (
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Bank Deposit Slip</h4>
                    <div className="relative group overflow-hidden rounded-xl border border-white/10 bg-slate-950/40 p-2 flex items-center justify-center">
                      <img 
                        src={`http://localhost:5001${selectedOrder.payment_slip}`} 
                        alt="Bank receipt" 
                        className="max-h-64 object-contain rounded-lg hover:scale-105 transition-transform duration-300"
                      />
                      <a 
                        href={`http://localhost:5001${selectedOrder.payment_slip}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="absolute bottom-4 right-4 bg-slate-905/90 hover:bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 no-underline"
                      >
                        View Full Screen
                      </a>
                    </div>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Customer Notes</h4>
                    <p className="text-sm text-slate-300 italic">"{selectedOrder.notes}"</p>
                  </div>
                )}
              </div>

              {/* Quick Status Action inside Modal */}
              <div className="mt-8 border-t border-white/[0.05] pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Update Order Status</span>
                  <span className="text-xs text-slate-400">Change this order status. Notification will be fired to student.</span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => {
                      handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                      setSelectedOrder((prev: any) => prev ? { ...prev, status: e.target.value } : null);
                    }}
                    className="bg-slate-950 text-white text-xs font-semibold border border-white/[0.1] rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-all border-none"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
