import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { MusicProvider } from './contexts/MusicContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MusicLibrary from './pages/MusicLibrary';
import Recommendations from './pages/Recommendations';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Meditations from './pages/Meditations';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminMusic from './pages/AdminMusic';
import AdminArticles from './pages/AdminArticles';
import NotFound from './pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MusicProvider>
          <Router>
            <div className="App">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/music" element={
                  <ProtectedRoute>
                    <Layout>
                      <MusicLibrary />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/recommendations" element={
                  <ProtectedRoute>
                    <Layout>
                      <Recommendations />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/playlists" element={
                  <ProtectedRoute>
                    <Layout>
                      <Playlists />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/playlists/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <PlaylistDetail />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/articles" element={
                  <ProtectedRoute>
                    <Layout>
                      <Articles />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/articles/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <ArticleDetail />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/meditations" element={
                  <ProtectedRoute>
                    <Layout>
                      <Meditations />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* Admin routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <Layout>
                      <AdminDashboard />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/users" element={
                  <ProtectedRoute requireAdmin>
                    <Layout>
                      <AdminUsers />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/music" element={
                  <ProtectedRoute requireAdmin>
                    <Layout>
                      <AdminMusic />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/articles" element={
                  <ProtectedRoute requireAdmin>
                    <Layout>
                      <AdminArticles />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                {/* 404 route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </div>
          </Router>
        </MusicProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
