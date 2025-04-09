import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './pages/DashboardLayout';
import HeenreisPage from './pages/HeenreisPage';
import TerugreisPage from './pages/TerugreisPage';
import TripsPage from './pages/TripsPage';
import ManagePage from './pages/ManagePage';
import { RideProvider } from './context/RideContext';
import { ClassAuthProvider } from './context/ClassAuthContext';
import { useClassAuthContext } from './context/ClassAuthContext';
import CreateClassPage from './pages/CreateClassPage';
import { AuthProvider } from './context/AuthContext';

// Wrapper voor beschermde routes
const ProtectedRoute = () => {
  const { currentUser, isPending } = useClassAuthContext();

  // Toon laadstatus als authenticatiestatus nog wordt geladen
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    );
  }

  // Redirect naar login als niet ingelogd
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Render de nested routes (binnen DashboardLayout) als ingelogd
  return <Outlet />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-class" element={<CreateClassPage />} />

        {/* Dashboard routes wrapped in een protected route */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            {/* Default dashboard view */}
            <Route index element={<Navigate to="/trips" replace />} />
            <Route path="trips" element={<TripsPage />} />
            <Route path="heenreis" element={<HeenreisPage />} />
            <Route path="terugreis" element={<TerugreisPage />} />
            <Route path="manage" element={<ManagePage />} />
            {/* TODO: Voeg andere nested routes toe indien nodig */}
          </Route>
        </Route>

        {/* 404 Not Found route */}
        <Route path="*" element={<div>404 - Pagina Niet Gevonden</div>} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ClassAuthProvider>
        <RideProvider>
          <AppRoutes />
        </RideProvider>
      </ClassAuthProvider>
    </AuthProvider>
  );
}

export default App;
