import { useState, useEffect } from 'react';
import {
  FaEdit, FaTrash, FaSearch, FaEye, FaTimesCircle
} from 'react-icons/fa';
import {
  LuUsers, LuChevronLeft, LuChevronRight,
  LuChevronsLeft, LuChevronsRight
} from 'react-icons/lu';
import { fetchUsers, deleteUser as deleteUserApi, updateUserProfile } from '../../api/api';
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
      console.error('Failed to load users:', error);
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleVerification = async (user: any) => {
    const newStatus = !user.is_verified_student;
    try {
      await updateUserProfile(user.id, {
        is_verified_student: newStatus
      });
      toast.success(`${user.name}'s student verification updated to ${newStatus ? 'Verified' : 'Unverified'}.`);
      loadUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update verification.');
    }
  };

  const executeDeleteUser = async () => {
    if (!confirmDeleteUserId) return;
    try {
      await deleteUserApi(confirmDeleteUserId);
      toast.success('User account deleted successfully.');
      setConfirmDeleteUserId(null);
      loadUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete user.');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesRole = filterRole === 'All' || user.role?.toLowerCase() === filterRole.toLowerCase();
    const matchesStatus = filterStatus === 'All' || user.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const studentsCount = users.filter(u => u.role === 'student').length;
  const landlordsCount = users.filter(u => u.role === 'landlord').length;
  const adminsCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6">
      {/* ðŸŒŸ 1. Header (Icon + Title) ðŸŒŸ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <LuUsers className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              User Management
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage undergraduate students, verified landlords, and platform administrators
            </p>
          </div>
        </div>
      </div>

      {/* ðŸŒŸ 2. Filter Tabs (Sigma Underline Style) ðŸŒŸ */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-bold overflow-x-auto custom-scrollbar">
        <button
          onClick={() => { setFilterRole('All'); setCurrentPage(1); }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            filterRole === 'All'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>ALL USERS</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
            {users.length}
          </span>
        </button>

        <button
          onClick={() => { setFilterRole('student'); setCurrentPage(1); }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            filterRole === 'student'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>STUDENTS</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
            {studentsCount}
          </span>
        </button>

        <button
          onClick={() => { setFilterRole('landlord'); setCurrentPage(1); }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            filterRole === 'landlord'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>LANDLORDS</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
            {landlordsCount}
          </span>
        </button>

        <button
          onClick={() => { setFilterRole('admin'); setCurrentPage(1); }}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            filterRole === 'admin'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>ADMINS</span>
          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
            {adminsCount}
          </span>
        </button>
      </div>

      {/* ðŸŒŸ 3. Floating White Card Container (Table & Controls) ðŸŒŸ */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4 text-center">Student Verified (Switch)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    Loading users database...
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => {
                  const isVerified = Boolean(user.is_verified_student);
                  const isUserActive = String(user.status || '').toLowerCase() === 'active';
                  return (
                    <tr key={user.id} className="hover:bg-blue-50/20 transition-colors">
                      {/* Index */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <span
                            onClick={() => setSelectedUser(user)}
                            className="cursor-pointer hover:text-blue-600 hover:underline"
                          >
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'landlord' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* ðŸŒŸ Blue iOS Toggle Switch for Student Verification ðŸŒŸ */}
                      <td className="py-3.5 px-4 text-center">
                        <div
                          onClick={() => handleToggleVerification(user)}
                          className={`toggle-switch-track mx-auto ${isVerified ? 'active' : 'inactive'}`}
                          title={isVerified ? 'Click to mark unverified' : 'Click to verify student'}
                        >
                          <div className={`toggle-switch-thumb ${isVerified ? 'active' : 'inactive'}`} />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${
                          isUserActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="View Profile Details"
                          >
                            <FaEye className="text-xs" />
                          </button>
                          <button
                            onClick={() => startEditUser(user)}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteUserId(user.id)}
                            className="w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ðŸŒŸ Pagination Bar ðŸŒŸ */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span>
              {totalItems > 0 ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}` : '0 of 0'}
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                title="First Page"
              >
                <LuChevronsLeft className="text-sm" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                title="Previous Page"
              >
                <LuChevronLeft className="text-sm" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                title="Next Page"
              >
                <LuChevronRight className="text-sm" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                title="Last Page"
              >
                <LuChevronsRight className="text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ðŸŒŸ Light Theme Delete Modal ðŸŒŸ */}
      {confirmDeleteUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white border border-slate-200 rounded-2xl shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">Delete User Account</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Are you sure you want to permanently delete this user account? All listings, events, and reviews associated with this account will be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteUserId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeDeleteUser}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ðŸŒŸ Light Theme View User Details Modal ðŸŒŸ */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-y-auto max-h-[90vh] custom-scrollbar">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-2 rounded-full cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <FaTimesCircle size={20} />
            </button>
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
              <img
                src={selectedUser.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.name}`}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedUser.name}</h3>
                <p className="text-xs text-blue-600 font-bold">Account ID: #{selectedUser.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Email Address</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">{selectedUser.email}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">System Role</span>
                  <span className="text-xs font-bold text-slate-900 capitalize block">{selectedUser.role}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Account Status</span>
                  <span className="text-xs font-bold text-emerald-700 capitalize block">{selectedUser.status || 'Active'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Mobile Phone</span>
                  <span className="text-xs font-bold text-slate-900 block">{selectedUser.phone || 'N/A'}</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Verification Status</span>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUser.is_verified_student ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                    Student: {selectedUser.is_verified_student ? 'Verified' : 'Unverified'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUser.is_verified_landlord ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    Landlord: {selectedUser.is_verified_landlord ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              {selectedUser.verification_id_url && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 text-left">Uploaded Student ID Card</span>
                  <img
                    src={selectedUser.verification_id_url}
                    alt="Student ID"
                    className="max-h-56 mx-auto rounded-xl border border-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ðŸŒŸ Light Theme Edit User Modal ðŸŒŸ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 sm:p-8 relative">
            <h3 className="text-xl font-black text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Edit User Account
            </h3>
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">System Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="landlord">Landlord</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsVerifiedStudent}
                    onChange={(e) => setEditIsVerifiedStudent(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Verified Student</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsVerifiedLandlord}
                    onChange={(e) => setEditIsVerifiedLandlord(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Verified Landlord</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
