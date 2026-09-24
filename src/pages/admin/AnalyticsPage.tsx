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

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

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
            <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h2>
                <p className="text-slate-500 text-xs font-semibold tracking-wide mt-1">Platform metrics, user demographics, and listing distribution</p>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-wider text-xs animate-pulse">Loading Platform Metrics...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Summary Cards */}
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
                            <div className='bg-blue-50 w-10 h-10 flex items-center justify-center rounded-xl border border-blue-100'>
                                <FaUsers className='h-5 w-5 text-blue-600' />
                            </div>
                            <h3 className="text-3xl mt-4 font-extrabold text-slate-900">{analyticsData.totalUsers}</h3>
                            <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-wider">Total Users</p>
                        </div>
                        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
                            <div className='bg-emerald-50 w-10 h-10 flex items-center justify-center rounded-xl border border-emerald-100'>
                                <FaClipboardList className='h-5 w-5 text-emerald-600' />
                            </div>
                            <h3 className="text-3xl mt-4 font-extrabold text-slate-900">{analyticsData.totalAnnexes}</h3>
                            <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-wider">Total Listings</p>
                        </div>
                        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
                            <div className='bg-rose-50 w-10 h-10 flex items-center justify-center rounded-xl border border-rose-100'>
                                <FaUserCheck className='h-5 w-5 text-rose-600' />
                            </div>
                            <h3 className="text-3xl mt-4 font-extrabold text-slate-900">{analyticsData.monthlyNewUsers[analyticsData.monthlyNewUsers.length - 1]?.users || 0}</h3>
                            <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-wider">New Users (Monthly)</p>
                        </div>
                        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
                            <div className='bg-amber-50 w-10 h-10 flex items-center justify-center rounded-xl border border-amber-100'>
                                <FaClipboardList className='h-5 w-5 text-amber-600' />
                            </div>
                            <h3 className="text-3xl mt-4 font-extrabold text-slate-900">{analyticsData.totalAnnouncement}</h3>
                            <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-wider">Announcements</p>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Listing Status Breakdown</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={analyticsData.annexStatus}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={95}
                                    fill="#2563eb"
                                    dataKey="value"
                                    label={({ name, percent }: { name: string; percent?: number }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                                >
                                    {analyticsData.annexStatus.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Listings by University</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={analyticsData.annexesPerUniversity}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a' }} />
                                <Legend />
                                <Bar dataKey="count" fill="#2563eb" name="Listings" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Monthly Student Growth</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={analyticsData.monthlyNewUsers}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a' }} />
                                <Legend />
                                <Bar dataKey="users" fill="#10b981" name="Registered Students" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="lg:col-span-2 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Listings by District</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                data={analyticsData.annexesPerDistrict}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                <YAxis stroke="#64748b" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '0.75rem', color: '#0f172a' }} />
                                <Legend />
                                <Bar dataKey="count" fill="#f59e0b" name="Listings" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            )}
        </div>
    );
};

export default AnalyticsPage;
