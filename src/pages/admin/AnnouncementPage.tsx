import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaPlusCircle, FaTimes } from 'react-icons/fa';

import { fetchAnnouncements, updateEntity, deleteEntity, STORAGE_KEYS } from '../../api/api';
import type { Announcement } from '../../types/schema';

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

    // Form states for adding/editing
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [imageUrl, setImageUrl] = useState(''); // Image URL හෝ Base64 string එක ගබඩා කරයි
    const fileInputRef = useRef<HTMLInputElement>(null); // File input එකට reference එකක්

    useEffect(() => {
        const loadAnnouncements = async () => {
            setLoading(true);
            try {
                const data = await fetchAnnouncements();
                setAnnouncements(data);
            } catch (error) {
                console.error("Failed to fetch announcements:", error);
            } finally {
                setLoading(false);
            }
        };
        loadAnnouncements();
    }, []);

    // Handle Add button click
    const handleAddAnnouncement = () => {
        setModalType('add');
        setTitle('');
        setContent('');
        setImageUrl('');
        setEditingAnnouncement(null);
        setIsModalOpen(true);
    };

    // Handle Edit button click
    const handleEditAnnouncement = (announcement: Announcement) => {
        setModalType('edit');
        setEditingAnnouncement(announcement);
        setTitle(announcement.title);
        setContent(announcement.content);
        setImageUrl(announcement.imageUrl || '');
        setIsModalOpen(true);
    };

    // Local image file change handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                // File එක Base64 string එකක් විදිහට save කරන්න
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file); // File එක Base64 විදිහට කියවන්න
        }
    };

    // Remove uploaded image
    const handleRemoveImage = () => {
        setImageUrl('');
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // File input එකත් clear කරන්න
        }
    };


    // Handle form submission (Add/Edit)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('please input all fields.');
            return;
        }

        try {
            if (modalType === 'add') {
                const newAnn: Announcement = {
                    id: Math.floor(Math.random() * 10000),
                    admin_id: 1,
                    title,
                    content,
                    priority: 'medium',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                // In a real app we'd call createEntity, here we just push to state or localStorage
                const existing = JSON.parse(localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS) || '[]');
                localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify([newAnn, ...existing]));
                setAnnouncements([newAnn, ...announcements]);
                alert('announcement added successfully!');
            } else if (modalType === 'edit' && editingAnnouncement) {
                await updateEntity(STORAGE_KEYS.ANNOUNCEMENTS, editingAnnouncement.id, { title, content });
                setAnnouncements(prevAnnouncements =>
                    prevAnnouncements.map(ann =>
                        ann.id === editingAnnouncement.id ? { ...ann, title, content } : ann
                    )
                );
                alert('announcement updated successfully!');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save announcement:", error);
            alert("Failed to save announcement");
        }
    };

    // Handle Delete operation
    const handleDeleteAnnouncement = async (id: number) => {
        if (window.confirm(`Do you need to delete this? (ID: ${id})`)) {
            try {
                await deleteEntity(STORAGE_KEYS.ANNOUNCEMENTS, id);
                setAnnouncements(announcements.filter(ann => ann.id !== id));
                alert('announcement deleted successfully!');
            } catch (error) {
                console.error("Failed to delete announcement:", error);
                alert("Failed to delete announcement.");
            }
        }
    };

    return (
        <div className="bg-gray-700 border border-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-6">Announcements Management</h2>

            <div className="flex justify-end items-center mb-4">
                {/* <h3 className="text-lg font-semibold text-gray-700">Announcements List</h3> */}
                <div
                    onClick={handleAddAnnouncement}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
                >
                    <FaPlusCircle className="mr-2" /> New Announcement
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10 text-white">Loading Announcements...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.length > 0 ? (
                        announcements.map(ann => (
                            <div key={ann.id} className="bg-gray-50 border border-gray-200 rounded-lg shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all duration-300 overflow-hidden transform relative hover:z-10 hover:scale-105">
                                {ann.imageUrl ? (
                                    <img src={ann.imageUrl} alt={ann.title} className="w-full h-40 object-cover" onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x200/cccccc/ffffff?text=No+Image'; }} />
                                ) : (
                                    <div className="w-full h-40 bg-gray-300 flex items-center justify-center text-gray-500">
                                        Image Not Available
                                    </div>
                                )}
                                <div className="p-5 flex-grow">
                                    {/* -- END IMAGE FEATURE CHANGE -- */}
                                    <h3 className="text-md font-semibold text-gray-800 mb-2">{ann.title}</h3>
                                    <p className="text-gray-700 text-sm mb-3 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                        {ann.content}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-2">Posted Date : {ann.created_at ? new Date(ann.created_at).toLocaleDateString() : '—'}</p>
                                </div>
                                <div className="mt-2 p-5 pt-0 flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleEditAnnouncement(ann)}
                                        className="p-2 rounded-full text-blue-500 hover:bg-blue-100 transition-colors duration-200"
                                        title="Edit"
                                    >
                                        <FaEdit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteAnnouncement(ann.id)}
                                        className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors duration-200"
                                        title="Delete"
                                    >
                                        <FaTrash className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-6 text-center text-gray-500">No Announcements.</div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                            {modalType === 'add' ? 'Add New Announcement' : 'Edit Announcement'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="announcementTitle" className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    id="announcementTitle"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="announcementContent" className="block text-sm font-medium text-gray-700">Content</label>
                                <textarea
                                    id="announcementContent"
                                    rows={3}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm resize-y focus:outline-none"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700">Image (Optional)</label>
                                <input
                                    type="file"
                                    id="imageUpload"
                                    ref={fileInputRef}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                                <p className="mt-1 text-sm text-gray-500">Upload an image for the announcement.</p>
                                {imageUrl && ( // Uploaded image එකක් තියෙනවා නම් preview එක පෙන්වන්න
                                    <div className="mt-2 relative">
                                        <img src={imageUrl} alt="Preview" className="w-25 h-25 object-cover rounded-md border border-gray-200" />
                                        <div
                                            onClick={handleRemoveImage}
                                            className="absolute top-1 left-19 bg-red-500 text-white rounded-full p-1 opacity-75 hover:opacity-100"
                                            title="Remove Image"
                                        >
                                            <FaTimes className="h-3 w-3" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                                <div
                                    onClick={() => setIsModalOpen(false)}
                                    className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                                >
                                    Cancel
                                </div>
                                <div
                                    onClick={handleSubmit}
                                    className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    {modalType === 'add' ? 'Add' : 'Save Changes'}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsPage;