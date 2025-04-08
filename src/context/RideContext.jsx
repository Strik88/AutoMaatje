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
  setDoc
} from 'firebase/firestore';
import { auth } from '../firebase/config';
import useLocalStorage from '../hooks/useLocalStorage';
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
export const RideProvider = ({ children }) => {
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
  
  // Haal alle opgeslagen kinderen op
  const loadAllSavedChildren = async () => {
    try {
      return await rideService.loadAllSavedChildren();
    } catch (err) {
      console.error("Fout bij het laden van opgeslagen kinderen:", err);
      setError("Er is een probleem opgetreden bij het ophalen van opgeslagen kinderen.");
      return [];
    }
  };
  
  // Haal alle kinderen op uit de huidige rit
  const getAllChildrenFromCurrentTrip = () => {
    if (!currentTrip) return [];
    return rideService.getAllChildrenFromCurrentTrip(currentTrip);
  };
  
  // Voeg opgeslagen kinderen toe aan de huidige trip
  const addSavedChildrenToCurrentTrip = async (newChildren, direction = 'heenreis') => {
    if (!currentTrip) {
      setError("Er is geen rit geselecteerd.");
      return false;
    }
    
    try {
      // Huidige data ophalen
      const currentData = direction === 'heenreis' 
        ? {...currentTrip.heenreis} 
        : {...currentTrip.terugreis};
      
      // Controleer of children array bestaat
      if (!currentData.children) {
        currentData.children = [];
      }
      
      // Check voor duplicaten en voeg toe
      const existingIds = new Set(currentData.children.map(child => child.id.toString()));
      const childrenToAdd = newChildren.filter(child => !existingIds.has(child.id.toString()));
      
      // Voeg toe aan bestaande kinderen
      currentData.children = [...currentData.children, ...childrenToAdd];
      
      // Update de juiste data
      if (direction === 'heenreis') {
        return await updateHeenreisData(currentData);
      } else {
        return await updateTerugreisData(currentData);
      }
    } catch (err) {
      console.error(`Fout bij het toevoegen van kinderen aan ${direction}:`, err);
      setError(`Er is een probleem opgetreden bij het toevoegen van kinderen aan de ${direction}.`);
      return false;
    }
  };
  
  // Context value
  const value = {
    currentTrip,
    trips,
    loading,
    error,
    heenreisData,
    terugreisData,
    activeUsers,
    loadTrips,
    loadTrip,
    createTrip,
    updateTripInfo,
    deleteTrip,
    updateHeenreisData,
    updateTerugreisData,
    loadAllSavedChildren,
    getAllChildrenFromCurrentTrip,
    addSavedChildrenToCurrentTrip
  };
  
  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

export default RideContext; 