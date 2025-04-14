import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './components/Login.tsx';
import Register from './components/Register.tsx';
import Home from './components/Home.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

function App() {
  // Bepaal de basename voor GitHub Pages
  // Bij lokale ontwikkeling is dit leeg, bij GitHub Pages is dit /AutoMaatje
  const basename = process.env.NODE_ENV === 'production' ? '/AutoMaatje' : '';
  
  return (
    <AuthProvider>
      <Router basename={basename}>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 