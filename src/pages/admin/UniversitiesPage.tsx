import React, { useState, useEffect } from 'react';
import { 
  LuGraduationCap, LuMapPin, LuBuilding2, LuPlus, 
  LuPencil, LuTrash2, LuX 
} from 'react-icons/lu';

interface Province {
    id: number;
    name: string;
}

const DUMMY_PROVINCES: Province[] = [
    { id: 1, name: 'Western Province' },
    { id: 2, name: 'Central Province' },
    { id: 3, name: 'Southern Province' },
];

interface District {
    id: number;
    name: string;
    provinceId: number;
}

const DUMMY_DISTRICTS: District[] = [
    { id: 1, name: 'Colombo', provinceId: 1 },
    { id: 2, name: 'Kandy', provinceId: 2 },
    { id: 3, name: 'Galle', provinceId: 3 },
];

interface University {
    id: number;
    name: string;
    districtId: number;
    location: string;
}

const DUMMY_UNIVERSITIES: University[] = [
    { id: 1, name: 'University of Colombo', districtId: 1, location: 'Colombo' },
    { id: 2, name: 'University of Peradeniya', districtId: 2, location: 'Kandy' },
    { id: 3, name: 'University of Moratuwa', districtId: 1, location: 'Moratuwa' },
];

const UniversitiesPage = () => {
    const [provinces, setProvinces] = useState(DUMMY_PROVINCES);
    const [districts, setDistricts] = useState(DUMMY_DISTRICTS);
    const [universities, setUniversities] = useState(DUMMY_UNIVERSITIES);

    const [loading, setLoading] = useState(false); 
    const [activeTab, setActiveTab] = useState<'provinces' | 'districts' | 'universities'>('universities'); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
    const [editingItem, setEditingItem] = useState<Province | District | University | null>(null); 

    // Form states for adding/editing
    const [itemName, setItemName] = useState('');
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | ''>(''); 
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | ''>(''); 

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setProvinces(DUMMY_PROVINCES);
            setDistricts(DUMMY_DISTRICTS);
            setUniversities(DUMMY_UNIVERSITIES);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const getProvinceName = (id: number) => {
        return provinces.find(p => p.id === id)?.name || 'N/A';
    };

    const getDistrictName = (id: number) => {
        return districts.find(d => d.id === id)?.name || 'N/A';
    };

    const handleAddItem = (type: 'provinces' | 'districts' | 'universities') => {
        setModalType('add');
        setItemName('');
        setSelectedProvinceId('');
        setSelectedDistrictId('');
        setEditingItem(null); 
        setActiveTab(type); 
        setIsModalOpen(true);
    };

    const handleEditItem = (type: 'provinces' | 'districts' | 'universities', item: Province | District | University) => {
        setModalType('edit');
        setEditingItem(item);
        setItemName(item.name);
        if (type === 'districts') {
            setSelectedProvinceId((item as District).provinceId);
        } else if (type === 'universities') {
            setSelectedDistrictId((item as University).districtId);
        }
        setActiveTab(type); 
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemName.trim()) {
            alert('Please input name.');
            return;
        }

        if (modalType === 'add') {
            if (activeTab === 'provinces') {
                const newProvince = { id: provinces.length + 1, name: itemName };
                setProvinces([...provinces, newProvince]);
            } else if (activeTab === 'districts') {
                if (!selectedProvinceId) {
                    alert('Please select province.');
                    return;
                }
                const newDistrict = { id: districts.length + 1, name: itemName, provinceId: selectedProvinceId as number };
                setDistricts([...districts, newDistrict]);
            } else if (activeTab === 'universities') {
                if (!selectedDistrictId) {
                    alert('Please select district.');
                    return;
                }
                const newUniversity = { id: universities.length + 1, name: itemName, districtId: selectedDistrictId as number, location: '' };
                setUniversities([...universities, newUniversity]);
            }
        } else if (modalType === 'edit' && editingItem) {
            if (activeTab === 'provinces') {
                setProvinces(provinces.map(p => p.id === editingItem.id ? { ...p, name: itemName } : p));
            } else if (activeTab === 'districts') {
                if (!selectedProvinceId) {
                    alert('Please select province.');
                    return;
                }
                setDistricts(districts.map(d => d.id === editingItem.id ? { ...d, name: itemName, provinceId: selectedProvinceId as number } : d));
            } else if (activeTab === 'universities') {
                if (!selectedDistrictId) {
                    alert('Please select district.');
                    return;
                }
                setUniversities(universities.map(u => u.id === editingItem.id ? { ...u, name: itemName, districtId: selectedDistrictId as number } : u));
            }
        }
        setIsModalOpen(false);
    };

    const handleDeleteItem = (type: 'provinces' | 'districts' | 'universities', id: number) => {
        if (window.confirm(`Are you sure you want to delete this? (ID: ${id})`)) {
            if (type === 'provinces') {
                setProvinces(provinces.filter(p => p.id !== id));
                const remainingDistricts = districts.filter(d => d.provinceId !== id);
                setDistricts(remainingDistricts);
                setUniversities(universities.filter(u => !remainingDistricts.some(d => d.id === u.districtId)));
            } else if (type === 'districts') {
                setDistricts(districts.filter(d => d.id !== id));
                setUniversities(universities.filter(u => u.districtId !== id));
            } else if (type === 'universities') {
                setUniversities(universities.filter(u => u.id !== id));
            }
        }
    };

    const filteredDistrictsForSelection = selectedProvinceId
        ? districts.filter(d => d.provinceId === selectedProvinceId)
        : [];

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">University & Location Hub</h2>
                <p className="text-slate-500 text-xs font-semibold tracking-wide mt-1">Manage academic institutes, districts, and geographic mapping</p>
            </div>

            {/* Tab Grid Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tab 1: Universities */}
                <div
                    onClick={() => setActiveTab('universities')}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                        activeTab === 'universities'
                            ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                            activeTab === 'universities' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            <LuGraduationCap size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Universities ({universities.length})</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Manage academic campuses</p>
                        </div>
                    </div>
                </div>

                {/* Tab 2: Districts */}
                <div
                    onClick={() => setActiveTab('districts')}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                        activeTab === 'districts'
                            ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                            activeTab === 'districts' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            <LuBuilding2 size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Districts ({districts.length})</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Regional campus mapping</p>
                        </div>
                    </div>
                </div>

                {/* Tab 3: Provinces */}
                <div
                    onClick={() => setActiveTab('provinces')}
                    className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                        activeTab === 'provinces'
                            ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${
                            activeTab === 'provinces' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            <LuMapPin size={20} />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm">Provinces ({provinces.length})</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">Geographic provinces</p>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-slate-400 font-bold uppercase tracking-wider text-xs animate-pulse">Loading Geographic Data...</div>
            ) : (
                <>
                    {activeTab === 'universities' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Universities List</h3>
                                <button
                                    onClick={() => handleAddItem('universities')}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all border-none cursor-pointer shadow-xs"
                                >
                                    <LuPlus size={16} /> Add New Uni / Institute
                                </button>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/75">
                                                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                                                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">District</th>
                                                <th className="py-3 px-5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {universities.length > 0 ? (
                                                universities.map(uni => (
                                                    <tr key={uni.id} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="py-3 px-5 font-semibold text-slate-900 whitespace-nowrap">{uni.name}</td>
                                                        <td className="py-3 px-5 text-slate-500 text-xs font-medium">{getDistrictName(uni.districtId)}</td>
                                                        <td className="py-3 px-5">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button
                                                                    onClick={() => handleEditItem('universities', uni)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
                                                                    title="Edit"
                                                                >
                                                                    <LuPencil size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteItem('universities', uni.id)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer border border-rose-100"
                                                                    title="Delete"
                                                                >
                                                                    <LuTrash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="py-16 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">No universities found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'districts' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Districts List</h3>
                                <button
                                    onClick={() => handleAddItem('districts')}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all border-none cursor-pointer shadow-xs"
                                >
                                    <LuPlus size={16} /> Add New District
                                </button>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/75">
                                                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                                                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Province</th>
                                                <th className="py-3 px-5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {districts.map(district => (
                                                <tr key={district.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="py-3 px-5 font-semibold text-slate-900 whitespace-nowrap">{district.name}</td>
                                                    <td className="py-3 px-5 text-slate-500 text-xs font-medium">{getProvinceName(district.provinceId)}</td>
                                                    <td className="py-3 px-5">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => handleEditItem('districts', district)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <LuPencil size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem('districts', district.id)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer border border-rose-100"
                                                                title="Delete"
                                                            >
                                                                <LuTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'provinces' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Provinces List</h3>
                                <button
                                    onClick={() => handleAddItem('provinces')}
                                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all border-none cursor-pointer shadow-xs"
                                >
                                    <LuPlus size={16} /> Add New Province
                                </button>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/75">
                                                <th className="py-3 px-5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Name</th>
                                                <th className="py-3 px-5 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {provinces.map(province => (
                                                <tr key={province.id} className="hover:bg-slate-50/60 transition-colors">
                                                    <td className="py-3 px-5 font-semibold text-slate-900 whitespace-nowrap">{province.name}</td>
                                                    <td className="py-3 px-5">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => handleEditItem('provinces', province)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <LuPencil size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem('provinces', province.id)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer border border-rose-100"
                                                                title="Delete"
                                                            >
                                                                <LuTrash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md relative p-6">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-base font-bold text-slate-900">
                                {modalType === 'edit' ? `Edit ${activeTab === 'universities' ? 'University / Institute' : activeTab === 'districts' ? 'District' : 'Province'} ` : `Add New ${activeTab === 'universities' ? 'University / Institute' : activeTab === 'districts' ? 'District' : 'Province'}`}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                            >
                                <LuX size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === 'districts' && (
                                <div className="space-y-1">
                                    <label htmlFor="provinceSelect" className="text-xs font-bold text-slate-700">Select Province</label>
                                    <select
                                        id="provinceSelect"
                                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs"
                                        value={selectedProvinceId}
                                        onChange={(e) => setSelectedProvinceId(e.target.value === '' ? '' : Number(e.target.value))}
                                        required
                                    >
                                        <option value="">Select Province</option>
                                        {provinces.map(province => (
                                            <option key={province.id} value={province.id}>{province.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {activeTab === 'universities' && (
                                <>
                                    <div className="space-y-1">
                                        <label htmlFor="provinceSelect" className="text-xs font-bold text-slate-700">Select Province</label>
                                        <select
                                            id="provinceSelect"
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs"
                                            value={selectedProvinceId}
                                            onChange={(e) => {
                                                setSelectedProvinceId(e.target.value === '' ? '' : Number(e.target.value));
                                                setSelectedDistrictId('');
                                            }}
                                            required
                                        >
                                            <option value="">Select Province</option>
                                            {provinces.map(province => (
                                                <option key={province.id} value={province.id}>{province.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="districtSelect" className="text-xs font-bold text-slate-700">Select District</label>
                                        <select
                                            id="districtSelect"
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs disabled:opacity-50"
                                            value={selectedDistrictId}
                                            onChange={(e) => { setSelectedDistrictId(e.target.value === '' ? '' : Number(e.target.value)) }}
                                            required
                                            disabled={!selectedProvinceId}
                                        >
                                            <option value="">Select District</option>
                                            {filteredDistrictsForSelection.map(district => (
                                                <option key={district.id} value={district.id}>{district.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="space-y-1">
                                <label htmlFor="itemName" className="text-xs font-bold text-slate-700">{activeTab === 'universities'? 'University / Institute Name' : activeTab === 'districts' ? 'District Name' : 'Province Name'}</label>
                                <input
                                    type="text"
                                    id="itemName"
                                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    placeholder="Enter name..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2.5 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm cursor-pointer"
                                >
                                    {modalType === 'add' ? 'Add' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UniversitiesPage;
