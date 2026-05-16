import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import AnnexesPage from './pages/admin/AnnexesPage';
import UniversitiesPage from './pages/admin/UniversitiesPage';

import AnalyticsPage from './pages/admin/AnalyticsPage';
import EventsPage from './pages/admin/EventsPage';
import ServicesPage from './pages/admin/ServicesPage';
import BlogsPage from './pages/admin/BlogsPage';
import ContactsPage from './pages/admin/ContactsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        {/* Admin Layout wraps all admin pages */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"                   element={<DashboardPage />} />
          <Route path="users"                       element={<UsersPage />} />
          <Route path="annexes"                     element={<AnnexesPage />} />
          <Route path="events"                      element={<EventsPage />} />
          <Route path="services"                    element={<ServicesPage />} />
          <Route path="blogs"                       element={<BlogsPage />} />
          <Route path="contacts"                    element={<ContactsPage />} />
          <Route path="notifications"               element={<NotificationsPage />} />
          <Route path="settings/universities"       element={<UniversitiesPage />} />

          <Route path="settings/analytics"          element={<AnalyticsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
