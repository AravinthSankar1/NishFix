import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { SoftwareDetailsPage } from './pages/SoftwareDetailsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DataWorksPage } from './pages/DataWorksPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminSoftwarePage } from './pages/AdminSoftwarePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Guarded Route for Admin
const AdminProtectedRoute: React.FC = () => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        Verifying administrator credentials...
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Guarded Route for Logged In User
const UserProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        Verifying account credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-slate-100">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public & Borneo DataWorks Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/dataworks" element={<DataWorksPage />} />
          <Route path="/browse" element={<Navigate to="/dataworks" replace />} />
          <Route path="/software/:id" element={<SoftwareDetailsPage />} />

          {/* Auth Flow Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* User Protected Routes */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/software" element={<AdminSoftwarePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <MainLayout />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
