import { useState, useEffect } from 'react';
import { 
  FaTrash, FaCheckCircle, FaTimesCircle, FaSearch, FaShoppingBag, 
  FaBriefcase, FaStar, FaEye, FaChevronLeft, FaChevronRight,
  FaPlus, FaBoxOpen, FaClipboardList, FaSpinner, FaPhone, FaMapMarkerAlt,
  FaEdit, FaHistory
} from 'react-icons/fa';
import { useToast } from '../../context/ToastContext';
import { 
  fetchAdminMarketItems, updateMarketItemStatus, deleteMarketItem,
  createMarketItem, fetchAdminOrders, updateOrderStatus, updateMarketItem
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
  const [activeTab, setActiveTab] = useState<'gigs' | 'products' | 'store' | 'orders' | 'audit'>('gigs');
  const [selectedAuditChatId, setSelectedAuditChatId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ title: '', price: '', description: '', images: [] as File[] });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: '', price: '', description: '', status: '', condition: '', newImages: [] as File[] });
  const [editImagePreviews, setEditImagePreviews] = useState<string[]>([]);
  const [updatingItem, setUpdatingItem] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try { const data = await fetchAdminMarketItems(); setItems(data); }
    catch (error) { console.error(error); toast.error('Failed to load marketplace items.'); }
    finally { setLoading(false); }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try { const data = await fetchAdminOrders(); setOrders(data); }
    catch (error) { console.error(error); toast.error('Failed to load customer orders.'); }
    finally { setOrdersLoading(false); }
  };

  useEffect(() => { if (activeTab === 'orders') loadOrders(); else loadItems(); }, [activeTab]);

  const handleApprove = async (id: string | number) => {
    try { await updateMarketItemStatus(id, 'AVAILABLE'); toast.success('Listing approved.'); loadItems(); }
    catch (error) { console.error(error); toast.error('Failed to approve listing.'); }
  };
  const handleReject = async (id: string | number) => {
    try { await updateMarketItemStatus(id, 'SUSPENDED'); toast.error('Listing suspended.'); loadItems(); }
    catch (error) { console.error(error); toast.error('Failed to suspend listing.'); }
  };
  const handleDelete = (id: string | number) => setConfirmDeleteId(id);
  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    try { await deleteMarketItem(confirmDeleteId); toast.success('Listing deleted.'); loadItems(); }
    catch (error) { console.error(error); toast.error('Failed to delete listing.'); }
    finally { setConfirmDeleteId(null); }
  };
  const handleUpdateOrderStatus = async (orderId: string | number, newStatus: string) => {
    try { await updateOrderStatus(orderId, newStatus); toast.success('Order status updated.'); loadOrders(); }
    catch (error) { console.error(error); toast.error('Failed to update order status.'); }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const f = Array.from(e.target.files);
      setNewProduct(prev => ({ ...prev, images: [...prev.images, ...f] }));
      setImagePreviews(prev => [...prev, ...f.map(fi => URL.createObjectURL(fi))]);
    }
  };
  const removeImage = (index: number) => {
    setNewProduct(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.description) { toast.error('Fill all required fields.'); return; }
    if (newProduct.images.length === 0) { toast.error('Upload at least one image.'); return; }
    setSubmittingProduct(true);
    try {
      await createMarketItem({ title: newProduct.title, type: 'OFFICIAL_PRODUCT', price: newProduct.price, description: newProduct.description, images: newProduct.images });
      toast.success('Product published!'); setShowAddProductModal(false);
      setNewProduct({ title: '', price: '', description: '', images: [] }); setImagePreviews([]); loadItems();
    } catch (error: any) { toast.error(error.message || 'Failed to create product.'); }
    finally { setSubmittingProduct(false); }
  };
  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setEditForm({ title: item.title, price: String(item.price), description: item.description, status: item.status, condition: item.condition || 'Not Applicable', newImages: [] });
    setEditImagePreviews(item.images ? item.images.map((img: string) => getImageUrl(img)) : []);
  };
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const f = Array.from(e.target.files);
      setEditForm(prev => ({ ...prev, newImages: [...prev.newImages, ...f] }));
      setEditImagePreviews(prev => [...prev, ...f.map(fi => URL.createObjectURL(fi))]);
    }
  };
  const removeEditImage = (index: number) => {
    setEditImagePreviews(prev => prev.filter((_, i) => i !== index));
    const fi = index - (editingItem.images ? editingItem.images.length : 0);
    if (fi >= 0) setEditForm(prev => ({ ...prev, newImages: prev.newImages.filter((_, i) => i !== fi) }));
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title || !editForm.price || !editForm.description) { toast.error('Fill all required fields.'); return; }
    setUpdatingItem(true);
    try {
      await updateMarketItem(editingItem.id, { title: editForm.title, price: editForm.price, description: editForm.description, status: editForm.status, condition: editForm.condition, images: editForm.newImages });
      toast.success('Listing updated.'); setEditingItem(null); setEditImagePreviews([]); loadItems();
    } catch (error: any) { toast.error(error.message || 'Failed to update.'); }
    finally { setUpdatingItem(false); }
  };
  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:image')) return url;
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };
  const filteredItems = items.filter(item => {
    const m = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (item.seller?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'gigs') return m && item.type === 'GIG';
    if (activeTab === 'products') return m && item.type === 'PRODUCT';
    if (activeTab === 'store') return m && item.type === 'OFFICIAL_PRODUCT';
    return false;
  });
  const filteredOrders = orders.filter(o =>
    (o.item?.title || '').toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    (o.buyer?.name || '').toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    (o.delivery_location || '').toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
    (o.delivery_phone || '').includes(orderSearchTerm)
  );
  const tabs = [
    { key: 'gigs', label: 'Peer Gigs', sub: 'Student freelance services', icon: FaBriefcase, color: 'blue' },
    { key: 'products', label: 'Peer Products', sub: 'Used student items', icon: FaShoppingBag, color: 'emerald' },
    { key: 'store', label: 'Official Store', sub: 'Bouquets & merch', icon: FaBoxOpen, color: 'amber' },
    { key: 'orders', label: 'Customer Orders', sub: 'Track & fulfill sales', icon: FaClipboardList, color: 'purple' },
    { key: 'audit', label: 'Audit Logs', sub: 'Dispute transcripts', icon: FaHistory, color: 'rose' },
  ] as const;
  const colorMap: Record<string, { active: string; icon: string; dot: string }> = {
    blue:    { active: 'bg-blue-50 border-blue-200', icon: 'bg-blue-100 text-blue-600', dot: 'bg-blue-500' },
    emerald: { active: 'bg-emerald-50 border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' },
    amber:   { active: 'bg-amber-50 border-amber-200', icon: 'bg-amber-100 text-amber-600', dot: 'bg-amber-500' },
    purple:  { active: 'bg-purple-50 border-purple-200', icon: 'bg-purple-100 text-purple-600', dot: 'bg-purple-500' },
    rose:    { active: 'bg-rose-50 border-rose-200', icon: 'bg-rose-100 text-rose-600', dot: 'bg-rose-500' },
  };
  const statusBadge = (s: string) => {
    const m: Record<string, string> = { AVAILABLE: 'bg-emerald-100 text-emerald-700', SUSPENDED: 'bg-red-100 text-red-600', SOLD: 'bg-blue-100 text-blue-700', DELIVERED: 'bg-emerald-100 text-emerald-700', PROCESSING: 'bg-indigo-100 text-indigo-700', CANCELLED: 'bg-red-100 text-red-600', PENDING: 'bg-amber-100 text-amber-700', PENDING_VERIFICATION: 'bg-amber-100 text-amber-700' };
    return m[s] || 'bg-slate-100 text-slate-700';
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2"><FaShoppingBag className="text-blue-500" /> Marketplace Management</h2>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">Manage gigs, products, official store and orders</p>
        </div>
        {activeTab === 'store' && (
          <button onClick={() => setShowAddProductModal(true)} className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-sm"><FaPlus /> Add Store Product</button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {tabs.map(tab => {
          const isActive = activeTab === tab.key;
          const c = colorMap[tab.color];
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={elative p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left }>
              <div className="flex flex-col gap-2">
                <div className={p-2 rounded-xl w-fit }><Icon className="text-base" /></div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs leading-tight">{tab.label}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">{tab.sub}</p>
                </div>
              </div>
              {isActive && <div className={bsolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5  rounded-t-full} />}
            </button>
          );
        })}
      </div>

      {activeTab !== 'audit' && (
        <div className="relative">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input type="text" placeholder={activeTab !== 'orders' ? 'Search by title or seller...' : 'Search orders...'} className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-900 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all" value={activeTab !== 'orders' ? searchTerm : orderSearchTerm} onChange={(e) => activeTab !== 'orders' ? setSearchTerm(e.target.value) : setOrderSearchTerm(e.target.value)} />
        </div>
      )}

      {activeTab === 'audit' ? (
        <AuditPanel selectedChatId={selectedAuditChatId} onSelectChat={setSelectedAuditChatId} />
      ) : ((activeTab !== 'orders' && loading) || (activeTab === 'orders' && ordersLoading)) ? (
        <div className="py-16 text-center text-slate-500 text-sm flex items-center justify-center gap-2"><FaSpinner className="animate-spin text-blue-500" /> Loading data...</div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {activeTab !== 'orders' ? (<>
                    <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Item</th>
                    <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Price</th>
                    {activeTab !== 'store' && <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Seller</th>}
                    <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Status</th>
                    <th className="py-3.5 px-5 text-center text-[11px] font-black uppercase tracking-wider text-slate-500">Actions</th>
                  </>) : (<>
                    <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Order Ref</th>
                    <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Customer</th>
                    <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Product</th>
                    <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Delivery</th>
                    <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-500">Status</th>
                    <th className="py-3.5 px-5 text-center text-[11px] font-black uppercase tracking-wider text-slate-500">Actions</th>
                  </>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab !== 'orders' ? (
                  filteredItems.length > 0 ? filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-slate-900"><div className="flex items-center gap-2">{item.is_featured && <FaStar className="text-amber-400" />}{item.title}</div></td>
                      <td className="py-3.5 px-5 text-slate-600">Rs. {parseFloat(item.price).toLocaleString()}</td>
                      {activeTab !== 'store' && <td className="py-3.5 px-5"><p className="font-medium text-slate-900">{item.seller?.name || 'Unknown'}</p><p className="text-xs text-slate-400">{item.seller?.email || ''}</p></td>}
                      <td className="py-3.5 px-5"><span className={py-1 px-2.5 rounded-full text-[10px] font-black uppercase }>{item.status === 'AVAILABLE' ? 'Approved' : item.status === 'SUSPENDED' ? 'Suspended' : item.status === 'SOLD' ? 'Sold' : 'Pending'}</span></td>
                      <td className="py-3.5 px-5"><div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => { setSelectedItem(item); setActiveImgIndex(0); }} className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all cursor-pointer border-none"><FaEye className="text-xs" /></button>
                        <button onClick={() => handleEditClick(item)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 text-amber-500 hover:bg-amber-100 transition-all cursor-pointer border-none"><FaEdit className="text-xs" /></button>
                        {item.type === 'GIG' && <button onClick={() => { if (item.chats?.length > 0) { setSelectedAuditChatId(item.chats[0].id); setActiveTab('audit'); } else toast.error('No chat sessions.'); }} className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all cursor-pointer border-none"><FaHistory className="text-xs" /></button>}
                        {activeTab !== 'store' && (<>
                          {(item.status === 'PENDING_VERIFICATION' || item.status === 'PENDING') && (<><button onClick={() => handleApprove(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all border-none cursor-pointer"><FaCheckCircle className="text-xs" /></button><button onClick={() => handleReject(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 text-amber-500 hover:bg-amber-100 transition-all border-none cursor-pointer"><FaTimesCircle className="text-xs" /></button></>)}
                          {item.status === 'AVAILABLE' && <button onClick={() => handleReject(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 text-amber-500 hover:bg-amber-100 transition-all border-none cursor-pointer"><FaTimesCircle className="text-xs" /></button>}
                          {item.status === 'SUSPENDED' && <button onClick={() => handleApprove(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all border-none cursor-pointer"><FaCheckCircle className="text-xs" /></button>}
                        </>)}
                        <button onClick={() => handleDelete(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-100 transition-all border-none cursor-pointer"><FaTrash className="text-xs" /></button>
                      </div></td>
                    </tr>
                  )) : <tr><td colSpan={activeTab === 'store' ? 4 : 5} className="py-16 text-center text-slate-400 text-sm">No marketplace items found.</td></tr>
                ) : (
                  filteredOrders.length > 0 ? filteredOrders.map(order => {
                    const img = order.item?.images?.length > 0 ? getImageUrl(order.item.images[0]) : '';
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5"><div className="font-semibold text-slate-900 text-xs truncate max-w-[100px]">{order.id.substring(0, 8)}...</div><span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span></td>
                        <td className="py-3.5 px-5"><div className="flex items-center gap-2"><img src={order.buyer?.profile_pic || https://api.dicebear.com/7.x/avataaars/svg?seed=} alt="" className="w-7 h-7 rounded-full object-cover border border-slate-200" /><div><p className="font-medium text-slate-900 text-xs">{order.buyer?.name || 'Customer'}</p><p className="text-[10px] text-slate-400">{order.buyer?.email}</p></div></div></td>
                        <td className="py-3.5 px-5"><div className="flex items-center gap-2">{img ? <img src={img} alt="" className="w-8 h-8 object-cover rounded-lg border border-slate-200" /> : <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px]">N/A</div>}<div><p className="font-medium text-slate-900 text-xs">{order.item?.title || 'Unknown'}</p><p className="text-[10px] text-slate-400">Qty: {order.quantity}</p><p className="text-[11px] font-black text-indigo-500">Rs. {parseFloat(order.total_price || '0').toLocaleString()}</p></div></div></td>
                        <td className="py-3.5 px-5"><div className="text-xs text-slate-500 space-y-0.5"><p className="flex items-center gap-1"><FaPhone className="text-[9px] text-indigo-400" />{order.delivery_phone}</p><p className="flex items-center gap-1 max-w-[130px] truncate"><FaMapMarkerAlt className="text-[9px] text-indigo-400" />{order.delivery_location}</p></div></td>
                        <td className="py-3.5 px-5"><span className={py-1 px-2.5 rounded-full text-[10px] font-black uppercase }>{order.status}</span></td>
                        <td className="py-3.5 px-5"><div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => setSelectedOrder(order)} className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100 transition-all cursor-pointer border-none"><FaEye className="text-xs" /></button>
                          <button onClick={() => { if (order.chatId) { setSelectedAuditChatId(order.chatId); setActiveTab('audit'); } else toast.error('No chat history.'); }} className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-400 hover:bg-rose-100 transition-all cursor-pointer border-none"><FaHistory className="text-xs" /></button>
                          <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} className="bg-white text-slate-800 text-[11px] font-bold border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"><option value="PENDING">Pending</option><option value="PROCESSING">Processing</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select>
                        </div></td>
                      </tr>
                    );
                  }) : <tr><td colSpan={6} className="py-16 text-center text-slate-400 text-sm">No customer orders found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Listing</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border-none cursor-pointer">Cancel</button>
              <button onClick={executeDelete} className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg border-none cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative max-h-[90vh] md:max-h-[80vh]">
            <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-10 p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer border-none"><FaTimesCircle size={18} /></button>
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200">
              {selectedItem.images && selectedItem.images.length > 0 ? (
                <div className="relative w-full flex flex-col items-center">
                  <div className="w-full h-64 md:h-80 flex items-center justify-center overflow-hidden rounded-xl bg-white border border-slate-200">
                    <img src={getImageUrl(selectedItem.images[activeImgIndex])} alt={selectedItem.title} className="max-w-full max-h-full object-contain" />
                  </div>
                  {selectedItem.images.length > 1 && (
                    <div className="flex gap-2 justify-center mt-4">
                      <button onClick={() => setActiveImgIndex(prev => prev === 0 ? selectedItem.images.length - 1 : prev - 1)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full cursor-pointer border-none"><FaChevronLeft size={12} /></button>
                      <button onClick={() => setActiveImgIndex(prev => prev === selectedItem.images.length - 1 ? 0 : prev + 1)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full cursor-pointer border-none"><FaChevronRight size={12} /></button>
                    </div>
                  )}
                </div>
              ) : <div className="text-slate-400 text-sm">No images uploaded</div>}
            </div>
            <div className="w-full md:w-1/2 p-7 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest }>{selectedItem.type}</span>
                  {selectedItem.type === 'PRODUCT' && selectedItem.condition && <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600">{selectedItem.condition}</span>}
                  <span className={px-2.5 py-1 rounded-full text-[9px] font-black uppercase }>{selectedItem.status}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedItem.title}</h3>
                <div className="text-xl font-black text-indigo-500 mb-5">Rs. {parseFloat(selectedItem.price).toLocaleString()}</div>
                <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-bold"><FaStar className="w-3.5 h-3.5 fill-current" /><span>{parseFloat(String(selectedItem.rating || 0)) > 0 ? parseFloat(String(selectedItem.rating)).toFixed(1) : 'No ratings yet'}</span></div>
                  {parseFloat(String(selectedItem.rating || 0)) > 0 && <span className="text-slate-400 text-xs">({selectedItem.rating_count} reviews)</span>}
                </div>
                <div className="mb-5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Description</h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedItem.description}</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Merchant Information</h4>
                <div className="flex items-center gap-3">
                  <img src={selectedItem.seller?.profile_pic || https://api.dicebear.com/7.x/avataaars/svg?seed=} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  <div><h5 className="text-sm font-semibold text-slate-900">{selectedItem.seller?.name || 'Official Store'}</h5><p className="text-xs text-slate-500">{selectedItem.seller?.email || 'store@unigung.lk'}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddProductModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl relative">
            <button onClick={() => { setShowAddProductModal(false); setNewProduct({ title: '', price: '', description: '', images: [] }); setImagePreviews([]); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer border-none"><FaTimesCircle size={16} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Store Product</h3>
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Title</label><input type="text" required placeholder="e.g. Graduation Teddy Bear..." className="w-full px-4 py-2.5 text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-400" value={newProduct.title} onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (Rs.)</label><input type="number" required placeholder="e.g. 1500" className="w-full px-4 py-2.5 text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-400" value={newProduct.price} onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))} /></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Condition</label><input type="text" value="Brand New" disabled className="w-full px-4 py-2.5 text-slate-400 text-sm bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label><textarea required rows={4} placeholder="Product details..." className="w-full px-4 py-2.5 text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-400 resize-none" value={newProduct.description} onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))} /></div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Upload Images (Max 5)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer" />
                {imagePreviews.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{imagePreviews.map((p, i) => <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200"><img src={p} className="w-full h-full object-cover" /><button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer border-none">&times;</button></div>)}</div>}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowAddProductModal(false); setNewProduct({ title: '', price: '', description: '', images: [] }); setImagePreviews([]); }} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border-none cursor-pointer">Cancel</button>
                <button type="submit" disabled={submittingProduct} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg border-none cursor-pointer flex items-center gap-1.5">{submittingProduct ? <><FaSpinner className="animate-spin" /> Publishing...</> : 'Publish Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl relative">
            <button onClick={() => { setEditingItem(null); setEditImagePreviews([]); }} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 p-2 rounded-full cursor-pointer border-none"><FaTimesCircle size={16} /></button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Edit Listing Details</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label><input type="text" required className="w-full px-4 py-2.5 text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-400" value={editForm.title} onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (Rs.)</label><input type="number" required className="w-full px-4 py-2.5 text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-400" value={editForm.price} onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))} /></div>
                {editingItem.type === 'PRODUCT' ? <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Condition</label><select className="w-full px-4 py-2.5 text-slate-900 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 cursor-pointer" value={editForm.condition} onChange={(e) => setEditForm(prev => ({ ...prev, condition: e.target.value }))}><option value="New">New</option><option value="Like New">Like New</option><option value="Good">Good</option><option value="Fair">Fair</option></select></div> : <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Condition</label><input type="text" disabled value="Not Applicable" className="w-full px-4 py-2.5 text-slate-400 text-sm bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed" /></div>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Listing Status</label><select className="w-full px-4 py-2.5 text-slate-900 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 cursor-pointer" value={editForm.status} onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}><option value="AVAILABLE">Approved / Available</option><option value="SUSPENDED">Suspended</option><option value="SOLD">Sold</option><option value="PENDING_VERIFICATION">Pending ID Check</option></select></div>
                <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Item Type</label><input type="text" disabled value={editingItem.type} className="w-full px-4 py-2.5 text-slate-400 text-sm bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label><textarea required rows={4} className="w-full px-4 py-2.5 text-slate-900 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-400 resize-none" value={editForm.description} onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))} /></div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Replace Images (Optional)</label>
                <input type="file" multiple accept="image/*" onChange={handleEditFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 file:cursor-pointer" />
                {editImagePreviews.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{editImagePreviews.map((p, i) => <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200"><img src={p} className="w-full h-full object-cover" /><button type="button" onClick={() => removeEditImage(i)} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] cursor-pointer border-none">&times;</button></div>)}</div>}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setEditingItem(null); setEditImagePreviews([]); }} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border-none cursor-pointer">Cancel</button>
                <button type="submit" disabled={updatingItem} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg border-none cursor-pointer flex items-center gap-1.5">{updatingItem ? <><FaSpinner className="animate-spin" /> Saving...</> : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative max-h-[90vh]">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 z-10 p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-all cursor-pointer border-none"><FaTimesCircle size={18} /></button>
            <div className="p-6 md:p-8 overflow-y-auto">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Order Information</h3>
              <p className="text-xs text-slate-400 mb-6">Ref: {selectedOrder.id}</p>
              <div className="mb-7 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Delivery Status Timeline</h4>
                {selectedOrder.status === 'CANCELLED' ? (
                  <div className="flex items-center gap-3 text-red-500 font-bold text-sm"><FaTimesCircle className="w-5 h-5" /><span>This order has been CANCELLED.</span></div>
                ) : (
                  <div className="flex items-center justify-between relative mt-2 px-4">
                    <div className="absolute top-[14px] left-[10%] right-[10%] h-0.5 bg-slate-200" />
                    <div className="absolute top-[14px] left-[10%] h-0.5 bg-indigo-500 transition-all duration-500" style={{ width: selectedOrder.status === 'DELIVERED' ? '80%' : selectedOrder.status === 'PROCESSING' ? '40%' : '0%' }} />
                    {[{ label: 'Pending', s: ['PENDING','PROCESSING','DELIVERED'] }, { label: 'Processing', s: ['PROCESSING','DELIVERED'] }, { label: 'Delivered', s: ['DELIVERED'] }].map((step, i) => {
                      const active = step.s.includes(selectedOrder.status);
                      return <div key={i} className="flex flex-col items-center gap-1.5 z-10"><div className={w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all }>{i+1}</div><span className={	ext-[10px] font-bold }>{step.label}</span></div>;
                    })}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Product Details</h4>
                  <div className="flex gap-3">
                    {selectedOrder.item?.images?.length > 0 ? <img src={getImageUrl(selectedOrder.item.images[0])} alt="" className="w-14 h-14 object-cover rounded-xl border border-slate-200" /> : <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs">No Img</div>}
                    <div><h5 className="text-sm font-bold text-slate-900 mb-1">{selectedOrder.item?.title || 'Unknown'}</h5><p className="text-xs text-slate-500">Rs. {parseFloat(selectedOrder.item?.price || '0').toLocaleString()} x {selectedOrder.quantity}</p><p className="text-sm font-black text-indigo-500 mt-1.5">Total: Rs. {parseFloat(selectedOrder.total_price || '0').toLocaleString()}</p></div>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Customer Details</h4>
                  <div className="flex items-center gap-3 mb-3"><img src={selectedOrder.buyer?.profile_pic || https://api.dicebear.com/7.x/avataaars/svg?seed=} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-200" /><div><h5 className="text-sm font-semibold text-slate-900">{selectedOrder.buyer?.name || 'Customer'}</h5><p className="text-xs text-slate-500">{selectedOrder.buyer?.email}</p></div></div>
                  <div className="space-y-1 text-xs text-slate-500"><div className="flex items-center gap-1.5"><FaPhone className="text-[9px] text-indigo-400" />{selectedOrder.delivery_phone}</div><div className="flex items-center gap-1.5"><FaMapMarkerAlt className="text-[9px] text-indigo-400" />{selectedOrder.delivery_location}</div></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Order Options</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm"><div><span className="text-xs text-slate-400 block">Payment</span><span className="font-bold text-slate-900">{selectedOrder.payment_method === 'BANK_TRANSFER' ? 'Bank Transfer' : 'Cash on Delivery'}</span></div><div><span className="text-xs text-slate-400 block">Order Date</span><span className="font-semibold text-slate-900">{new Date(selectedOrder.createdAt).toLocaleString()}</span></div></div>
                </div>
                {selectedOrder.payment_method === 'BANK_TRANSFER' && selectedOrder.payment_slip && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Bank Deposit Slip</h4>
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 p-2 flex items-center justify-center bg-white">
                      <img src={${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}} alt="Receipt" className="max-h-64 object-contain rounded-lg" />
                      <a href={${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'}} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg no-underline">View Full</a>
                    </div>
                  </div>
                )}
                {selectedOrder.notes && <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Customer Notes</h4><p className="text-sm text-slate-600 italic">"{selectedOrder.notes}"</p></div>}
              </div>
              <div className="mt-7 border-t border-slate-100 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div><span className="text-xs font-bold text-slate-500 uppercase block mb-0.5">Update Order Status</span><span className="text-xs text-slate-400">Notification will be sent to the student.</span></div>
                <div className="flex items-center gap-2">
                  <select value={selectedOrder.status} onChange={(e) => { handleUpdateOrderStatus(selectedOrder.id, e.target.value); setSelectedOrder((prev: any) => prev ? { ...prev, status: e.target.value } : null); }} className="bg-white text-slate-800 text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"><option value="PENDING">Pending</option><option value="PROCESSING">Processing</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select>
                  <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer border-none">Done</button>
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
