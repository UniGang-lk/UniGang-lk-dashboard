import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import AnnexesPage from './pages/admin/AnnexesPage';
import ReviewsPage from './pages/admin/ReviewsPage';
import AdvertisementsPage from './pages/admin/AdvertisementsPage';
import UniversitiesPage from './pages/admin/UniversitiesPage';

import AnalyticsPage from './pages/admin/AnalyticsPage';
import EventsPage from './pages/admin/EventsPage';
import ServicesPage from './pages/admin/ServicesPage';
import BlogsPage from './pages/admin/BlogsPage';
import ProposalsPage from './pages/admin/ProposalsPage';
import ContactsPage from './pages/admin/ContactsPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import MarketplacePage from './pages/admin/MarketplacePage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/admin/ProtectedRoute';
import PageErrorBoundary from './components/ui/PageErrorBoundary';
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
            <Route path="dashboard"                   element={<PageErrorBoundary fallbackTitle="Dashboard Overview"><DashboardPage /></PageErrorBoundary>} />
            <Route path="users"                       element={<PageErrorBoundary fallbackTitle="User Management"><UsersPage /></PageErrorBoundary>} />
            <Route path="annexes"                     element={<PageErrorBoundary fallbackTitle="Annex Management"><AnnexesPage /></PageErrorBoundary>} />
            <Route path="reviews"                     element={<PageErrorBoundary fallbackTitle="Review Moderation"><ReviewsPage /></PageErrorBoundary>} />
            <Route path="events"                      element={<PageErrorBoundary fallbackTitle="Events Section"><EventsPage /></PageErrorBoundary>} />
            <Route path="advertisements"              element={<PageErrorBoundary fallbackTitle="Advertisements Section"><AdvertisementsPage /></PageErrorBoundary>} />
            <Route path="services"                    element={<PageErrorBoundary fallbackTitle="Services Section"><ServicesPage /></PageErrorBoundary>} />
            <Route path="blogs"                       element={<PageErrorBoundary fallbackTitle="Blogs Section"><BlogsPage /></PageErrorBoundary>} />
            <Route path="proposals"                   element={<PageErrorBoundary fallbackTitle="Proposals Section"><ProposalsPage /></PageErrorBoundary>} />
            <Route path="proposals/security-alerts"   element={<PageErrorBoundary fallbackTitle="Security Alerts"><ProposalsPage /></PageErrorBoundary>} />
            <Route path="contacts"                    element={<PageErrorBoundary fallbackTitle="Contact Inquiries"><ContactsPage /></PageErrorBoundary>} />
            <Route path="notifications"               element={<PageErrorBoundary fallbackTitle="Notifications"><NotificationsPage /></PageErrorBoundary>} />
            <Route path="marketplace"                 element={<PageErrorBoundary fallbackTitle="Marketplace"><MarketplacePage /></PageErrorBoundary>} />
            <Route path="settings/universities"       element={<PageErrorBoundary fallbackTitle="University Registry"><UniversitiesPage /></PageErrorBoundary>} />

            <Route path="settings/analytics"          element={<PageErrorBoundary fallbackTitle="Analytics"><AnalyticsPage /></PageErrorBoundary>} />
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
