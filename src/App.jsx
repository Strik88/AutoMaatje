import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './pages/DashboardLayout';
import HeenreisPage from './pages/HeenreisPage';
import TerugreisPage from './pages/TerugreisPage';
// TODO: Import authentication context or hook

// Placeholder for protected route logic
const ProtectedRoute = () => {
  // TODO: Replace with actual authentication check
  const isAuthenticated = true; // Assume user is logged in for now

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render the nested routes (within DashboardLayout) if authenticated
  return <Outlet />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard routes wrapped in a protected route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            {/* Default dashboard view could be heenreis or a welcome page */}
            <Route index element={<Navigate to="heenreis" replace />} />
            <Route path="heenreis" element={<HeenreisPage />} />
            <Route path="terugreis" element={<TerugreisPage />} />
            {/* TODO: Add other nested routes like Settings if needed */}
          </Route>
        </Route>

        {/* Optional: Add a 404 Not Found route */}
        <Route path="*" element={<div>404 - Pagina Niet Gevonden</div>} />
      </Routes>
    </Router>
  );
}

export default App;
