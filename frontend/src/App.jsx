import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PublicAlertsPage from "./pages/PublicAlertsPage";
import PublicAlertDetailPage from "./pages/PublicAlertDetailPage";
import { getAuthToken } from "./utils/auth";

function ProtectedRoute({ children }) {
  return getAuthToken() ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/:id"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="/public" element={<PublicAlertsPage />} />
      <Route path="/public/:id" element={<PublicAlertDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
