import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VideoPage from './pages/VideoPage';
import ChannelPage from './pages/ChannelPage';
import UploadPage from './pages/UploadPage';
import DashboardPage from './pages/DashboardPage';
import PlaylistPage from './pages/PlaylistPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import LikedVideosPage from './pages/LikedVideosPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import CommunityPage from './pages/CommunityPage';
import SubscriptionsPage from './pages/SubscriptionsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a2e',
              color: '#e8e8e8',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#2ed573', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#e94560', secondary: '#fff' },
            },
          }}
        />

        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/video/:videoId" element={<VideoPage />} />
            <Route path="/channel/:username" element={<ChannelPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/playlists" element={<PlaylistPage />} />
            <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
            <Route path="/liked-videos" element={<LikedVideosPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              color: '#8b8b8b',
              fontFamily: "'Inter', sans-serif",
              background: '#0f0f0f',
            }}>
              <h1 style={{ fontSize: '4rem', fontWeight: 800, color: '#e94560' }}>404</h1>
              <p>Page not found</p>
              <a href="/" style={{ color: '#e94560', marginTop: '1rem' }}>Go Home</a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
