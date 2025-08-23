import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
        {/* Public/User-facing routes */}
        {/* <Route path="/" element={<><Header /><HomePage /><Footer /></>} />
        <Route path="/find-accommodation" element={<><Header /><FindAccommodationPage /><Footer /></>} />
        <Route path="/post-ad" element={<><Header /><PostAdPage /><Footer /></>} />
        <Route path="/contact-us" element={<><Header /><ContactUsPage /><Footer /></>} />
        <Route path="/annex/:id" element={<><Header /><AnnexDetailsPage /><Footer /></>} />
        <Route path="/profile" element={<><Header /><ProfilePage /><Footer /></>} /> */}

        {/* Admin Dashboard routes */}
        {/* AdminLayout එකට දාන pages වලට Header/Footer අවශ්‍ය නැත */}
        <Route path="/" element={<AdminLayout />}>
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
