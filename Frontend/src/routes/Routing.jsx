import { Navigate, Routes, Route } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthPage } from "../pages/AuthPage";
import DashboardLayout from "../layouts/DashboardLayout";
import { Workspace } from "../components/Workspace";
import { PastAnalysis } from "../components/PastAnalysis";
import { ProfileSettings } from "../components/ProfileSettings";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070a13] text-slate-500 font-medium">
        Validating secure session parameters...
      </div>
    );
  }
  return user ? children : <Navigate to="/" replace />;
};

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
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Workspace />} />
        <Route path="past-analysis" element={<PastAnalysis />} />
        <Route path="settings" element={<ProfileSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};