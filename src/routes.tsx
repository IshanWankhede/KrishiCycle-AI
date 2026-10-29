import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { GuidePage } from './pages/GuidePage';
import { DashboardPage } from './pages/DashboardPage';
import { FarmPage } from './pages/FarmPage';
import { CropsPage } from './pages/CropsPage';
import { MakePage } from './pages/MakePage';
import { BatchesPage } from './pages/BatchesPage';
import { MarketPage } from './pages/MarketPage';
import { OrdersPage } from './pages/OrdersPage';
import { HealthPage } from './pages/HealthPage';
import { SchemesPage } from './pages/SchemesPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const { showToast } = useUIStore();

  if (!isAuthenticated) {
    // Notify user why they are being redirected
    showToast('Please sign in or create a farmer account to access this feature.', 'warning');
    const redirectParam = encodeURIComponent(location.pathname);
    return <Navigate to={`/auth?mode=signin&redirect=${redirectParam}`} replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected Routes */}
      <Route
        path="/guide"
        element={
          <ProtectedRoute>
            <GuidePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farm"
        element={
          <ProtectedRoute>
            <FarmPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/crops"
        element={
          <ProtectedRoute>
            <CropsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/make"
        element={
          <ProtectedRoute>
            <MakePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/batches"
        element={
          <ProtectedRoute>
            <BatchesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <MarketPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/health"
        element={
          <ProtectedRoute>
            <HealthPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/schemes"
        element={
          <ProtectedRoute>
            <SchemesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect to Landing Page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
