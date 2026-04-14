import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa'; 
import { fetchUsers, deleteUser as deleteUserApi } from '../../api/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  // User data loading
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        // Placeholder token for now - in real app, get from auth context/storage
        const token = localStorage.getItem('token') || ''; 
        const data = await fetchUsers(token);
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Filtered users based on search term, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditUser = (userId: string) => {
    console.log(`Edit user with ID: ${userId}`);
    alert(`User ID ${userId} ready to edit.`);
  };

  // Handle user delete
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(`Are you sure you want to delete user ID ${userId}?`)) {
      try {
        const token = localStorage.getItem('token') || '';
        await deleteUserApi(userId, token);
        setUsers(users.filter(user => user.id !== userId));
        alert(`User ID ${userId} deleted successfully.`);
      } catch (error) {
        console.error("Failed to delete user:", error);
        alert("Failed to delete user.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-extrabold text-white tracking-tight">User Management</h2>

      {/* Search and Filter Section */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 text-white text-sm bg-white/[0.05] border border-white/[0.08] rounded-xl
              focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50
              placeholder:text-slate-600 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 text-sm" />
        </div>

        <select
          className="text-sm text-white bg-white/[0.05] border border-white/[0.08] rounded-xl
            py-2.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="All" className="bg-slate-900">All Roles</option>
          <option value="Student" className="bg-slate-900">Student</option>
          <option value="Owner" className="bg-slate-900">Owner</option>
        </select>

        <select
          className="text-sm text-white bg-white/[0.05] border border-white/[0.08] rounded-xl
            py-2.5 pl-3 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All" className="bg-slate-900">All Status</option>
          <option value="Active" className="bg-slate-900">Active</option>
          <option value="Suspended" className="bg-slate-900">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">Loading users...</div>
      ) : (
        <div className="rounded-[1.75rem] overflow-hidden border border-white/[0.07] bg-white/[0.03] shadow-[0_4px_30px_rgba(0,0,0,0.25)]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                  <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Name</th>
                  <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Email</th>
                  <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Role</th>
                  <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Status</th>
                  <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Joined</th>
                  <th className="py-3.5 px-5 text-center text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-white whitespace-nowrap">{user.name}</td>
                      <td className="py-3.5 px-5 text-slate-400">{user.email}</td>
                      <td className="py-3.5 px-5">
                        <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">{user.role}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`py-1 px-2.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${
                          user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          user.status === 'Suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditUser(user.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all"
                            title="Edit"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all"
                            title="Delete"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-600 text-sm">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
