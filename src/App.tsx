import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout'; 
import UsersPage from './pages/admin/UsersPage';
import AnnexesPage from './pages/admin/AnnexesPage';
import UniversitiesPage from './pages/admin/UniversitiesPage';
import AnnouncementsPage from './pages/admin/AnnouncementPage';
import './App.css';
import AnalyticsPage from './pages/admin/AnalyticsPage';

function App() {
  return (
    <Router>
      <Routes>
         {/* Redirect root to /admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Admin Dashboard routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<UsersPage />} /> {/* /admin ට ගියාම මුල් පිටුව පෙන්වයි */}
          <Route path="users" element={<UsersPage />} />
          <Route path="annexes" element={<AnnexesPage />} />
          <Route path="settings/universities" element={<UniversitiesPage />} />
          <Route path="settings/announcements" element={<AnnouncementsPage />} />
          <Route path="settings/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* 404 Page (Optional) */}
        <Route path="*" element={<div>404 Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
