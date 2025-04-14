import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth, getUserProfile } from '../firebase.ts';
import { onAuthStateChanged, User } from 'firebase/auth';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  currentUser: null, 
  userProfile: null, 
  loading: true,
  refreshUserProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    if (currentUser) {
      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile as UserProfile);
      } catch (error) {
        console.error("Fout bij ophalen gebruikersprofiel:", error);
      }
    }
  };

  useEffect(() => {
    const fetchUserProfileData = async (user: User) => {
      try {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile as UserProfile);
      } catch (error) {
        console.error("Fout bij ophalen gebruikersprofiel:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        fetchUserProfileData(user);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 