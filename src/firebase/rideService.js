// Firebase implementatie voor rideService

import { db } from './config.js';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';

// Een verzameling van alle kinderen die ooit aangemaakt zijn
let allChildrenGlobal = [];

// Firebase collectie referenties
const TRIPS_COLLECTION = 'trips';
const USERS_COLLECTION = 'users';
const CHILDREN_COLLECTION = 'children';

// Lokale opslagfuncties voor mock-implementatie
const getLocalStorage = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error("Fout bij het ophalen uit localStorage:", e);
    return defaultValue;
  }
};

const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Fout bij het opslaan in localStorage:", e);
  }
};

// Mock data voor ontwikkeling zonder Firebase
const mockData = {
  trips: getLocalStorage('automaatje_trips', [
    {
      id: "mock-trip-1",
      name: "Schoolreisje Efteling",
      date: new Date().toISOString(),
      destination: "De Efteling",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      heenreis: {
        cars: [
          { id: "1", driver: "Ouder 1", capacity: 3, assigned: [] },
          { id: "2", driver: "Ouder 2", capacity: 4, assigned: [] }
        ],
        children: [
          { id: "1", name: "Kind 1" },
          { id: "2", name: "Kind 2" },
          { id: "3", name: "Kind 3" }
        ]
      },
      terugreis: {
        cars: [
          { id: "1", driver: "Ouder 1", capacity: 3, assigned: [] },
          { id: "2", driver: "Ouder 2", capacity: 4, assigned: [] }
        ],
        children: [
          { id: "1", name: "Kind 1" },
          { id: "2", name: "Kind 2" },
          { id: "3", name: "Kind 3" }
        ]
      }
    }
  ]),
  children: getLocalStorage('automaatje_all_children', [
    { id: "1", name: "Kind 1" },
    { id: "2", name: "Kind 2" },
    { id: "3", name: "Kind 3" },
    { id: "4", name: "Kind 4" },
    { id: "5", name: "Kind 5" }
  ])
};

// Initialiseren van de verzameling van alle kinderen
const initAllChildren = async () => {
  try {
    // Controleer of we de mock-implementatie gebruiken
    if (db.name === 'mock-firebase-app') {
      allChildrenGlobal = mockData.children;
      return;
    }
    
    // Haal alle kinderen op uit de Firestore "children" collectie 
    const snapshot = await getDocs(collection(db, CHILDREN_COLLECTION));
    allChildrenGlobal = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    if (allChildrenGlobal.length === 0) {
      // Stel standaard kinderen in als er nog geen zijn
      const defaultChildren = [
        { id: "1", name: "Kind 1" },
        { id: "2", name: "Kind 2" },
        { id: "3", name: "Kind 3" },
        { id: "4", name: "Kind 4" },
        { id: "5", name: "Kind 5" }
      ];
      
      // Sla deze op in Firebase
      for (const child of defaultChildren) {
        await setDoc(doc(db, CHILDREN_COLLECTION, child.id), child);
      }
      
      allChildrenGlobal = defaultChildren;
    }
  } catch (error) {
    console.error("Error initializing global children:", error);
    // Fallback naar lokale opslag
    const storedAllChildren = localStorage.getItem('automaatje_all_children');
    if (storedAllChildren) {
      try {
        allChildrenGlobal = JSON.parse(storedAllChildren);
      } catch (e) {
        allChildrenGlobal = [];
      }
    }
  }
};

// Roep initialisatie aan bij starten van de service
initAllChildren();

