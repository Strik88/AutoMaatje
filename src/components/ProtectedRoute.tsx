import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../firebase.ts';
import { onAuthStateChanged } from 'firebase/auth';

const ProtectedRoute: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    // Cleanup de auth listener bij unmount
    return () => unsubscribe();
  }, []);

  // Laat 'Loading' zien terwijl de authenticatiestatus wordt gecontroleerd
  if (isAuthenticated === null) {
    return <div>Bezig met inloggen controleren...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute; 