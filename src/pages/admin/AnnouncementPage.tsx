import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaPlusCircle, FaTimes } from 'react-icons/fa';

// Dummy Announcement Data
const DUMMY_ANNOUNCEMENTS = [
    { id: 'ann1', title: 'නව Annex ලියාපදිංචි කිරීමේ ක්‍රියාවලිය', content: 'දැන් ඔබට ඔබගේ Annexes වඩාත් පහසුවෙන් ලියාපදිංචි කළ හැක. වැඩි විස්තර සඳහා අපගේ උපකාරක අංශය වෙත පිවිසෙන්න.', postedDate: '2024-07-01', imageUrl: 'https://placehold.co/400x200/FF5733/FFFFFF?text=New+Feature' },
    { id: 'ann2', title: 'වෙබ් අඩවි නඩත්තු කිරීම', content: 'හෙට (ජූලි 10) අලුයම 2 සිට 4 දක්වා වෙබ් අඩවිය නඩත්තු කිරීමක් සිදුවන බව කරුණාවෙන් සලකන්න.', postedDate: '2024-07-09', imageUrl: 'https://placehold.co/400x200/3366FF/FFFFFF?text=Maintenance' },
    { id: 'ann3', title: 'නව විශේෂාංග නිකුත් කිරීම', content: 'අපගේ වෙබ් අඩවියට නව සෙවුම් පෙරහන් (search filters) එක් කර ඇත. දැන් ඔබට අවශ්‍ය Annexes ඉක්මනින් සොයාගත හැක.', postedDate: '2024-06-25', imageUrl: 'https://placehold.co/400x200/33FF57/000000?text=New+Filters' },
    { id: 'ann4', title: 'විශ්වවිද්‍යාල ශිෂ්‍යාවන්ට විශේෂ දීමනා', content: 'සීමිත කාලයක් සඳහා, ඇතැම් නවාතැන් සඳහා විශේෂ වට්ටම් ලබා ගත හැක. අදම ගවේෂණය කරන්න!', postedDate: '2024-08-01', imageUrl: 'https://placehold.co/400x200/FFCC33/000000?text=Special+Offers' },
    { id: 'ann5', title: 'අපගේ නව ජංගම යෙදුම', content: 'දැන් ඔබට අපගේ නව ජංගම යෙදුම හරහා පහසුවෙන් නවාතැන් සොයාගත හැක. App Store/Play Store වෙතින් බාගත කරන්න.', postedDate: '2024-08-05', imageUrl: 'https://placehold.co/400x200/9933FF/FFFFFF?text=Mobile+App' },
];

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState(DUMMY_ANNOUNCEMENTS);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'add' | 'edit' | null>(null);
    const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);

    // Form states for adding/editing
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const [imageUrl, setImageUrl] = useState(''); // Image URL හෝ Base64 string එක ගබඩා කරයි
    const fileInputRef = useRef<HTMLInputElement>(null); // File input එකට reference එකක්

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setAnnouncements(DUMMY_ANNOUNCEMENTS);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
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
    const handleEditAnnouncement = (announcement: any) => {
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
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('කරුණාකර සියලුම ක්ෂේත්‍ර පුරවන්න.');
            return;
        }

        const currentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD format

        if (modalType === 'add') {
            const newAnnouncement = {
                id: `ann${announcements.length + 1}`, // Simple ID generation for dummy data
                title: title,
                content: content,
                postedDate: currentDate,
                imageUrl: imageUrl,
            };
            setAnnouncements([newAnnouncement, ...announcements]);
            alert('නිවේදනය සාර්ථකව එකතු කරන ලදී!');
        } else if (modalType === 'edit' && editingAnnouncement) {
            setAnnouncements(prevAnnouncements =>
                prevAnnouncements.map(ann =>
                    ann.id === editingAnnouncement.id ? { ...ann, title: title, content: content, imageUrl: imageUrl } : ann
                )
            );
            alert('නිවේදනය සාර්ථකව යාවත්කාලීන කරන ලදී!');
        }
        setIsModalOpen(false);
    };

    // Handle Delete operation
    const handleDeleteAnnouncement = (id: string) => {
        if (window.confirm(`ඔබට මෙම නිවේදනය මකා දැමීමට අවශ්‍යද? (ID: ${id})`)) {
            setAnnouncements(announcements.filter(ann => ann.id !== id));
            alert('නිවේදනය සාර්ථකව මකා දමන ලදී!');
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
                                    <p className="text-sm text-gray-500 mt-2">Posted Date : {ann.postedDate}</p>
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