import AdminSidebar from './AdminSidebar'; 
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-700">
      <AdminSidebar />

      <div className="w-277.5 flex-1 flex flex-col ml-64 h-screen">
        <header className="bg-gray-700 shadow-lg p-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-white">Uni Gang  Dashboard</h2>
          <div className="text-md font-semibold text-white">Admin Kaja</div>
        </header>

        {/* පිටුවේ අන්තර්ගතය */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
