import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import AnnexesPage from './pages/admin/AnnexesPage';
import UniversitiesPage from './pages/admin/UniversitiesPage';
import AnnouncementsPage from './pages/admin/AnnouncementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Admin Layout wraps all admin pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard"                   element={<DashboardPage />} />
          <Route path="users"                       element={<UsersPage />} />
          <Route path="annexes"                     element={<AnnexesPage />} />
          <Route path="settings/universities"       element={<UniversitiesPage />} />
          <Route path="settings/announcements"      element={<AnnouncementsPage />} />
          <Route path="settings/analytics"          element={<AnalyticsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
