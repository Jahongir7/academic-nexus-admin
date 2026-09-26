import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Journals from './pages/Journals';
import Issues from './pages/Issues';
import Articles from './pages/Articles';
import Submissions from './pages/Submissions';
import News from './pages/News';
import Users from './pages/Users';
import Settings from './pages/Settings';
import axiosClient from './api/axiosClient';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400">
        <span className="inline-block w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-3" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Only Guard
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

// Main Layout Wrapper
const AdminLayout = ({ children }) => {
  const [pendingSubCount, setPendingSubCount] = useState(0);

  useEffect(() => {
    const checkPending = async () => {
      try {
        const res = await axiosClient.get('/submissions?status=pending');
        if (res.data.success) {
          setPendingSubCount(res.data.count || 0);
        }
      } catch (err) {
        // Silent catch
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 font-sans">
      <Sidebar pendingCount={pendingSubCount} />
      <div className="flex-1 overflow-x-hidden">{children}</div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/journals"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Journals />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/issues"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Issues />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/articles"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Articles />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/submissions"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Submissions />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/news"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <News />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminLayout>
                      <Users />
                    </AdminLayout>
                  </AdminRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Settings />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
