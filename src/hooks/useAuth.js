import { useEffect, useState, useCallback } from 'react';
import { auth, db, getServerTimestamp } from '../firebase/config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userLoginTimestamp, setUserLoginTimestamp] = useState(null);

  // Luister naar auth veranderingen en gebruikers-presence
  useEffect(() => {
    const userStatusRef = collection(db, 'userStatus');
    
    // Luister naar alle actieve gebruikers
    const onlineUsersUnsubscribe = onSnapshot(
      query(userStatusRef, where('online', '==', true), orderBy('lastLogin', 'desc')),
      (snapshot) => {
        const users = [];
        snapshot.forEach(doc => {
          users.push({
            uid: doc.id,
            ...doc.data()
          });
        });
        setOnlineUsers(users);
      },
      (error) => {
        console.error("Error fetching online users:", error);
      }
    );

    // Luister naar auth veranderingen
    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user has a profile document
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          // Als de gebruiker nog geen profiel heeft, maak er een aan
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              email: user.email,
              displayName: user.displayName || user.email.split('@')[0],
              createdAt: getServerTimestamp()
            });
          }
          
          // Zet of update de presence status
          const timestamp = getServerTimestamp();
          setUserLoginTimestamp(timestamp);
          
          const userStatusDocRef = doc(db, 'userStatus', user.uid);
          await setDoc(userStatusDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || userDoc.exists() ? userDoc.data().displayName : user.email.split('@')[0],
            online: true,
            lastLogin: timestamp
          });
          
          // Haal de volledige gebruikersinfo op
          const userData = userDoc.exists() ? userDoc.data() : { email: user.email };
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            ...userData
          });
        } catch (err) {
          console.error("Error setting up user:", err);
          setError("Er ging iets mis bij het inloggen.");
        }
      } else {
        setCurrentUser(null);
      }
      setIsPending(false);
    });

    // Cleanup functie om presence te updaten bij afsluiten
    return () => {
      if (auth.currentUser && userLoginTimestamp) {
        const userStatusDocRef = doc(db, 'userStatus', auth.currentUser.uid);
        updateDoc(userStatusDocRef, {
          online: false,
          lastSeen: getServerTimestamp()
        }).catch(console.error);
      }
      onlineUsersUnsubscribe();
      authUnsubscribe();
    };
  }, [userLoginTimestamp]);

  // Set up cleanup for page/tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (auth.currentUser) {
        const userStatusDocRef = doc(db, 'userStatus', auth.currentUser.uid);
        const promise = updateDoc(userStatusDocRef, {
          online: false,
          lastSeen: getServerTimestamp()
        });
        
        // This is a synchronous operation that should complete before the page unloads
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/update-status', false); // synchronous request
        xhr.send(JSON.stringify({ uid: auth.currentUser.uid, online: false }));
        
        return promise;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const login = async (email, password) => {
    setError(null);
    setIsPending(true);
    
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      
      // Update user status immediately after login
      const userStatusDocRef = doc(db, 'userStatus', res.user.uid);
      const timestamp = getServerTimestamp();
      await setDoc(userStatusDocRef, {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || res.user.email.split('@')[0],
        online: true,
        lastLogin: timestamp
      });
      
      setUserLoginTimestamp(timestamp);
      setIsPending(false);
      return res.user;
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setIsPending(false);
      throw err;
    }
  };

  const register = async (email, password, displayName) => {
    setError(null);
    setIsPending(true);
    
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create a user document
      const userDocRef = doc(db, 'users', res.user.uid);
      await setDoc(userDocRef, {
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: getServerTimestamp()
      });
      
      // Set online status
      const userStatusDocRef = doc(db, 'userStatus', res.user.uid);
      const timestamp = getServerTimestamp();
      await setDoc(userStatusDocRef, {
        uid: res.user.uid,
        email: res.user.email,
        displayName: displayName || email.split('@')[0],
        online: true,
        lastLogin: timestamp
      });
      
      setUserLoginTimestamp(timestamp);
      setIsPending(false);
      return res.user;
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      setIsPending(false);
      throw err;
    }
  };

  const logout = useCallback(async () => {
    setError(null);
    
    try {
      // Update online status before logging out
      if (auth.currentUser) {
        const userStatusDocRef = doc(db, 'userStatus', auth.currentUser.uid);
        await updateDoc(userStatusDocRef, {
          online: false,
          lastSeen: getServerTimestamp()
        });
      }
      
      await signOut(auth);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
      throw err;
    }
  }, []);

  return { 
    currentUser, 
    onlineUsers,
    isPending, 
    error, 
    login, 
    register, 
    logout 
  };
};

export default useAuth; 