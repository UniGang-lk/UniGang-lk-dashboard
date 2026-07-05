import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import AnnexesPage from './pages/admin/AnnexesPage';
import AdvertisementsPage from './pages/admin/AdvertisementsPage';
import UniversitiesPage from './pages/admin/UniversitiesPage';

import AnalyticsPage from './pages/admin/AnalyticsPage';
import EventsPage from './pages/admin/EventsPage';
import ServicesPage from './pages/admin/ServicesPage';
import BlogsPage from './pages/admin/BlogsPage';
import ContactsPage from './pages/admin/ContactsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import MarketplacePage from './pages/admin/MarketplacePage';
import AnnouncementsPage from './pages/admin/AnnouncementsPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
        <Routes>
          {/* Public login gate */}
          <Route path="/login" element={<LoginPage />} />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Admin Layout wraps all admin pages, protected by Firebase Auth Gate */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"                   element={<DashboardPage />} />
            <Route path="users"                       element={<UsersPage />} />
            <Route path="annexes"                     element={<AnnexesPage />} />
            <Route path="events"                      element={<EventsPage />} />
            <Route path="advertisements"              element={<AdvertisementsPage />} />
            <Route path="services"                    element={<ServicesPage />} />
            <Route path="blogs"                       element={<BlogsPage />} />
            <Route path="contacts"                    element={<ContactsPage />} />
            <Route path="notifications"               element={<NotificationsPage />} />
            <Route path="announcements"               element={<AnnouncementsPage />} />
            <Route path="marketplace"                 element={<MarketplacePage />} />
            <Route path="settings/universities"       element={<UniversitiesPage />} />

            <Route path="settings/analytics"          element={<AnalyticsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </AuthProvider>
   </ToastProvider>
  );
}

export default App;

