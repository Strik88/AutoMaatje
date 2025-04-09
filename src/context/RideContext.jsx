import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../firebase/config';
import { 
  addDoc, 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { auth } from '../firebase/config';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { useAuthContext } from './AuthContext';
import { 
  getTrips,
  createTrip,
  getTripById,
  updateTripHeenreis,
  updateTripTerugreis,
  getCars,
  getChildren,
  updateTrip,
  deleteTrip,
  subscribeToTrips,
  subscribeToTripById
} from '../firebase/rideService';
import { onAuthStateChanged } from 'firebase/auth';
import { useClassAuthContext } from './ClassAuthContext';

// Mock functions for local development
// Deze functie moet een unieke ID teruggeven voor nieuwe items
const generateId = () => uuidv4();

// Create context
const RideContext = createContext();

// Hook to use the context
export const useRideContext = () => useContext(RideContext);
// Alias for compatibility
export const useRide = useRideContext;

// Provider component
export function RideProvider({ children }) {
  const { user } = useAuthContext();
  const [currentTrip, setCurrentTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  
  // State voor heen- en terugreis data
  const [heenreisData, setHeenreisData] = useState({
    cars: [],
    children: []
  });
  
  const [terugreisData, setTerugreisData] = useState({
    cars: [],
    children: []
  });
  
  const [mockMode, setMockMode] = useState(false);
  const [originalMockData, setOriginalMockData] = useLocalStorage('automaatje-mock-data', null);
  const [localChildren, setLocalChildren] = useLocalStorage('automaatje-all-children', []);
  
  const { currentClass } = useClassAuthContext();
  
  // Laad trips wanneer de gebruiker is ingelogd
  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);
  
  // Abonneer op realtime trip updates
  useEffect(() => {
    if (!user) return;
    
    // Abonneer op alle trips
    const unsubscribeTrips = subscribeToTrips((updatedTrips) => {
      setTrips(updatedTrips);
      
      // Als de huidige trip tussen de updates zit, update de lokale versie
      if (currentTrip) {
        const updatedCurrentTrip = updatedTrips.find(t => t.id === currentTrip.id);
        if (updatedCurrentTrip && JSON.stringify(updatedCurrentTrip) !== JSON.stringify(currentTrip)) {
          setCurrentTrip(updatedCurrentTrip);
          
          // Update ook de heen- en terugreis data indien nodig
          if (updatedCurrentTrip.heenreis) {
            setHeenreisData(updatedCurrentTrip.heenreis);
          }
          
          if (updatedCurrentTrip.terugreis) {
            setTerugreisData(updatedCurrentTrip.terugreis);
          }
        }
      }
    });
    
    // Cleanup
    return () => {
      unsubscribeTrips();
    };
  }, [user, currentTrip]);
  
  // Abonneer op specifieke trip details als er een huidige trip is
  useEffect(() => {
    if (!user || !currentTrip) return;
    
    const unsubscribeTripDetails = subscribeToTripById(currentTrip.id, (updatedTrip) => {
      if (!updatedTrip) return;
      
      setCurrentTrip(updatedTrip);
      
      // Update ook de heen- en terugreis data indien nodig
      if (updatedTrip.heenreis) {
        setHeenreisData(updatedTrip.heenreis);
      }
      
      if (updatedTrip.terugreis) {
        setTerugreisData(updatedTrip.terugreis);
      }
      
      // Update lijst van actieve gebruikers voor deze trip
      if (updatedTrip.activeUsers) {
        setActiveUsers(updatedTrip.activeUsers);
      }
    });
    
    // Cleanup
    return () => {
      unsubscribeTripDetails();
    };
  }, [user, currentTrip?.id]);
  
  // Initialiseer het systeem
  useEffect(() => {
    const initializeSystem = async () => {
      setLoading(true);
      try {
        // Check of Firebase beschikbaar is via auth
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          // Als we geen auth user hebben, gebruik mock data
          if (!user) {
            console.log("Geen ingelogde gebruiker gevonden, mockMode ingeschakeld");
            setMockMode(true);
          } else {
            console.log("Ingelogde gebruiker gevonden, gebruik Firebase");
            setMockMode(false);
          }
          
          // Laad alle trips
          await loadTrips();
          setLoading(false);
          
          // Cleanup auth listener
          return () => unsubscribe();
        });
      } catch (err) {
        console.error("Fout bij initialisatie:", err);
        setError("Er is een probleem opgetreden bij het laden van de app.");
        setMockMode(true); // Fallback naar mock mode
        setLoading(false);
      }
    };

    initializeSystem();
  }, []);
  
  // Laad trips van Firebase
  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!mockMode && auth.currentUser) {
        // Laad ritten vanuit Firebase
        const userTripsRef = collection(db, 'trips');
        const q = query(userTripsRef, where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const tripsData = [];
        querySnapshot.forEach((doc) => {
          tripsData.push({ id: doc.id, ...doc.data() });
        });
        
        setTrips(tripsData);
      } else {
        // Laad mock trips
        if (originalMockData && originalMockData.trips) {
          setTrips(originalMockData.trips || []);
        }
      }
    } catch (err) {
      console.error("Error loading trips:", err);
      setError(err.message);
      // Als we een error krijgen, val terug op mock data
      if (originalMockData && originalMockData.trips) {
        setTrips(originalMockData.trips || []);
      }
    } finally {
      setLoading(false);
    }
  }, [mockMode, originalMockData]);
  
  // Laad specifieke trip
  const loadTrip = useCallback(async (tripId) => {
    setLoading(true);
    setError(null);
    
    try {
      let tripData;
      
      if (!mockMode && auth.currentUser) {
        // Laad trip vanuit Firebase
        const tripRef = doc(db, 'trips', tripId);
        const tripDoc = await getDoc(tripRef);
        
        if (!tripDoc.exists()) {
          throw new Error('Trip niet gevonden');
        }
        
        tripData = { id: tripDoc.id, ...tripDoc.data() };
      } else {
        // Laad trip vanuit mock data
        const mockTrip = originalMockData.trips.find(t => t.id === tripId);
        
        if (!mockTrip) {
          throw new Error('Trip niet gevonden in mock data');
        }
        
        tripData = { ...mockTrip };
      }
      
      setCurrentTrip(tripData);
      
      // Initialiseer heenreis en terugreis data
      if (tripData.heenreis) {
        setHeenreisData(tripData.heenreis);
      } else {
        setHeenreisData({ cars: [], children: [] });
      }
      
      if (tripData.terugreis) {
        setTerugreisData(tripData.terugreis);
      } else {
        setTerugreisData({ cars: [], children: [] });
      }
      
      setLoading(false);
      
      return tripData;
    } catch (err) {
      console.error("Error loading trip:", err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [mockMode, originalMockData]);
  
  // Maak een nieuwe rit aan
  const createTrip = async (tripData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newTripId = await rideService.createTrip(tripData);
      if (newTripId) {
        // Herlaad trips om de nieuwe trip te tonen
        await loadTrips();
        return newTripId;
      } else {
        throw new Error("Geen trip ID ontvangen bij aanmaken");
      }
    } catch (err) {
      console.error("Fout bij het aanmaken van trip:", err);
      setError("Er is een probleem opgetreden bij het aanmaken van de rit.");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Update een bestaande rit
  const updateTripInfo = async (tripId, updatedData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTrip = await rideService.updateTrip(tripId, updatedData);
      if (updatedTrip) {
        // Als dit de huidige trip is, update state
        if (currentTrip && currentTrip.id === tripId) {
          setCurrentTrip(updatedTrip);
        }
        // Herlaad alle trips
        await loadTrips();
        return updatedTrip;
      } else {
        throw new Error("Geen bijgewerkte trip ontvangen");
      }
    } catch (err) {
      console.error("Fout bij het bijwerken van trip:", err);
      setError("Er is een probleem opgetreden bij het bijwerken van de rit.");
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Verwijder een rit
  const deleteTrip = async (tripId) => {
    setLoading(true);
    setError(null);
    
    try {
      await rideService.deleteTrip(tripId);
      
      // Als dit de huidige trip is, reset state
      if (currentTrip && currentTrip.id === tripId) {
        setCurrentTrip(null);
      }
      
      // Herlaad alle trips
      await loadTrips();
      return true;
    } catch (err) {
      console.error("Fout bij het verwijderen van trip:", err);
      setError("Er is een probleem opgetreden bij het verwijderen van de rit.");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Update heenreis en terugreis data
  const updateHeenreisData = async (updatedData) => {
    if (!currentTrip) {
      setError("Er is geen rit geselecteerd.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedTrip = await rideService.updateTripHeenreis(
        currentTrip.id, 
        updatedData
      );
      
      if (updatedTrip) {
        setCurrentTrip(updatedTrip);
        return true;
      } else {
        throw new Error("Geen bijgewerkte trip ontvangen");
      }
    } catch (err) {
      console.error("Fout bij het bijwerken van heenreis:", err);
      setError("Er is een probleem opgetreden bij het bijwerken van de heenreis.");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const updateTerugreisData = async (updatedData) => {
    if (!currentTrip) {
      setError("Er is geen rit geselecteerd.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedTrip = await rideService.updateTripTerugreis(
        currentTrip.id, 
        updatedData
      );
      
      if (updatedTrip) {
        setCurrentTrip(updatedTrip);
        return true;
      } else {
        throw new Error("Geen bijgewerkte trip ontvangen");
      }
    } catch (err) {
      console.error("Fout bij het bijwerken van terugreis:", err);
      setError("Er is een probleem opgetreden bij het bijwerken van de terugreis.");
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Functie om alle uitstapjes op te halen
  const refreshTrips = useCallback(async () => {
    // VOEG TOE: Wacht tot currentClass en currentClass.id beschikbaar zijn
    if (!currentClass?.id) {
      console.log("Wachten op currentClass.id voor refreshTrips");
      setTrips([]); // Reset trips als er geen klas is
      return () => {}; // Geef een lege opruimfunctie terug
    }
    
    let unsubscribe = () => {}; // Initialiseer unsubscribe als lege functie

    try {
      setError(null);
      
      // Query voor het ophalen van uitstapjes die bij de huidige klas horen
      const tripsRef = collection(db, 'trips');
      const q = query(tripsRef, where('classId', '==', currentClass.id));
      
      // Luisteren naar real-time updates
      // WIJZIG: Ken de return value van onSnapshot toe aan unsubscribe
      unsubscribe = onSnapshot(q, (snapshot) => {
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sorteer op datum (nieuwste eerst)
        tripsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTrips(tripsData);
        setLoading(false);
      }, (err) => {
        console.error('Fout bij ophalen uitstapjes:', err);
        setError('Kon uitstapjes niet laden');
        setLoading(false);
      });
      
      // WIJZIG: Geef de unsubscribe functie terug
      return unsubscribe;
    } catch (err) {
      console.error('Fout bij ophalen uitstapjes:', err);
      setError('Kon uitstapjes niet laden');
      setLoading(false);
      // WIJZIG: Geef ook hier een lege opruimfunctie terug bij een fout
      return () => {}; 
    }
  }, [currentClass]);

  // Laad uitstapjes wanneer de klas verandert
  useEffect(() => {
    let unsubscribeTripsListener = () => {}; // Initialiseer met lege functie
    
    if (currentClass) {
      // WIJZIG: Roep refreshTrips aan en sla de listener op
      const setupListener = async () => {
        unsubscribeTripsListener = await refreshTrips();
      };
      setupListener();
    } else {
      setTrips([]);
      setCurrentTrip(null);
    }
    
    // WIJZIG: Gebruik de opgeslagen listener in de cleanup
    return () => {
      if (unsubscribeTripsListener) {
        unsubscribeTripsListener();
      }
    };
  }, [currentClass, refreshTrips]);

  // Functie om gegevens voor de heenreis op te halen
  const loadHeenreisData = useCallback(async () => {
    if (!currentTrip) return;
    
    try {
      // Laad heenreis gegevens uit Firestore
      const heenreisRef = collection(db, 'trips', currentTrip.id, 'heenreis');
      
      // Auto's ophalen
      const carsQuery = query(collection(heenreisRef, 'cars'));
      const carsSnapshot = await getDocs(carsQuery);
      const carsData = carsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Kinderen ophalen
      const childrenQuery = query(collection(heenreisRef, 'children'));
      const childrenSnapshot = await getDocs(childrenQuery);
      const childrenData = childrenSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHeenreisData({
        cars: carsData,
        children: childrenData
      });
      
    } catch (err) {
      console.error('Fout bij laden heenreis data:', err);
      setError('Kon heenreis gegevens niet laden');
    }
  }, [currentTrip]);

  // Functie om gegevens voor de terugreis op te halen
  const loadTerugreisData = useCallback(async () => {
    if (!currentTrip) return;
    
    try {
      // Laad terugreis gegevens uit Firestore
      const terugreisRef = collection(db, 'trips', currentTrip.id, 'terugreis');
      
      // Auto's ophalen
      const carsQuery = query(collection(terugreisRef, 'cars'));
      const carsSnapshot = await getDocs(carsQuery);
      const carsData = carsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Kinderen ophalen
      const childrenQuery = query(collection(terugreisRef, 'children'));
      const childrenSnapshot = await getDocs(childrenQuery);
      const childrenData = childrenSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setTerugreisData({
        cars: carsData,
        children: childrenData
      });
      
    } catch (err) {
      console.error('Fout bij laden terugreis data:', err);
      setError('Kon terugreis gegevens niet laden');
    }
  }, [currentTrip]);

  // Effect voor het laden van heenreis en terugreis gegevens wanneer een uitstapje wordt geselecteerd
  useEffect(() => {
    if (currentTrip) {
      loadHeenreisData();
      loadTerugreisData();
    } else {
      // Reset gegevens wanneer er geen uitstapje is geselecteerd
      setHeenreisData({ cars: [], children: [] });
      setTerugreisData({ cars: [], children: [] });
    }
  }, [currentTrip, loadHeenreisData, loadTerugreisData]);

  // Functie om heenreis gegevens op te slaan
  const saveHeenreisData = async (data) => {
    if (!currentTrip) return;
    
    try {
      const heenreisRef = collection(db, 'trips', currentTrip.id, 'heenreis');
      
      // Update auto's
      // Verwijder bestaande auto's
      const carsQuery = query(collection(heenreisRef, 'cars'));
      const carsSnapshot = await getDocs(carsQuery);
      
      const deletePromises = carsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      
      // Voeg nieuwe auto's toe
      const addCarsPromises = data.cars.map(car => 
        addDoc(collection(heenreisRef, 'cars'), car)
      );
      await Promise.all(addCarsPromises);
      
      // Update kinderen
      // Verwijder bestaande kinderen
      const childrenQuery = query(collection(heenreisRef, 'children'));
      const childrenSnapshot = await getDocs(childrenQuery);
      
      const deleteChildrenPromises = childrenSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deleteChildrenPromises);
      
      // Voeg nieuwe kinderen toe
      const addChildrenPromises = data.children.map(child => 
        addDoc(collection(heenreisRef, 'children'), child)
      );
      await Promise.all(addChildrenPromises);
      
      // Update lokale state
      setHeenreisData(data);
      
    } catch (err) {
      console.error('Fout bij opslaan heenreis data:', err);
      setError('Kon heenreis gegevens niet opslaan');
    }
  };

  // Functie om terugreis gegevens op te slaan
  const saveTerugreisData = async (data) => {
    if (!currentTrip) return;
    
    try {
      const terugreisRef = collection(db, 'trips', currentTrip.id, 'terugreis');
      
      // Update auto's
      // Verwijder bestaande auto's
      const carsQuery = query(collection(terugreisRef, 'cars'));
      const carsSnapshot = await getDocs(carsQuery);
      
      const deletePromises = carsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
      
      // Voeg nieuwe auto's toe
      const addCarsPromises = data.cars.map(car => 
        addDoc(collection(terugreisRef, 'cars'), car)
      );
      await Promise.all(addCarsPromises);
      
      // Update kinderen
      // Verwijder bestaande kinderen
      const childrenQuery = query(collection(terugreisRef, 'children'));
      const childrenSnapshot = await getDocs(childrenQuery);
      
      const deleteChildrenPromises = childrenSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      await Promise.all(deleteChildrenPromises);
      
      // Voeg nieuwe kinderen toe
      const addChildrenPromises = data.children.map(child => 
        addDoc(collection(terugreisRef, 'children'), child)
      );
      await Promise.all(addChildrenPromises);
      
      // Update lokale state
      setTerugreisData(data);
      
    } catch (err) {
      console.error('Fout bij opslaan terugreis data:', err);
      setError('Kon terugreis gegevens niet opslaan');
    }
  };

  // Functie om alle opgeslagen kinderen te laden
  const loadAllSavedChildren = useCallback(async () => {
    if (!currentClass) return [];
    
    try {
      // Haal kinderen op van alle trips in deze klas
      const allChildren = [];
      const processedNames = new Set(); // Bijhouden van namen die al zijn toegevoegd
      
      // Loop door alle trips
      for (const trip of trips) {
        // Heenreis kinderen ophalen
        const heenreisRef = collection(db, 'trips', trip.id, 'heenreis');
        const childrenQuery = query(collection(heenreisRef, 'children'));
        const childrenSnapshot = await getDocs(childrenQuery);
        
        childrenSnapshot.docs.forEach(doc => {
          const child = doc.data();
          if (child.name && !processedNames.has(child.name)) {
            allChildren.push(child);
            processedNames.add(child.name);
          }
        });
        
        // Terugreis kinderen ophalen
        const terugreisRef = collection(db, 'trips', trip.id, 'terugreis');
        const terugreisChildrenQuery = query(collection(terugreisRef, 'children'));
        const terugreisChildrenSnapshot = await getDocs(terugreisChildrenQuery);
        
        terugreisChildrenSnapshot.docs.forEach(doc => {
          const child = doc.data();
          if (child.name && !processedNames.has(child.name)) {
            allChildren.push(child);
            processedNames.add(child.name);
          }
        });
      }
      
      return allChildren;
    } catch (err) {
      console.error('Fout bij ophalen opgeslagen kinderen:', err);
      return [];
    }
  }, [currentClass, trips]);

  // Functie om alle kinderen van het huidige uitstapje op te halen
  const getAllChildrenFromCurrentTrip = () => {
    const allCurrentTripChildren = [];
    const processedNames = new Set(); // Bijhouden van namen die al zijn toegevoegd
    
    // Voeg kinderen van heenreis toe
    heenreisData.children.forEach(child => {
      if (child.name && !processedNames.has(child.name)) {
        allCurrentTripChildren.push(child);
        processedNames.add(child.name);
      }
    });
    
    // Voeg kinderen van terugreis toe die nog niet zijn toegevoegd
    terugreisData.children.forEach(child => {
      if (child.name && !processedNames.has(child.name)) {
        allCurrentTripChildren.push(child);
        processedNames.add(child.name);
      }
    });
    
    return allCurrentTripChildren;
  };

  // Functie om opgeslagen kinderen toe te voegen aan het huidige uitstapje
  const addSavedChildrenToCurrentTrip = async (savedChildren) => {
    if (!currentTrip) return;
    
    // Voeg kinderen toe aan heenreis
    const currentHeenreisChildren = [...heenreisData.children];
    const currentHeenreisNames = new Set(currentHeenreisChildren.map(c => c.name));
    
    // Filter kinderen die nog niet in de heenreis zitten
    const newHeenreisChildren = savedChildren.filter(child => 
      !currentHeenreisNames.has(child.name)
    ).map(child => ({
      ...child,
      id: child.id || Math.random().toString(36).substr(2, 9),
      carId: null
    }));
    
    // Update heenreis data
    const updatedHeenreisData = {
      ...heenreisData,
      children: [...currentHeenreisChildren, ...newHeenreisChildren]
    };
    await saveHeenreisData(updatedHeenreisData);
    
    // Voeg kinderen toe aan terugreis
    const currentTerugreisChildren = [...terugreisData.children];
    const currentTerugreisNames = new Set(currentTerugreisChildren.map(c => c.name));
    
    // Filter kinderen die nog niet in de terugreis zitten
    const newTerugreisChildren = savedChildren.filter(child => 
      !currentTerugreisNames.has(child.name)
    ).map(child => ({
      ...child,
      id: child.id || Math.random().toString(36).substr(2, 9),
      carId: null
    }));
    
    // Update terugreis data
    const updatedTerugreisData = {
      ...terugreisData,
      children: [...currentTerugreisChildren, ...newTerugreisChildren]
    };
    await saveTerugreisData(updatedTerugreisData);
  };

  // Contextwaarde die beschikbaar wordt gesteld
  const contextValue = {
    trips,
    refreshTrips,
    currentTrip,
    setCurrentTrip,
    loading,
    error,
    heenreisData,
    terugreisData,
    saveHeenreisData,
    saveTerugreisData,
    loadAllSavedChildren,
    getAllChildrenFromCurrentTrip,
    addSavedChildrenToCurrentTrip
  };

  return (
    <RideContext.Provider value={contextValue}>
      {children}
    </RideContext.Provider>
  );
}

export default RideContext; 