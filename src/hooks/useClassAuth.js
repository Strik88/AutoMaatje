import { useEffect, useState, useCallback } from 'react';
import { db, getServerTimestamp } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  addDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  orderBy
} from 'firebase/firestore';
import useLocalStorage from './useLocalStorage';

const useClassAuth = () => {
  // Gebruiker informatie
  const [currentUser, setCurrentUser] = useState(null);
  const [userToken, setUserToken] = useLocalStorage('automaatje_user_token', null);
  const [currentClass, setCurrentClass] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Laad- en foutstatussen
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  // Controleer of de gebruiker al is ingelogd via lokale opslag
  useEffect(() => {
    const checkTokenValidity = async () => {
      if (!userToken) {
        setIsPending(false);
        return;
      }

      try {
        // Probeer de klasgegevens op te halen 
        const classDoc = await getDoc(doc(db, 'classes', userToken.classId));
        
        if (!classDoc.exists()) {
          // Klas bestaat niet meer
          console.log('Klas bestaat niet meer');
          setUserToken(null);
          setCurrentUser(null);
          setCurrentClass(null);
          setIsPending(false);
          return;
        }

        const classData = classDoc.data();
        
        // Controleer of gebruiker nog in de klas zit
        const userExists = classData.users && classData.users.some(user => 
          user.id === userToken.userId && user.name === userToken.name
        );

        if (!userExists) {
          console.log('Gebruiker zit niet meer in deze klas');
          setUserToken(null);
          setCurrentUser(null);
          setCurrentClass(null);
          setIsPending(false);
          return;
        }

        // Gebruiker is geldig, stel huidige gebruiker in
        setCurrentUser({
          id: userToken.userId,
          name: userToken.name,
          classId: userToken.classId,
          className: classData.name,
          isAdmin: userToken.isAdmin || false,
          joinedAt: userToken.joinedAt
        });
        
        setCurrentClass(classData);
        
        // Update online status
        updateOnlineStatus(userToken.userId, userToken.classId, userToken.name);
      } catch (err) {
        console.error("Error checking token validity:", err);
        setUserToken(null);
        setCurrentUser(null);
        setCurrentClass(null);
      }
      
      setIsPending(false);
    };

    checkTokenValidity();
  }, [userToken, setUserToken]);

  // Luister naar online gebruikers in huidige klas
  useEffect(() => {
    if (!currentUser || !currentUser.classId) return;

    const q = query(
      collection(db, 'userStatus'),
      where('classId', '==', currentUser.classId),
      where('online', '==', true),
      orderBy('lastActive', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach(doc => {
        users.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setOnlineUsers(users);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Update online status van gebruiker
  const updateOnlineStatus = async (userId, classId, name) => {
    try {
      const statusRef = doc(db, 'userStatus', userId);
      await setDoc(statusRef, {
        id: userId,
        name: name,
        classId: classId,
        online: true,
        lastActive: getServerTimestamp()
      }, { merge: true });

      // Stel interval in om regelmatig status te updaten
      const intervalId = setInterval(async () => {
        if (userId) {
          await updateDoc(statusRef, {
            lastActive: getServerTimestamp()
          });
        }
      }, 60000); // Elke minuut updaten

      // Cleanup interval bij unmount
      return () => clearInterval(intervalId);
    } catch (err) {
      console.error("Error updating online status:", err);
    }
  };

  // Functie om in te loggen met klas naam en code
  const login = async (className, classCode, userName) => {
    setError(null);
    setIsPending(true);

    try {
      // Zoek de klas met deze naam en code
      const classesRef = collection(db, 'classes');
      const q = query(
        classesRef, 
        where('name', '==', className),
        where('accessCode', '==', classCode)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Ongeldige klasnaam of toegangscode');
      }

      // Gebruik de eerste klas die we vinden
      const classDoc = querySnapshot.docs[0];
      const classData = classDoc.data();
      const classId = classDoc.id;
      
      // Controleer of gebruiker al bestaat in deze klas
      let userId = null;
      if (classData.users) {
        const existingUser = classData.users.find(user => user.name === userName);
        if (existingUser) {
          userId = existingUser.id;
        }
      }
      
      // Als de gebruiker nog niet bestaat, voeg deze toe
      if (!userId) {
        userId = Math.random().toString(36).substring(2, 10); // Genereer eenvoudige ID
        
        // Update klas met nieuwe gebruiker
        await updateDoc(doc(db, 'classes', classId), {
          users: arrayUnion({
            id: userId,
            name: userName,
            joinedAt: getServerTimestamp()
          })
        });
      }
      
      // Sla token op in lokale opslag
      const user = {
        userId: userId,
        name: userName,
        classId: classId,
        className: classData.name,
        isAdmin: false, // Standaard geen admin
        joinedAt: getServerTimestamp()
      };
      
      setUserToken(user);
      setCurrentUser(user);
      setCurrentClass(classData);
      
      // Update online status
      updateOnlineStatus(userId, classId, userName);
      
      setIsPending(false);
      return user;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || 'Inloggen mislukt');
      setIsPending(false);
    }
  };

  // Functie om een nieuwe klas aan te maken
  const createClass = async (className, adminName, accessCode) => {
    setError(null);
    setIsPending(true);

    try {
      // Check of klas met dezelfde naam al bestaat
      const classesRef = collection(db, 'classes');
      const q = query(classesRef, where('name', '==', className));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('Er bestaat al een klas met deze naam');
      }
      
      // Maak admin gebruiker ID
      const adminId = Math.random().toString(36).substring(2, 10);
      
      // Maak nieuwe klas aan
      const classRef = await addDoc(classesRef, {
        name: className,
        accessCode: accessCode,
        createdAt: getServerTimestamp(),
        createdBy: adminName,
        users: [{
          id: adminId,
          name: adminName,
          joinedAt: getServerTimestamp(),
          isAdmin: true
        }]
      });
      
      // Sla token op in lokale opslag
      const user = {
        userId: adminId,
        name: adminName,
        classId: classRef.id,
        className: className,
        isAdmin: true,
        joinedAt: getServerTimestamp()
      };
      
      setUserToken(user);
      setCurrentUser(user);
      setCurrentClass({
        name: className,
        accessCode: accessCode,
        createdAt: getServerTimestamp(),
        createdBy: adminName,
        users: [{
          id: adminId,
          name: adminName,
          joinedAt: getServerTimestamp(),
          isAdmin: true
        }]
      });
      
      // Update online status
      updateOnlineStatus(adminId, classRef.id, adminName);
      
      setIsPending(false);
      return user;
    } catch (err) {
      console.error("Create class error:", err);
      setError(err.message || 'Klas aanmaken mislukt');
      setIsPending(false);
      throw err;
    }
  };

  // Functie om uit te loggen
  const logout = useCallback(async () => {
    if (currentUser) {
      try {
        // Update online status naar offline
        const statusRef = doc(db, 'userStatus', currentUser.id);
        await updateDoc(statusRef, {
          online: false,
          lastSeen: getServerTimestamp()
        });
      } catch (err) {
        console.error("Error updating offline status:", err);
      }
    }
    
    // Verwijder gebruikersgegevens
    setUserToken(null);
    setCurrentUser(null);
    setCurrentClass(null);
  }, [currentUser, setUserToken]);

  // Controleer voor beforeunload om online status bij te werken
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        const statusRef = doc(db, 'userStatus', currentUser.id);
        updateDoc(statusRef, {
          online: false,
          lastSeen: getServerTimestamp()
        }).catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [currentUser]);

  return { 
    currentUser,
    currentClass, 
    onlineUsers,
    isPending, 
    error, 
    login,
    createClass,
    logout 
  };
};

export default useClassAuth; 