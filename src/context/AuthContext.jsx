import React, { createContext, useContext } from 'react';
import useAuth from '../hooks/useAuth';

// Context aanmaken
const AuthContext = createContext();

// Hook voor toegang tot de auth context
export const useAuthContext = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 