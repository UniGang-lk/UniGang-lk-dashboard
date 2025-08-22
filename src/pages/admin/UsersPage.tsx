import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa'; 

const DUMMY_USERS = [
  { id: 'u1', name: 'Nimal Perera', email: 'nimal.p@example.com', role: 'Student', status: 'Active', registeredDate: '2023-01-15' },
  { id: 'u2', name: 'Kamala Silva', email: 'kamala.s@example.com', role: 'Owner', status: 'Active', registeredDate: '2023-02-20' },
  { id: 'u3', name: 'Sunil Fernando', email: 'sunil.f@example.com', role: 'Student', status: 'Suspended', registeredDate: '2023-03-01' },
  { id: 'u4', name: 'Amara Bandara', email: 'amara.b@example.com', role: 'Student', status: 'Active', registeredDate: '2023-04-10' },
  { id: 'u5', name: 'Piyal Rajapaksha', email: 'piyal.r@example.com', role: 'Owner', status: 'Active', registeredDate: '2023-05-05' },
  { id: 'u6', name: 'Gayani Samaraweera', email: 'gayani.s@example.com', role: 'Student', status: 'Active', registeredDate: '2023-06-12' },
];

const UsersPage = () => {
  const [users, setUsers] = useState(DUMMY_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(false); // For future API calls

  // User data loading simulation (for future API integration)
  useEffect(() => {
    setLoading(true);
    // In a real app, you would fetch data from your backend here
    // fetch('/api/admin/users')
    //   .then(res => res.json())
    //   .then(data => {
    //     setUsers(data);
    //     setLoading(false);
    //   })
    //   .catch(error => {
    //     console.error("Failed to fetch users:", error);
    //     setLoading(false);
    //   });
    const timer = setTimeout(() => {
        setUsers(DUMMY_USERS); 
        setLoading(false);
    }, 500); 
    return () => clearTimeout(timer);
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

  // Handle user delete (placeholder)
  const handleDeleteUser = (userId: string) => {
    if (window.confirm(`ඔබට user ID ${userId} මකා දැමීමට අවශ්‍යද?`)) {
      console.log(`Delete user with ID: ${userId}`);
      // In a real app, you would send a DELETE request to your backend
      setUsers(users.filter(user => user.id !== userId)); // Remove from UI
      alert(`User ID ${userId} සාර්ථකව මකා දමන ලදී.`);
    }
  };

  return (
    <div className="bg-gray-700 border border-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-6">User Management</h2>

      {/* Search and Filter Section */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search from name or email..."
            className="w-full pl-10 pr-4 py-2 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <select
          className="w-full text-white md:w-auto py-2 pl-3 pr-8 border border-gray-300 rounded-md focus:outline-none appearance-none bg-gray-700
          [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2020%2020%22%3E%3Cpath%20fill=%22none%22%20stroke=%22%23fff%22%20stroke-width=%222%22%20d=%22M6%208l4%204%204-4%22/%3E%3C/svg%3E')]
          bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem]"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Student">Student</option>
          <option value="Owner">Owner</option>
        </select>

        <select
          className="w-full text-white md:w-auto py-2 pl-3 pr-8 border border-gray-300 rounded-md focus:outline-none appearance-none bg-gray-700
          [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2214%22%20height=%2214%22%20viewBox=%220%200%2020%2020%22%3E%3Cpath%20fill=%22none%22%20stroke=%22%23fff%22%20stroke-width=%222%22%20d=%22M6%208l4%204%204-4%22/%3E%3C/svg%3E')]
          bg-no-repeat bg-[right_0.5rem_center] bg-[length:1.25rem]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-white">Users Loading ...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-200 border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-300 text-left text-black uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Registered Date</th>
                <th className="py-3 px-6 text-center">Option</th>
              </tr>
            </thead>
            <tbody className="text-black text-sm font-light">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-300">
                    <td className="py-3 px-6 text-left whitespace-nowrap">{user.name}</td>
                    <td className="py-3 px-6 text-left">{user.email}</td>
                    <td className="py-3 px-6 text-left">{user.role}</td>
                    <td className="py-3 px-6 text-left">
                      <span className={`py-1 px-3 rounded-full text-xs font-semibold ${
                        user.status === 'Active' ? 'bg-green-200 text-green-800' :
                        user.status === 'Suspended' ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left">{user.registeredDate}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="w-8 h-8 mr-2 transform text-black hover:text-blue-500 hover:scale-110"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-8 h-8 transform text-black hover:text-red-500 hover:scale-110"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">Users Not Found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