// Functie om een kind toe te voegen aan allChildrenGlobal
const addChildToGlobal = async (child) => {
  if (!child || !child.id) return;
  
  try {
    // Controleer of het kind al in de globale lijst staat
    if (!allChildrenGlobal.some(c => c.id === child.id)) {
      // Voeg toe aan globale array
      allChildrenGlobal.push(child);
      
      // Mock-implementatie check
      if (db.name === 'mock-firebase-app') {
        mockData.children.push(child);
        setLocalStorage('automaatje_all_children', mockData.children);
        return;
      }
      
      // Voeg toe aan Firebase
      await setDoc(doc(db, CHILDREN_COLLECTION, child.id.toString()), {
        ...child,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Backup in localStorage
      localStorage.setItem('automaatje_all_children', JSON.stringify(allChildrenGlobal));
    }
  } catch (error) {
    console.error("Error adding child to global collection:", error);
    // Fallback naar alleen localStorage
    if (!allChildrenGlobal.some(c => c.id === child.id)) {
      allChildrenGlobal.push(child);
      localStorage.setItem('automaatje_all_children', JSON.stringify(allChildrenGlobal));
    }
  }
};

// Trip functies
export const createTrip = async (tripData) => {
  try {
    // Voeg timestamp toe
    const tripWithTimestamp = {
      ...tripData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Voeg kinderen toe aan de globale lijst
    if (tripWithTimestamp.heenreis && tripWithTimestamp.heenreis.children) {
      for (const child of tripWithTimestamp.heenreis.children) {
        await addChildToGlobal(child);
      }
    }
    
    if (tripWithTimestamp.terugreis && tripWithTimestamp.terugreis.children) {
      for (const child of tripWithTimestamp.terugreis.children) {
        await addChildToGlobal(child);
      }
    }
    
    // Mock-implementatie check
    if (db.name === 'mock-firebase-app') {
      const newId = "mock-trip-" + Date.now();
      const newTrip = {
        id: newId,
        name: tripData.name || "Nieuwe Trip",
        destination: tripData.destination || "Onbekend",
        date: tripData.date || new Date().toISOString(),
        heenreis: tripData.heenreis || {
          cars: [],
          children: []
        },
        terugreis: tripData.terugreis || {
          cars: [],
          children: []
        },
        ...tripWithTimestamp
      };
      mockData.trips.push(newTrip);
      setLocalStorage('automaatje_trips', mockData.trips);
      return newId;
    }
    
    // Maak document in Firestore
    const docRef = await addDoc(collection(db, TRIPS_COLLECTION), tripWithTimestamp);
    return docRef.id;
  } catch (error) {
    console.error('Error creating trip:', error);
    
    // Fallback naar mock implementatie als Firebase-error
    try {
      const newId = "mock-trip-" + Date.now();
      const newTrip = {
        id: newId,
        name: tripData.name || "Nieuwe Trip",
        destination: tripData.destination || "Onbekend",
        date: tripData.date || new Date().toISOString(),
        heenreis: tripData.heenreis || {
          cars: [],
          children: []
        },
        terugreis: tripData.terugreis || {
          cars: [],
          children: []
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockData.trips.push(newTrip);
      setLocalStorage('automaatje_trips', mockData.trips);
      console.log("Fallback naar mock implementatie succesvol");
      return newId;
    } catch (fallbackError) {
      console.error("Fallback failed:", fallbackError);
      throw error;
    }
  }
};

export const getTripById = async (tripId) => {
  try {
    // Mock-implementatie check
    if (db.name === 'mock-firebase-app') {
      const trip = mockData.trips.find(t => t.id === tripId);
      return trip || null;
    }
    
    const tripDoc = await getDoc(doc(db, TRIPS_COLLECTION, tripId));
    if (tripDoc.exists()) {
      return {
        id: tripDoc.id,
        ...tripDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting trip:', error);
    throw error;
  }
};

export const getTrips = async () => {
  try {
    // Mock-implementatie check
    if (db.name === 'mock-firebase-app') {
      return [...mockData.trips].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    
    const tripsQuery = query(
      collection(db, TRIPS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(tripsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting trips:', error);
    throw error;
  }
};

// Functie om real-time updates van trips te ontvangen
export const subscribeToTrips = (callback) => {
  try {
    // Mock-implementatie check
    if (db.name === 'mock-firebase-app') {
      // Direct callback aanroepen met huidige data
      callback([...mockData.trips]);
      // Dummy unsubscribe functie
      return () => {};
    }
    
    const tripsQuery = query(
      collection(db, TRIPS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(tripsQuery, (snapshot) => {
      const trips = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(trips);
    });
  } catch (error) {
    console.error('Error subscribing to trips:', error);
    // Return een dummy unsubscribe functie
    return () => {};
  }
};

// Functie om real-time updates van een specifieke trip te ontvangen
export const subscribeToTripById = (tripId, callback) => {
  try {
    // Mock-implementatie check
    if (db.name === 'mock-firebase-app') {
      const trip = mockData.trips.find(t => t.id === tripId);
      callback(trip || null);
      return () => {};
    }
    
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    
    return onSnapshot(tripRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error subscribing to trip updates:', error);
    // Return een dummy unsubscribe functie
    return () => {};
  }
};

// Functie om heenreis data bij te werken
export const updateTripHeenreis = async (tripId, heenreisData) => {
  try {
    // Mock-implementatie check
    if (db.name === 'mock-firebase-app') {
      const tripIndex = mockData.trips.findIndex(t => t.id === tripId);
      if (tripIndex !== -1) {
        // Voeg kinderen toe aan allChildrenGlobal
        if (heenreisData.children) {
          for (const child of heenreisData.children) {
            await addChildToGlobal(child);
          }
        }
        
        // Voeg kinderen toe uit auto's
        if (heenreisData.cars) {
          for (const car of heenreisData.cars) {
            if (car.assigned) {
              for (const child of car.assigned) {
                await addChildToGlobal(child);
              }
            }
          }
        }
        
        mockData.trips[tripIndex].heenreis = heenreisData;
        mockData.trips[tripIndex].updatedAt = new Date().toISOString();
        setLocalStorage('automaatje_trips', mockData.trips);
        return mockData.trips[tripIndex];
      }
      throw new Error('Trip niet gevonden');
    }
    
    // Originele Firebase implementatie
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    
    // Voeg kinderen toe aan de globale lijst
    if (heenreisData.children) {
      for (const child of heenreisData.children) {
        await addChildToGlobal(child);
      }
    }
    
    // Voeg kinderen toe uit auto's
    if (heenreisData.cars) {
      for (const car of heenreisData.cars) {
        if (car.assigned) {
          for (const child of car.assigned) {
            await addChildToGlobal(child);
          }
        }
      }
    }
    
    // Update het document
    await updateDoc(tripRef, {
      heenreis: heenreisData,
      updatedAt: serverTimestamp()
    });
    
    // Haal het bijgewerkte document op
    const updatedTripDoc = await getDoc(tripRef);
    return {
      id: updatedTripDoc.id,
      ...updatedTripDoc.data()
    };
  } catch (error) {
    console.error('Error updating trip heenreis:', error);
    throw error;
  }
};

// Functie om terugreis data bij te werken
export const updateTripTerugreis = async (tripId, terugreisData) => {
  try {
    // Mock-implementatie check
    if (db.name === 'mock-firebase-app') {
      const tripIndex = mockData.trips.findIndex(t => t.id === tripId);
      if (tripIndex !== -1) {
        // Voeg kinderen toe aan allChildrenGlobal
        if (terugreisData.children) {
          for (const child of terugreisData.children) {
            await addChildToGlobal(child);
          }
        }
        
        // Voeg kinderen toe uit auto's
        if (terugreisData.cars) {
          for (const car of terugreisData.cars) {
            if (car.assigned) {
              for (const child of car.assigned) {
                await addChildToGlobal(child);
              }
            }
          }
        }
        
        mockData.trips[tripIndex].terugreis = terugreisData;
        mockData.trips[tripIndex].updatedAt = new Date().toISOString();
        setLocalStorage('automaatje_trips', mockData.trips);
        return mockData.trips[tripIndex];
      }
      throw new Error('Trip niet gevonden');
    }
    
    // Originele Firebase implementatie
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    
    // Add children to global list
    if (terugreisData.children) {
      for (const child of terugreisData.children) {
        await addChildToGlobal(child);
      }
    }
    
    // Add children from cars to global list
    if (terugreisData.cars) {
      for (const car of terugreisData.cars) {
        if (car.assigned) {
          for (const child of car.assigned) {
            await addChildToGlobal(child);
          }
        }
      }
    }
    
    // Update the document
    await updateDoc(tripRef, {
      terugreis: terugreisData,
      updatedAt: serverTimestamp()
    });
    
    // Get the updated document
    const updatedTripDoc = await getDoc(tripRef);
    return {
      id: updatedTripDoc.id,
      ...updatedTripDoc.data()
    };
  } catch (error) {
    console.error('Error updating trip terugreis:', error);
    throw error;
  }
};

export const getCars = async (tripId) => {
  try {
    const tripDoc = await getDoc(doc(db, TRIPS_COLLECTION, tripId));
    if (tripDoc.exists()) {
      const tripData = tripDoc.data();
      return {
        heenreis: tripData.heenreis?.cars || [],
        terugreis: tripData.terugreis?.cars || []
      };
    }
    return { heenreis: [], terugreis: [] };
  } catch (error) {
    console.error('Error getting cars:', error);
    throw error;
  }
};

export const getChildren = async (tripId) => {
  try {
    const tripDoc = await getDoc(doc(db, TRIPS_COLLECTION, tripId));
    if (tripDoc.exists()) {
      const tripData = tripDoc.data();
      return {
        heenreis: tripData.heenreis?.children || [],
        terugreis: tripData.terugreis?.children || []
      };
    }
    return { heenreis: [], terugreis: [] };
  } catch (error) {
    console.error('Error getting children:', error);
    throw error;
  }
};

// Functie om alle opgeslagen kinderen te laden
export const loadAllSavedChildren = async () => {
  try {
    const snapshot = await getDocs(collection(db, CHILDREN_COLLECTION));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error loading saved children:', error);
    // Fallback naar lokale cache
    return allChildrenGlobal;
  }
};

// Functie om alle kinderen uit de huidige trip te verzamelen
export const getAllChildrenFromCurrentTrip = (tripData) => {
  if (!tripData) return [];
  
  const children = new Map();
  
  // Verzamel kinderen uit de heenreis
  if (tripData.heenreis) {
    // Kinderen in de wachtrij
    if (tripData.heenreis.children) {
      tripData.heenreis.children.forEach(child => {
        children.set(child.id.toString(), child);
      });
    }
    
    // Kinderen die al zijn toegewezen aan auto's
    if (tripData.heenreis.cars) {
      tripData.heenreis.cars.forEach(car => {
        if (car.assigned) {
          car.assigned.forEach(child => {
            children.set(child.id.toString(), child);
          });
        }
      });
    }
  }
  
  // Verzamel kinderen uit de terugreis
  if (tripData.terugreis) {
    // Kinderen in de wachtrij
    if (tripData.terugreis.children) {
      tripData.terugreis.children.forEach(child => {
        children.set(child.id.toString(), child);
      });
    }
    
    // Kinderen die al zijn toegewezen aan auto's
    if (tripData.terugreis.cars) {
      tripData.terugreis.cars.forEach(car => {
        if (car.assigned) {
          car.assigned.forEach(child => {
            children.set(child.id.toString(), child);
          });
        }
      });
    }
  }
  
  return Array.from(children.values());
};

// Functie om trip bij te werken
export const updateTrip = async (tripId, tripData) => {
  try {
    // Mock-implementatie check
    if (db.name === 'mock-firebase-app') {
      const tripIndex = mockData.trips.findIndex(t => t.id === tripId);
      if (tripIndex !== -1) {
        mockData.trips[tripIndex] = {
          ...mockData.trips[tripIndex],
          ...tripData,
          updatedAt: new Date().toISOString()
        };
        setLocalStorage('automaatje_trips', mockData.trips);
        return mockData.trips[tripIndex];
      }
      throw new Error('Trip niet gevonden');
    }
    
    const tripRef = doc(db, TRIPS_COLLECTION, tripId);
    
    // Add timestamp
    const updateData = {
      ...tripData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(tripRef, updateData);
    
    // Get the updated document
    const updatedTripDoc = await getDoc(tripRef);
    return {
      id: updatedTripDoc.id,
      ...updatedTripDoc.data()
    };
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

// Functie om trip te verwijderen
export const deleteTrip = async (tripId) => {
  try {
    // Mock-implementatie check
    if (db.name === 'mock-firebase-app') {
      const tripIndex = mockData.trips.findIndex(t => t.id === tripId);
      if (tripIndex !== -1) {
        mockData.trips.splice(tripIndex, 1);
        setLocalStorage('automaatje_trips', mockData.trips);
      }
      return true;
    }
    
    await deleteDoc(doc(db, TRIPS_COLLECTION, tripId));
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
}; 