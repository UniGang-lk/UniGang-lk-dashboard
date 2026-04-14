import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlusCircle } from 'react-icons/fa';

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
        <div className="bg-gray-700 border border-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-6">University / Institute Management</h2>

            {/* Tabs for Navigation */}
            <div className="mb-6 flex items-center border-gray-100 gap-2">
                <div
                    onClick={() => setActiveTab('universities')}
                    className={`w-28 text-center p-2 text-sm bg-[#2196f3] rounded-md font-medium cursor-pointer ${activeTab === 'universities' ? 'border-b-2 border-white text-white' : 'text-black hover:text-gray-700'}`}
                >
                    Universities
                </div>
                <div
                    onClick={() => setActiveTab('districts')}
                    className={`w-28 text-center p-2 text-sm rounded-md bg-[#ff7300] font-medium cursor-pointer ${activeTab === 'districts' ? 'border-b-2 border-white text-white' : 'text-black hover:text-gray-700'}`}
                >
                    Districts
                </div>
                <div
                    onClick={() => setActiveTab('provinces')}
                    className={`w-28 text-center p-2 text-sm rounded-md bg-[#4caf50] font-medium cursor-pointer ${activeTab === 'provinces' ? 'border-b-2 border-white text-white' : 'text-black hover:text-gray-700'}`}
                >
                    Provinces
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-white">Loading Data...</div>
            ) : (
                <>
                    {activeTab === 'universities' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-700">Universities List</h3>
                                <div
                                    onClick={() => handleAddItem('universities')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
                                >
                                    <FaPlusCircle className="mr-2" /> Add New Uni or Institute
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-gray-600 border-2 border-gray-200 rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-700 text-left text-white uppercase text-sm leading-normal">
                                            <th className="py-3 px-6 text-left">Name</th>
                                            <th className="py-3 px-6 text-left">District</th>
                                            <th className="py-3 px-6 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white text-sm font-light">
                                        {universities.length > 0 ? (
                                            universities.map(uni => (
                                                <tr key={uni.id} className="border-b border-gray-200 hover:bg-gray-700">
                                                    <td className="py-3 px-6 text-left">{uni.name}</td>
                                                    <td className="py-3 px-6 text-left">{getDistrictName(uni.districtId)}</td>
                                                    <td className="py-3 px-6 text-center">
                                                        <div className="flex item-center justify-center">
                                                            <button
                                                                onClick={() => handleEditItem('universities', uni)}
                                                                className="w-8 h-8 mr-2 transform text-black hover:text-blue-500 hover:scale-110"
                                                                title="සංස්කරණය කරන්න"
                                                            >
                                                                <FaEdit/>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem('universities', uni.id)}
                                                                className="w-8 h-8 transform text-black hover:text-red-500 hover:scale-110"
                                                                title="මකා දමන්න"
                                                            >
                                                                <FaTrash/>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="py-6 text-center text-white">විශ්වවිද්‍යාල හමු නොවීය.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'districts' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Districts List</h3>
                                {/* <button
                                    onClick={() => handleAddItem('districts')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                                >
                                    <FaPlusCircle className="mr-2" /> අලුත් දිස්ත්‍රික්කයක්
                                </button> */}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-gray-600 border border-gray-200 rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-700 text-left text-white uppercase text-sm leading-normal">
                                            <th className="py-3 px-6 text-left">Name</th>
                                            <th className="py-3 px-6 text-left">Province</th>
                                            <th className="py-3 px-6 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white text-sm font-light">
                                        {districts.map(district => (
                                                <tr key={district.id} className="border-b border-gray-200 hover:bg-gray-700">
                                                    <td className="py-3 px-6 text-left">{district.name}</td>
                                                    <td className="py-3 px-6 text-left">{getProvinceName(district.provinceId)}</td>
                                                    <td className="py-3 px-6 text-center">
                                                        <div className="flex item-center justify-center">
                                                            <button
                                                                onClick={() => handleEditItem('districts', district)}
                                                                className="w-8 h-8 mr-2 transform text-black hover:text-blue-500 hover:scale-110"
                                                                title="සංස්කරණය කරන්න"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem('districts', district.id)}
                                                                className="w-8 h-8 transform text-black hover:text-red-500 hover:scale-110"
                                                                title="මකා දමන්න"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'provinces' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Provinces List</h3>
                                {/* <button
                                    onClick={() => handleAddItem('provinces')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                                >
                                    <FaPlusCircle className="mr-2" /> අලුත් පළාතක්
                                </button> */}
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-gray-600 border border-gray-200 rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-700 text-left text-white uppercase text-sm leading-normal">
                                            <th className="py-3 px-6 text-left">Name</th>
                                            <th className="py-3 px-6 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-white text-sm font-light">
                                        {provinces.map(province => (
                                                <tr key={province.id} className="border-b border-gray-200 hover:bg-gray-700">
                                                    <td className="py-3 px-6 text-left">{province.name}</td>
                                                    <td className="py-3 px-6 text-center">
                                                        <div className="flex item-center justify-center">
                                                            <button
                                                                onClick={() => handleEditItem('provinces', province)}
                                                                className="w-8 h-8 mr-2 transform text-black hover:text-blue-500 hover:scale-110"
                                                                title="සංස්කරණය කරන්න"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem('provinces', province.id)}
                                                                className="w-8 h-8 transform text-black hover:text-red-500 hover:scale-110"
                                                                title="මකා දමන්න"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-xl font-bold text-black mb-6 text-center">
                            {modalType === 'edit' ? `Edit ${activeTab === 'universities' ? 'University or Institute' : activeTab === 'districts' ? 'District' : 'Province'} ` : `Add New Uni or Institute`}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {activeTab === 'districts' && (
                                <div>
                                    <label htmlFor="provinceSelect" className="block text-md font-medium text-gray-700">Select Province</label>
                                    <select
                                        id="provinceSelect"
                                         className="w-full py-2 pl-3 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-white
          [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2020%2020%22%3E%3Cpath%20fill=%22none%22%20stroke=%22%23666%22%20stroke-width=%222%22%20d=%22M6%208l4%204%204-4%22/%3E%3C/svg%3E')]
          bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem]"
                                        value={selectedProvinceId}
                                        onChange={(e) => setSelectedProvinceId(e.target.value)}
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
                                    <div>
                                        <label htmlFor="districtSelect" className="block text-md font-medium mb-2 text-gray-700">Select Province</label>
                                        <select
                                            id="provinceSelect"
                                            className="w-full py-2 pl-3 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-white
          [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2020%2020%22%3E%3Cpath%20fill=%22none%22%20stroke=%22%23666%22%20stroke-width=%222%22%20d=%22M6%208l4%204%204-4%22/%3E%3C/svg%3E')]
          bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem]"
                                            value={selectedProvinceId}
                                            onChange={(e) => {
                                                setSelectedProvinceId(e.target.value);
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
                                    <div>
                                        <label htmlFor="districtSelect" className="block text-md font-medium mb-2 text-gray-700">Select District</label>
                                        <select
                                            id="districtSelect"
                                            className="w-full py-2 pl-3 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-white
          [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2020%2020%22%3E%3Cpath%20fill=%22none%22%20stroke=%22%23666%22%20stroke-width=%222%22%20d=%22M6%208l4%204%204-4%22/%3E%3C/svg%3E')]
          bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem]"
                                            value={selectedDistrictId}
                                            onChange={(e) => { setSelectedDistrictId(e.target.value) }}
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
                            <div>
                                <label htmlFor="itemName" className="block text-md font-medium text-gray-700">{activeTab === 'universities'? 'University / Institute' : activeTab === 'districts' ? 'Edit District' : 'Edit Province'}</label>
                                <input
                                    type="text"
                                    id="itemName"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <div
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex w- 20 py-2 px-4 items-center justify-center border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                                >
                                    Cancel
                                </div>
                                <div
                                    onClick={handleSubmit}
                                    className="flex w-20 py-2 px-4 items-center justify-center border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    {modalType === 'add' ? 'Add' : 'Save'}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UniversitiesPage;
