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
        // Simulate fetching data from backend
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

    // Handle form submission (Add/Edit)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!itemName.trim()) {
            alert('please input name.');
            return;
        }

        if (modalType === 'add') {
            // Simulate Add operation
            if (activeTab === 'provinces') {
                const newProvince = { id: provinces.length + 1, name: itemName };
                setProvinces([...provinces, newProvince]);
                alert('province added succesfully!');
            } else if (activeTab === 'districts') {
                if (!selectedProvinceId) {
                    alert('please select district.');
                    return;
                }
                const newDistrict = { id: districts.length + 1, name: itemName, provinceId: selectedProvinceId as number };
                setDistricts([...districts, newDistrict]);
                alert('district added succesfully!');
            } else if (activeTab === 'universities') {
                if (!selectedDistrictId) {
                    alert('please select district.');
                    return;
                }
                const newUniversity = { id: universities.length + 1, name: itemName, districtId: selectedDistrictId as number, location: '' };
                setUniversities([...universities, newUniversity]);
                alert('added university succesfully!');
            }
        } else if (modalType === 'edit' && editingItem) {
            // Simulate Edit operation
            if (activeTab === 'provinces') {
                setProvinces(provinces.map(p => p.id === editingItem.id ? { ...p, name: itemName } : p));
                alert('province edited succesfully!');
            } else if (activeTab === 'districts') {
                if (!selectedProvinceId) {
                    alert('please select province.');
                    return;
                }
                setDistricts(districts.map(d => d.id === editingItem.id ? { ...d, name: itemName, provinceId: selectedProvinceId as number } : d));
                alert('edited district successfully!');
            } else if (activeTab === 'universities') {
                if (!selectedDistrictId) {
                    alert('please select district.');
                    return;
                }
                setUniversities(universities.map(u => u.id === editingItem.id ? { ...u, name: itemName, districtId: selectedDistrictId as number } : u));
                alert('edited university successfully!');
            }
        }
        setIsModalOpen(false); // Close modal after submission
    };

    // Handle Delete operation
    const handleDeleteItem = (type: 'provinces' | 'districts' | 'universities', id: number) => {
        if (window.confirm(`Do u need to delete this? (ID: ${id})`)) {
            if (type === 'provinces') {
                setProvinces(provinces.filter(p => p.id !== id));
                // Also remove associated districts and universities (for dummy data)
                const remainingDistricts = districts.filter(d => d.provinceId !== id);
                setDistricts(remainingDistricts);
                setUniversities(universities.filter(u => !remainingDistricts.some(d => d.id === u.districtId)));
                alert('province deleted successfully!');
            } else if (type === 'districts') {
                setDistricts(districts.filter(d => d.id !== id));
                // Also remove associated universities
                setUniversities(universities.filter(u => u.districtId !== id));
                alert('deleted district successfully!');
            } else if (type === 'universities') {
                setUniversities(universities.filter(u => u.id !== id));
                alert('university deleted successfully!');
            }
        }
    };

    const filteredDistrictsForSelection = selectedProvinceId
        ? districts.filter(d => d.provinceId === selectedProvinceId)
        : [];

    return (
        <div className="space-y-8 min-h-screen pb-20">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">University & Location Hub</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage tertiary education institutes, districts, and geographic mapping</p>
                </div>
            </div>

            {/* Premium Glassmorphic Tab Grid Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tab 1: Universities */}
                <div
                    onClick={() => setActiveTab('universities')}
                    className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                        activeTab === 'universities'
                            ? 'bg-blue-600/10 border-blue-500/60 shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)]'
                            : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
                    }`}
                >
                    <div className="flex items-center gap-3.5">
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                            activeTab === 'universities' ? 'bg-blue-500/25 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-white/5 text-slate-400'
                        }`}>
                            <LuGraduationCap className="text-xl" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm tracking-tight">Universities ({universities.length})</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Manage academic campuses & details</p>
                        </div>
                    </div>
                    {activeTab === 'universities' && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.8)]"></div>
                    )}
                </div>

                {/* Tab 2: Districts */}
                <div
                    onClick={() => setActiveTab('districts')}
                    className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                        activeTab === 'districts'
                            ? 'bg-amber-600/10 border-amber-500/60 shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]'
                            : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
                    }`}
                >
                    <div className="flex items-center gap-3.5">
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                            activeTab === 'districts' ? 'bg-amber-500/25 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 text-slate-400'
                        }`}>
                            <LuBuilding2 className="text-xl" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm tracking-tight">Districts ({districts.length})</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Configure regional campus mapping</p>
                        </div>
                    </div>
                    {activeTab === 'districts' && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-amber-500 rounded-t-full shadow-[0_-2px_10px_rgba(245,158,11,0.8)]"></div>
                    )}
                </div>

                {/* Tab 3: Provinces */}
                <div
                    onClick={() => setActiveTab('provinces')}
                    className={`relative p-5.5 rounded-[22px] border cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl ${
                        activeTab === 'provinces'
                            ? 'bg-emerald-600/10 border-emerald-500/60 shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)]'
                            : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'
                    }`}
                >
                    <div className="flex items-center gap-3.5">
                        <div className={`p-3 rounded-xl transition-all duration-300 ${
                            activeTab === 'provinces' ? 'bg-emerald-500/25 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-white/5 text-slate-400'
                        }`}>
                            <LuMapPin className="text-xl" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm tracking-tight">Provinces ({provinces.length})</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 font-semibold">Geographic province configurations</p>
                        </div>
                    </div>
                    {activeTab === 'provinces' && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-emerald-500 rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,0.8)]"></div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-16 text-slate-500 text-sm">Loading Data...</div>
            ) : (
                <>
                    {activeTab === 'universities' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Universities List</h3>
                                <button
                                    onClick={() => handleAddItem('universities')}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 rounded-xl transition-all border-none cursor-pointer"
                                >
                                    <LuPlus className="text-base" /> Add New Uni / Institute
                                </button>
                            </div>
                            <div className="rounded-[1.75rem] overflow-hidden border border-white/[0.07] bg-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                                                <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Name</th>
                                                <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">District</th>
                                                <th className="py-3.5 px-5 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.04]">
                                            {universities.length > 0 ? (
                                                universities.map(uni => (
                                                    <tr key={uni.id} className="hover:bg-white/[0.04] transition-colors">
                                                        <td className="py-3.5 px-5 font-semibold text-white whitespace-nowrap">{uni.name}</td>
                                                        <td className="py-3.5 px-5 text-slate-400">{getDistrictName(uni.districtId)}</td>
                                                        <td className="py-3.5 px-5">
                                                            <div className="flex items-center justify-center gap-1.5">
                                                                <button
                                                                    onClick={() => handleEditItem('universities', uni)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all"
                                                                    title="සංස්කරණය කරන්න"
                                                                >
                                                                    <LuPencil className="text-sm" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteItem('universities', uni.id)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all"
                                                                    title="මකා දමන්න"
                                                                >
                                                                    <LuTrash2 className="text-sm" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={3} className="py-16 text-center text-slate-600 text-sm">විශ්වවිද්‍යාල හමු නොවීය.</td>
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
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Districts List</h3>
                                <button
                                    onClick={() => handleAddItem('districts')}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/20 rounded-xl transition-all border-none cursor-pointer"
                                >
                                    <LuPlus className="text-base" /> Add New District
                                </button>
                            </div>
                            <div className="rounded-[1.75rem] overflow-hidden border border-white/[0.07] bg-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                                                <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Name</th>
                                                <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Province</th>
                                                <th className="py-3.5 px-5 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.04]">
                                            {districts.map(district => (
                                                <tr key={district.id} className="hover:bg-white/[0.04] transition-colors">
                                                    <td className="py-3.5 px-5 font-semibold text-white whitespace-nowrap">{district.name}</td>
                                                    <td className="py-3.5 px-5 text-slate-400">{getProvinceName(district.provinceId)}</td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => handleEditItem('districts', district)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all"
                                                                title="සංස්කරණය කරන්න"
                                                            >
                                                                <LuPencil className="text-sm" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem('districts', district.id)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all"
                                                                title="මකා දමන්න"
                                                            >
                                                                <LuTrash2 className="text-sm" />
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
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Provinces List</h3>
                                <button
                                    onClick={() => handleAddItem('provinces')}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 rounded-xl transition-all border-none cursor-pointer"
                                >
                                    <LuPlus className="text-base" /> Add New Province
                                </button>
                            </div>
                            <div className="rounded-[1.75rem] overflow-hidden border border-white/[0.07] bg-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                                                <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Name</th>
                                                <th className="py-3.5 px-5 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/[0.04]">
                                            {provinces.map(province => (
                                                <tr key={province.id} className="hover:bg-white/[0.04] transition-colors">
                                                    <td className="py-3.5 px-5 font-semibold text-white whitespace-nowrap">{province.name}</td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <button
                                                                onClick={() => handleEditItem('provinces', province)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all"
                                                                title="සංස්කරණය කරන්න"
                                                            >
                                                                <LuPencil className="text-sm" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem('provinces', province.id)}
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all"
                                                                title="මකා දමන්න"
                                                            >
                                                                <LuTrash2 className="text-sm" />
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
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/95 backdrop-blur-2xl border border-white/[0.08] rounded-[2.5rem] shadow-2xl w-full max-w-md relative p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-white tracking-tight uppercase">
                                {modalType === 'edit' ? `Edit ${activeTab === 'universities' ? 'University / Institute' : activeTab === 'districts' ? 'District' : 'Province'} ` : `Add New Uni / Institute`}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-slate-400 hover:text-white transition-all hover:rotate-90"
                            >
                                <LuX className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {activeTab === 'districts' && (
                                <div>
                                    <label htmlFor="provinceSelect" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Select Province</label>
                                    <div className="relative">
                                        <select
                                            id="provinceSelect"
                                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-white/5 appearance-none
                                                [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2020%2020%22%3E%3Cpath%20fill=%22none%22%20stroke=%22%2394a3b8%22%20stroke-width=%222%22%20d=%22M6%208l4%204%204-4%22/%3E%3C/svg%3E')]
                                                bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem]"
                                            value={selectedProvinceId}
                                            onChange={(e) => setSelectedProvinceId(e.target.value === '' ? '' : Number(e.target.value))}
                                            required
                                        >
                                            <option value="" className="bg-slate-900 text-slate-450">Select Province</option>
                                            {provinces.map(province => (
                                                <option key={province.id} value={province.id} className="bg-slate-900">{province.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'universities' && (
                                <>
                                    <div>
                                        <label htmlFor="provinceSelect" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Select Province</label>
                                        <div className="relative">
                                            <select
                                                id="provinceSelect"
                                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-white/5 appearance-none
                                                    [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2020%2020%22%3E%3Cpath%20fill=%22none%22%20stroke=%22%2394a3b8%22%20stroke-width=%222%22%20d=%22M6%208l4%204%204-4%22/%3E%3C/svg%3E')]
                                                    bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem]"
                                                value={selectedProvinceId}
                                                onChange={(e) => {
                                                    setSelectedProvinceId(e.target.value === '' ? '' : Number(e.target.value));
                                                    setSelectedDistrictId('');
                                                }}
                                                required
                                            >
                                                <option value="" className="bg-slate-900 text-slate-455">Select Province</option>
                                                {provinces.map(province => (
                                                    <option key={province.id} value={province.id} className="bg-slate-900">{province.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="districtSelect" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Select District</label>
                                        <div className="relative">
                                            <select
                                                id="districtSelect"
                                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-white/5 appearance-none
                                                    [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2020%2020%22%3E%3Cpath%20fill=%22none%22%20stroke=%22%2394a3b8%22%20stroke-width=%222%22%20d=%22M6%208l4%204%204-4%22/%3E%3C/svg%3E')]
                                                    bg-no-repeat bg-[right_1rem_center] bg-[length:1.25rem]"
                                                value={selectedDistrictId}
                                                onChange={(e) => { setSelectedDistrictId(e.target.value === '' ? '' : Number(e.target.value)) }}
                                                required
                                                disabled={!selectedProvinceId}
                                            >
                                                <option value="" className="bg-slate-900 text-slate-455">Select District</option>
                                                {filteredDistrictsForSelection.map(district => (
                                                    <option key={district.id} value={district.id} className="bg-slate-900">{district.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </>
                            )}
                            <div>
                                <label htmlFor="itemName" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">{activeTab === 'universities'? 'University / Institute Name' : activeTab === 'districts' ? 'District Name' : 'Province Name'}</label>
                                <input
                                    type="text"
                                    id="itemName"
                                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-white/5 transition-all"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    placeholder="Enter name..."
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-350 hover:text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
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
