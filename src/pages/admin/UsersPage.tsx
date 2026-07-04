import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaUserShield, FaUserGraduate, FaUserTag, FaEye, FaTimesCircle } from 'react-icons/fa'; 
import { fetchUsers, deleteUser as deleteUserApi, verifyUser, updateUserProfile } from '../../api/api';
import type { User } from '../../types/schema';
import { useToast } from '../../context/ToastContext';

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  // Custom modal states
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | number | null>(null);

  // Edit user form fields
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editIsVerifiedStudent, setEditIsVerifiedStudent] = useState(false);
  const [editIsVerifiedLandlord, setEditIsVerifiedLandlord] = useState(false);

  const startEditUser = (user: any) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'student');
    setEditStatus(user.status || 'active');
    setEditIsVerifiedStudent(user.is_verified_student || false);
    setEditIsVerifiedLandlord(user.is_verified_landlord || false);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUserProfile(editingUser.id, {
        name: editName,
        email: editEmail,
        role: editRole,
        status: editStatus,
        is_verified_student: editIsVerifiedStudent,
        is_verified_landlord: editIsVerifiedLandlord
      });
      toast.success('User profile updated successfully.');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update user profile.');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // User data loading
  useEffect(() => {
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

  // Handle user delete
  const handleDeleteUser = async (userId: number | string) => {
    setConfirmDeleteUserId(userId);
  };

  const executeDeleteUser = async () => {
    if (!confirmDeleteUserId) return;
    try {
      await deleteUserApi(confirmDeleteUserId);
      setUsers(users.filter(user => user.id !== confirmDeleteUserId));
      toast.success('User deleted successfully.');
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user.");
    } finally {
      setConfirmDeleteUserId(null);
    }
  };

  return (
    <>
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
          <option value="student" className="bg-slate-900">Student</option>
          <option value="landlord" className="bg-slate-900">Landlord</option>
          <option value="admin" className="bg-slate-900">Admin</option>
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
                  <th className="py-3.5 px-5 text-left text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Verification</th>
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
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 w-fit">
                          {user.role === 'admin' && <FaUserShield className="text-blue-400 text-xs" />}
                          {user.role === 'landlord' && <FaUserTag className="text-blue-400 text-xs" />}
                          {user.role === 'student' && <FaUserGraduate className="text-blue-400 text-xs" />}
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{user.role}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`py-1 px-2.5 rounded-full text-[10px] font-black border uppercase tracking-tighter ${
                          user.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          user.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {(user.role === 'student' && user.is_verified_student) || (user.role === 'landlord' && user.is_verified_landlord) ? (
                          <span className="py-1 px-2.5 rounded-full text-[10px] font-black border uppercase tracking-tighter bg-blue-500/10 text-blue-400 border-blue-500/20">
                            Verified
                          </span>
                        ) : (
                          <span className="py-1 px-2.5 rounded-full text-[10px] font-black border uppercase tracking-tighter bg-amber-500/10 text-amber-400 border-amber-500/20">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-slate-500 text-xs">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-500/35 transition-all border-none cursor-pointer"
                            title="View User Details"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          {user.verification_id_url && (
                            <button
                              onClick={async () => {
                                try {
                                  await verifyUser(user.id);
                                  toast.success(`Verified user ${user.id} and safely destroyed ID photo.`);
                                  loadUsers();
                                } catch (err) {
                                  toast.error('Failed to verify user.');
                                }
                              }}
                              className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-400 hover:text-white hover:bg-emerald-500/30 transition-all border-none cursor-pointer"
                              title="Approve ID & Delete Photo"
                            >
                              <FaUserShield className="text-sm" />
                            </button>
                          )}
                          <button
                            onClick={() => startEditUser(user)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-600/50 transition-all border-none cursor-pointer"
                            title="Edit"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 hover:bg-red-500/25 transition-all border-none cursor-pointer"
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

    {/* Custom Delete Confirmation Modal */}
    {confirmDeleteUserId && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="w-full max-w-md p-6 bg-slate-900 border border-white/[0.08] rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-white mb-2">Delete User Account</h3>
          <p className="text-slate-400 text-sm mb-6">Are you sure you want to permanently delete this user account? All listings, events, and blogs associated with this user will be removed.</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDeleteUserId(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-lg transition-all border-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={executeDeleteUser}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all border-none cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}

    {/* View User Details Modal */}
    {selectedUser && (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <div className="w-full max-w-xl bg-slate-900 border border-white/[0.08] rounded-3xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
          <button
            onClick={() => setSelectedUser(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer border-none bg-transparent"
          >
            <FaTimesCircle size={20} />
          </button>
          <div className="flex items-center gap-4 mb-6">
            <img
              src={selectedUser.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`}
              alt={selectedUser.name}
              className="w-16 h-16 rounded-full object-cover border border-white/10"
            />
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white leading-tight">{selectedUser.name}</h3>
              <p className="text-xs text-slate-500 font-bold">ID: {selectedUser.id}</p>
            </div>
          </div>
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Email address</span>
                <span className="text-sm font-semibold text-white truncate block">{selectedUser.email}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">System Role</span>
                <span className="text-sm font-semibold text-white capitalize block">{selectedUser.role}</span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Account Status</span>
                <span className={`text-sm font-semibold block capitalize ${selectedUser.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedUser.status}
                </span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/[0.04]">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Mobile Phone</span>
                <span className="text-sm font-semibold text-white block">{selectedUser.phone || 'N/A'}</span>
              </div>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/[0.04] space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Verification Badges</span>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUser.is_verified_student ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
                  Student: {selectedUser.is_verified_student ? 'Verified' : 'Unverified'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUser.is_verified_landlord ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
                  Landlord: {selectedUser.is_verified_landlord ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </div>
            {selectedUser.verification_id_url && (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/[0.04] text-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 text-left">Uploaded Student ID Card</span>
                <img
                  src={`http://localhost:5001${selectedUser.verification_id_url}`}
                  alt="Student ID"
                  className="max-h-48 rounded-xl object-contain mx-auto border border-white/10"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Edit User Modal */}
    {editingUser && (
      <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <form onSubmit={handleSaveUser} className="w-full max-w-xl bg-slate-900 border border-white/[0.08] rounded-3xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
          <button
            type="button"
            onClick={() => setEditingUser(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer border-none bg-transparent"
          >
            <FaTimesCircle size={20} />
          </button>
          <h3 className="text-2xl font-bold text-white mb-6 text-left">Edit User Profile</h3>
          
          <div className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-2.5 text-white text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-white text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-2.5 text-white text-sm bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="student" className="bg-slate-900">Student</option>
                  <option value="landlord" className="bg-slate-900">Landlord</option>
                  <option value="admin" className="bg-slate-900">Admin</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-4 py-2.5 text-white text-sm bg-slate-800 border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                >
                  <option value="active" className="bg-slate-900">Active</option>
                  <option value="suspended" className="bg-slate-900">Suspended</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2 mt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Verification Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-white text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsVerifiedStudent}
                    onChange={(e) => setEditIsVerifiedStudent(e.target.checked)}
                    className="rounded border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  Verified Student
                </label>
                <label className="flex items-center gap-2 text-white text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsVerifiedLandlord}
                    onChange={(e) => setEditIsVerifiedLandlord(e.target.checked)}
                    className="rounded border-white/20 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  Verified Landlord
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] rounded-xl transition-all border-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all border-none cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    )}
    </>
  );
};

export default UsersPage;
