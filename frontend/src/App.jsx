import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { lazy, Suspense } from 'react';

import Layout from './components/Layout/Layout';

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Watch = lazy(() => import('./pages/Watch'));
const Upload = lazy(() => import('./pages/Upload'));
const Channel = lazy(() => import('./pages/Channel'));
const Search = lazy(() => import('./pages/Search'));
const Shorts = lazy(() => import('./pages/Shorts'));
const History = lazy(() => import('./pages/History'));
const WatchLater = lazy(() => import('./pages/WatchLater'));
const LikedVideos = lazy(() => import('./pages/LikedVideos'));
const Playlists = lazy(() => import('./pages/Playlists'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const Trending = lazy(() => import('./pages/Trending'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const EditVideo = lazy(() => import('./pages/EditVideo'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading spinner
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
            <div className="w-12 h-12 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-accent-blue rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
    </div>
);

// Route guards
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <PageLoader />;
    return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated, loading } = useAuth();
    if (loading) return <PageLoader />;
    if (!isAuthenticated) return <Navigate to="/auth" replace />;
    if (user?.role !== 'admin') return <Navigate to="/" replace />;
    return children;
};

const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return <PageLoader />;
    return isAuthenticated ? <Navigate to="/" replace /> : children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster
                    position="bottom-left"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#212121',
                            color: '#f1f1f1',
                            borderRadius: '12px',
                            border: '1px solid #303030',
                            padding: '12px 16px',
                            fontSize: '14px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        },
                        success: {
                            iconTheme: { primary: '#10b981', secondary: '#fff' },
                        },
                        error: {
                            iconTheme: { primary: '#f43f5e', secondary: '#fff' },
                        },
                    }}
                />

                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            {/* Public Routes */}
                            <Route index element={<Home />} />
                            <Route path="search" element={<Search />} />
                            <Route path="trending" element={<Trending />} />
                            <Route path="shorts" element={<Shorts />} />
                            <Route path="watch/:id" element={<Watch />} />
                            <Route path="channel/:id" element={<Channel />} />

                            {/* Auth */}
                            <Route path="auth" element={<GuestRoute><Auth /></GuestRoute>} />

                            {/* Protected Routes */}
                            <Route path="upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
                            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="edit/:id" element={<ProtectedRoute><EditVideo /></ProtectedRoute>} />
                            <Route path="history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                            <Route path="watch-later" element={<ProtectedRoute><WatchLater /></ProtectedRoute>} />
                            <Route path="liked-videos" element={<ProtectedRoute><LikedVideos /></ProtectedRoute>} />
                            <Route path="playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
                            <Route path="subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
                            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                            {/* Admin */}
                            <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

                            {/* 404 */}
                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    );
}

export default App;
