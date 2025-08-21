import { useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaChartBar, FaBullhorn, FaUniversity } from 'react-icons/fa';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <aside className="fixed w-64 bg-gray-800 flex flex-col min-h-screen p-4 shadow-lg flex-shrink-0">
            <div
                // onClick={() => navigate('/admin')}
                className="text-xl font-bold text-start mb-5 p-3 text-white"
            >
                Admin Panel
            </div>
            <nav className="flex-grow">
                <ul className="space-y-2">
                    <li>
                        <div
                            onClick={() => navigate("/admin/users")}
                            className={`flex items-center p-3 text-md rounded-lg font-semibold text-gray-300 hover:bg-gray-700 hover:text-white hover:cursor-pointer transition-colors duration-200
                                ${location.pathname === '/admin/users' ? 'bg-gray-600 text-white':''}`}
                        >
                            <FaUsers className="mr-3 text-lg" />
                            <span>User Management</span>
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => navigate("/admin/annexes")}
                            className={`flex items-center p-3 text-md rounded-lg font-semibold text-gray-300 hover:bg-gray-700 hover:text-white hover:cursor-pointer transition-colors duration-200
                                ${location.pathname === '/admin/annexes' ? 'bg-gray-600 text-white':''}`}
                        >
                            <FaClipboardList className="mr-3 text-md" />
                            <span>Ads Management</span>
                        </div>
                    </li>
                    <li className="pt-4 border-t border-gray-700 mt-4">
                        <span className="text-xs font-semibold uppercase text-gray-400 px-3 mb-2 block">Website Settings</span>
                    </li>
                    <li>
                        <div
                            onClick={() => navigate("/admin/settings/universities")}
                            className={`flex items-center p-3 text-md rounded-lg font-semibold text-gray-300 hover:bg-gray-700 hover:text-white hover:cursor-pointer transition-colors duration-200
                                ${location.pathname === '/admin/settings/universities' ? 'bg-gray-600 text-white':''}`}
                        >
                            <FaUniversity className="mr-3 text-md" />
                            <span>University / Institute</span>
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => navigate("/admin/settings/announcements")}
                           className={`flex items-center p-3 text-md rounded-lg font-semibold text-gray-300 hover:bg-gray-700 hover:text-white hover:cursor-pointer transition-colors duration-200
                                ${location.pathname === '/admin/settings/announcements' ? 'bg-gray-600 text-white':''}`}
                        >
                            <FaBullhorn className="mr-3 text-md" />
                            <span>Announcements</span>
                        </div>
                    </li>
                    <li>
                        <div
                            onClick={() => navigate("/admin/settings/analytics")}
                            className={`flex items-center p-3 text-md rounded-lg font-semibold text-gray-300 hover:bg-gray-700 hover:text-white hover:cursor-pointer transition-colors duration-200
                                ${location.pathname === '/admin/settings/analytics' ? 'bg-gray-600 text-white':''}`}
                        >
                            <FaChartBar className="mr-3 text-md" />
                            <span>Analytics</span>
                        </div>
                    </li>
                </ul>
            </nav>
            {/* Logout Button (විකල්ප: header එකේ ද තැබිය හැක) */}
            <div className="mt-auto pt-4 border-t border-gray-700">
                {/* <button
                    onClick={() => console.log('Admin Logout')} // මෙතනට logout logic එක දාන්න
                    className="flex items-center p-3 rounded-lg text-gray-200 hover:bg-red-600 hover:text-white transition-colors duration-200 w-full"
                >
                    <FaCog className="mr-3 text-xl" />
                    <span>පිටවීම</span>
                </button> */}
            </div>
        </aside>
    );
};

export default AdminSidebar;
