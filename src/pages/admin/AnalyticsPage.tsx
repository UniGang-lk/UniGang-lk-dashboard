import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaClipboardList, FaUserCheck, FaUsers } from "react-icons/fa";
import { fetchStats } from '../../api/api';

const DUMMY_ANALYTICS_DATA = {
    totalUsers: 0,
    totalAnnexes: 0,
    totalAnnouncement: 0,
    annexStatus: [
        { name: 'Active', value: 0 },
        { name: 'Pending', value: 0 },
        { name: 'Rejected', value: 0 },
        { name: 'Expired', value: 0 },
    ],
    annexesPerUniversity: [
        { name: 'Peradeniya', count: 0 },
        { name: 'Colombo', count: 0 },
        { name: 'Moratuwa', count: 0 },
        { name: 'Jaffna', count: 0 },
        { name: 'Ruhuna', count: 0 },
    ],
    annexesPerDistrict: [
        { name: 'Kandy', count: 0 },
        { name: 'Colombo', count: 0 },
        { name: 'Gampaha', count: 0 },
        { name: 'Galle', count: 0 },
        { name: 'Matara', count: 0 },
    ],
    monthlyNewUsers: [
        { month: 'Jan', users: 0 },
        { month: 'Feb', users: 0 },
        { month: 'Mar', users: 0 },
        { month: 'Apr', users: 0 },
        { month: 'May', users: 0 },
        { month: 'Jun', users: 0 },
        { month: 'Jul', users: 0 },
    ],
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#f44336', '#4caf50', '#2196f3']; // Pie chart colors

const AnalyticsPage = () => {
    const [analyticsData, setAnalyticsData] = useState(DUMMY_ANALYTICS_DATA);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                const data: any = await fetchStats();
                setAnalyticsData(prev => ({
                    ...prev,
                    totalUsers: data.totalStudents,
                    totalAnnexes: data.pendingAnnexes + data.approvedAnnexes,
                    annexStatus: [
                        { name: 'Active', value: data.approvedAnnexes },
                        { name: 'Pending', value: data.pendingAnnexes },
                        { name: 'Rejected', value: 0 },
                        { name: 'Expired', value: 0 },
                    ]
                }));
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Analytics Dashboard</h2>

            {loading ? (
                <div className="text-center py-10 text-white">Loading Data...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Summary Cards */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                        <div className="flex flex-col justify-start bg-white/[0.05] border border-white/[0.07] p-5 rounded-[1.5rem] shadow">
                            <div className='bg-blue-500/20 w-11 h-11 flex items-center justify-center rounded-xl'>
                                <FaUsers className='h-5 w-5 text-blue-400' />
                            </div>
                            <h3 className="text-3xl mt-4 font-black text-white">{analyticsData.totalUsers}</h3>
                            <p className="text-slate-500 text-xs mt-2 font-semibold uppercase tracking-wider">Total Users</p>
                        </div>
                        <div className="flex flex-col justify-start bg-white/[0.05] border border-white/[0.07] p-5 rounded-[1.5rem] shadow">
                            <div className='bg-emerald-500/20 w-11 h-11 flex items-center justify-center rounded-xl'>
                                <FaClipboardList className='h-5 w-5 text-emerald-400' />
                            </div>
                            <h3 className="text-3xl mt-4 font-black text-white">{analyticsData.totalAnnexes}</h3>
                            <p className="text-slate-500 text-xs mt-2 font-semibold uppercase tracking-wider">Total Ads</p>
                        </div>
                        <div className="flex flex-col justify-start bg-white/[0.05] border border-white/[0.07] p-5 rounded-[1.5rem] shadow">
                            <div className='bg-red-500/20 w-11 h-11 flex items-center justify-center rounded-xl'>
                                <FaUserCheck className='h-5 w-5 text-red-400' />
                            </div>
                            <h3 className="text-3xl mt-4 font-black text-white">{analyticsData.monthlyNewUsers[analyticsData.monthlyNewUsers.length - 1]?.users || 0}</h3>
                            <p className="text-slate-500 text-xs mt-2 font-semibold uppercase tracking-wider">New Users (Monthly)</p>
                        </div>
                        <div className="flex flex-col justify-start bg-white/[0.05] border border-white/[0.07] p-5 rounded-[1.5rem] shadow">
                            <div className='bg-amber-500/20 w-11 h-11 flex items-center justify-center rounded-xl'>
                                <FaClipboardList className='h-5 w-5 text-amber-400' />
                            </div>
                            <h3 className="text-3xl mt-4 font-black text-white">{analyticsData.totalAnnouncement}</h3>
                            <p className="text-slate-500 text-xs mt-2 font-semibold uppercase tracking-wider">Announcements</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="bg-white/[0.05] border border-white/[0.07] p-5 rounded-[1.5rem] shadow-md">
                        <h3 className="text-base font-bold text-white mb-4">Advertisement Status</h3>
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
                                    {analyticsData.annexStatus.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white/[0.05] border border-white/[0.07] p-5 rounded-[1.5rem] shadow-md">
                        <h3 className="text-base font-bold text-white mb-4">Advertisements by university</h3>
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

                    <div className="lg:col-span-2 bg-white/[0.05] border border-white/[0.07] p-5 rounded-[1.5rem] shadow-md">
                        <h3 className="text-base font-bold text-white mb-4">Monthly new users</h3>
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

                    <div className="lg:col-span-2 bg-white/[0.05] border border-white/[0.07] p-5 rounded-[1.5rem] shadow-md">
                        <h3 className="text-base font-bold text-white mb-4">Advertiesments by districts</h3>
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
