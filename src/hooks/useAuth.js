import { useState, useEffect } from 'react';
// Comment deze regels tijdelijk uit om Firebase errors te voorkomen
// import { 
//   signInWithEmailAndPassword, 
//   createUserWithEmailAndPassword,
//   signOut,
//   onAuthStateChanged
// } from 'firebase/auth';
// import { auth } from '../firebase/config';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Tijdelijke mock authenticatie functie
  useEffect(() => {
    // Check localStorage voor bestaande sessie
    const storedUser = localStorage.getItem('automaatje_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  // Login functie
  const login = async (email, password) => {
    setError(null);
    try {
      setLoading(true);
      
      // Tijdelijke mock authenticatie - alleen het testaccount accepteren
      if (email === 'test@example.com' && password === 'test123') {
        const mockUser = {
          uid: '123456',
          email: email,
          displayName: 'Test Gebruiker'
        };
        
        // Bewaar user in localStorage voor persistentie
        localStorage.setItem('automaatje_user', JSON.stringify(mockUser));
        setUser(mockUser);
        setLoading(false);
        return mockUser;
      } else {
        throw new Error('Ongeldige inloggegevens');
      }
      
      // Originele Firebase code (uitgeschakeld)
      // const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // setUser(userCredential.user);
      // setLoading(false);
      // return userCredential.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };
  
  // Registreer functie
  const register = async (email, password) => {
    setError(null);
    try {
      setLoading(true);
      
      // Tijdelijke mock registratie - iedereen kan registreren
      const mockUser = {
        uid: 'reg_' + Date.now(),
        email: email,
        displayName: email.split('@')[0]
      };
      
      // Bewaar user in localStorage voor persistentie
      localStorage.setItem('automaatje_user', JSON.stringify(mockUser));
      setUser(mockUser);
      setLoading(false);
      return mockUser;
      
      // Originele Firebase code (uitgeschakeld)
      // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // setUser(userCredential.user);
      // setLoading(false);
      // return userCredential.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };
  
  // Logout functie
  const logout = async () => {
    setError(null);
    try {
      // Verwijder user uit localStorage
      localStorage.removeItem('automaatje_user');
      setUser(null);
      return true;
      
      // Originele Firebase code (uitgeschakeld)
      // await signOut(auth);
      // setUser(null);
      // return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
} 