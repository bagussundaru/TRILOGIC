import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CivilProvider } from './contexts/CivilContext';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Construction from './pages/Construction';
import DailyLogsPage from './pages/DailyLogsPage';
import CashFlowPage from './pages/CashFlowPage';
import PhotoGalleryPage from './pages/PhotoGalleryPage';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient();

function AppRoutes() {
    return (
        <Routes>
            {/* Direct Demo Mode Routing - No Login Barriers */}
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
                <Layout currentPageName="Dashboard"><Dashboard /></Layout>
            } />

            <Route path="/construction" element={
                <Layout currentPageName="Construction"><Construction /></Layout>
            } />

            <Route path="/daily-logs" element={
                <Layout currentPageName="DailyLogs"><DailyLogsPage /></Layout>
            } />

            <Route path="/cashflow" element={
                <Layout currentPageName="CashFlow"><CashFlowPage /></Layout>
            } />

            <Route path="/photo-gallery" element={
                <Layout currentPageName="PhotoGallery"><PhotoGalleryPage /></Layout>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <CivilProvider>
                    <Router>
                        <AppRoutes />
                    </Router>
                </CivilProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
}
