import { Navigate, Route, Routes } from "react-router-dom";
import PublicAlertsPage from "./pages/PublicAlertsPage";
import PublicAlertDetailPage from "./pages/PublicAlertDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicAlertsPage />} />
      <Route path="/public" element={<PublicAlertsPage />} />
      <Route path="/public/:id" element={<PublicAlertDetailPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
