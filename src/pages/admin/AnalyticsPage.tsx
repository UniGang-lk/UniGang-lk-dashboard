import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaClipboardList, FaUserCheck, FaUsers } from "react-icons/fa";

const DUMMY_ANALYTICS_DATA = {
    totalUsers: 1500,
    totalAnnexes: 550,
    totalAnnouncement: 8,
    annexStatus: [
        { name: 'Active', value: 350 },
        { name: 'Pending', value: 100 },
        { name: 'Rejected', value: 50 },
        { name: 'Expired', value: 50 },
    ],
    annexesPerUniversity: [
        { name: 'Peradeniya', count: 120 },
        { name: 'Colombo', count: 80 },
        { name: 'Moratuwa', count: 60 },
        { name: 'Jaffna', count: 40 },
        { name: 'Ruhuna', count: 30 },
    ],
    annexesPerDistrict: [
        { name: 'Kandy', count: 130 },
        { name: 'Colombo', count: 100 },
        { name: 'Gampaha', count: 70 },
        { name: 'Galle', count: 50 },
        { name: 'Matara', count: 40 },
    ],
    monthlyNewUsers: [
        { month: 'Jan', users: 50 },
        { month: 'Feb', users: 75 },
        { month: 'Mar', users: 60 },
        { month: 'Apr', users: 90 },
        { month: 'May', users: 80 },
        { month: 'Jun', users: 110 },
        { month: 'Jul', users: 130 },
    ],
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#f44336', '#4caf50', '#2196f3']; // Pie chart colors

const AnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState(DUMMY_ANALYTICS_DATA);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        // In a real app, you would fetch data from your backend here
        // fetch('/api/admin/analytics')
        //   .then(res => res.json())
        //   .then(data => {
        //     setAnalyticsData(data);
        //     setLoading(false);
        //   })
        //   .catch(error => {
        //     console.error("Failed to fetch analytics:", error);
        //     setLoading(false);
        //   });
        const timer = setTimeout(() => {
            setAnalyticsData(DUMMY_ANALYTICS_DATA);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="bg-gray-700 border border-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h2>

            {loading ? (
                <div className="text-center py-10 text-white">Loading Data...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Summary Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="flex flex-col justify-start bg-white p-5 shadow rounded-lg">
                            <div className='bg-[#2196f3] w-12 h-12 flex items-center justify-center rounded-md'>
                                <FaUsers className='h-7 w-7' />
                            </div>
                            <h3 className="text-4xl mt-4  font-bold text-black">{analyticsData.totalUsers}</h3>
                            <p className="text-gray-500 text-md mt-4 font-bold">Total Users</p>
                        </div>
                        <div className="flex flex-col justify-start bg-white p-5 shadow rounded-lg">
                            <div className='bg-[#4caf50] w-12 h-12 flex items-center justify-center rounded-md'>
                                <FaClipboardList className='h-7 w-7' />
                            </div>
                            <h3 className="text-4xl mt-4  font-bold text-black">{analyticsData.totalAnnexes}</h3>
                            <p className="text-gray-500 text-md mt-4 font-bold">Total Advertiesment</p>
                        </div>
                        <div className="flex flex-col justify-start bg-white p-5 shadow rounded-lg">
                            <div className='bg-[#f44336] w-12 h-12 flex items-center justify-center rounded-md'>
                                <FaUserCheck className='h-7 w-7' />
                            </div>
                            <h3 className="text-4xl mt-4  font-bold text-black">{analyticsData.monthlyNewUsers[analyticsData.monthlyNewUsers.length - 1]?.users || 0}</h3>
                            <p className="text-gray-500 text-md mt-4 font-bold">New Users (Monthly)</p>
                        </div>
                        <div className="flex flex-col justify-start bg-white p-5 shadow rounded-lg">
                            <div className='bg-[#ff7300] w-12 h-12 flex items-center justify-center rounded-md'>
                                <FaClipboardList className='h-7 w-7' />
                            </div>
                            <h3 className="text-4xl mt-4  font-bold text-black">{analyticsData.totalAnnouncement}</h3>
                            <p className="text-gray-500 text-md mt-4 font-bold">Total Announcement</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Advertisement Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={analyticsData.annexStatus}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }: { name: string; percent?: number }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                >
                                    {analyticsData.annexStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Advertisements by university</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={analyticsData.annexesPerUniversity}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#8884d8" name="Advertisements" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly new users</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={analyticsData.monthlyNewUsers}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="users" fill="#82ca9d" name="Users" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-md border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Advertiesments by districts</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={analyticsData.annexesPerDistrict}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#ffc658" name="Advertiesments" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
