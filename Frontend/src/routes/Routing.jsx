import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthPage } from "../pages/AuthPage";
import Dashboard from "../pages/Dashboard";

/**
 * 🛡️ Protected Route Interceptor
 * Re-routes unauthorized requests to the public login screen.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Validating secure session parameters...
      </div>
    );
  }

  return user ? children : <Navigate to="/" replace />;
};

/**
 * 🔓 Public Route Interceptor
 * Intercepts requests from authenticated users to keep them from returning to the login page.
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return !user ? children : <Navigate to="/dashboard" replace />;
};

export const Routing = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
