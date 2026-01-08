import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Implementations from './pages/Implementations';
import Resources from './pages/Resources';
import Automation from './pages/Automation';
import Reports from './pages/Reports';
import LoginPage from './pages/LoginPage';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
    const { isAuthenticated, loading, user, hasRole } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                    <p className="text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Check role if specified
    if (allowedRoles && !hasRole(allowedRoles)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// Public Route (redirect to dashboard if authenticated)
function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <Loader2 className="w-10 h-10 animate-spin text-teal-400" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout currentPageName="Dashboard"><Dashboard /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/implementations" element={
                <ProtectedRoute>
                    <Layout currentPageName="Implementations"><Implementations /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/resources" element={
                <ProtectedRoute allowedRoles={['CEO', 'CFO', 'CTO', 'PMO_Director', 'Project_Manager', 'Team_Lead']}>
                    <Layout currentPageName="Resources"><Resources /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/automation" element={
                <ProtectedRoute allowedRoles={['CEO', 'CTO', 'PMO_Director']}>
                    <Layout currentPageName="Automation"><Automation /></Layout>
                </ProtectedRoute>
            } />

            <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['CEO', 'CFO', 'CTO', 'PMO_Director', 'Finance']}>
                    <Layout currentPageName="Reports"><Reports /></Layout>
                </ProtectedRoute>
            } />

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </QueryClientProvider>
    );
}
