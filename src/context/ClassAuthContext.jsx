import React, { createContext, useContext } from 'react';
import useClassAuth from '../hooks/useClassAuth';

// Context aanmaken
const ClassAuthContext = createContext();

// Hook voor toegang tot de class auth context
export const useClassAuthContext = () => useContext(ClassAuthContext);

// Provider component
export const ClassAuthProvider = ({ children }) => {
  const classAuth = useClassAuth();
  
  return (
    <ClassAuthContext.Provider value={classAuth}>
      {children}
    </ClassAuthContext.Provider>
  );
};

export default ClassAuthContext; 