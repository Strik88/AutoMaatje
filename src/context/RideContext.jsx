import React, { createContext, useContext, useState, useEffect } from 'react';
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
  deleteTrip
} from '../firebase/rideService';

// Create context
const RideContext = createContext();

// Hook to use the context
export const useRideContext = () => useContext(RideContext);

// Provider component
export const RideProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [currentTrip, setCurrentTrip] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State voor heen- en terugreis data
  const [heenreisData, setHeenreisData] = useState({
    cars: [],
    children: []
  });
  
  const [terugreisData, setTerugreisData] = useState({
    cars: [],
    children: []
  });
  
  // Laad trips wanneer de gebruiker is ingelogd
  useEffect(() => {
    if (user) {
      loadTrips();
    }
  }, [user]);
  
  // Laad trips van Firebase
  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tripsData = await getTrips();
      setTrips(tripsData);
      
      // Als er trips zijn, laad de eerste als huidige trip
      if (tripsData.length > 0) {
        await loadTrip(tripsData[0].id);
      } else {
        // Geen trips gevonden, maak testdata
        await setupInitialData();
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  // Laad specifieke trip
  const loadTrip = async (tripId) => {
    try {
      setLoading(true);
      setError(null);
      
      const tripData = await getTripById(tripId);
      setCurrentTrip(tripData);
      
      if (tripData) {
        // Laad heen- en terugreis data
        if (tripData.heenreis) {
          setHeenreisData(tripData.heenreis);
        }
        
        if (tripData.terugreis) {
          setTerugreisData(tripData.terugreis);
        }
      }
      
      setLoading(false);
      return tripData;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };
  
  // Functie om een trip bij te werken
  const updateTripInfo = async (tripId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedTrip = await updateTrip(tripId, updateData);
      
      // Update de lokale trips state
      setTrips(prevTrips => 
        prevTrips.map(trip => 
          trip.id === tripId ? updatedTrip : trip
        )
      );
      
      // Als de huidige trip is bijgewerkt, update currentTrip
      if (currentTrip && currentTrip.id === tripId) {
        setCurrentTrip(updatedTrip);
      }
      
      setLoading(false);
      return updatedTrip;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };
  
  // Functie om een trip te verwijderen
  const removeTrip = async (tripId) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteTrip(tripId);
      
      // Verwijder uit lokale state
      const updatedTrips = trips.filter(trip => trip.id !== tripId);
      setTrips(updatedTrips);
      
      // Als de huidige trip is verwijderd, laad een andere trip
      if (currentTrip && currentTrip.id === tripId) {
        if (updatedTrips.length > 0) {
          await loadTrip(updatedTrips[0].id);
        } else {
          setCurrentTrip(null);
          setHeenreisData({ cars: [], children: [] });
          setTerugreisData({ cars: [], children: [] });
        }
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return false;
    }
  };
  
  // Maak testdata voor de app
  const setupInitialData = async (tripData = {}) => {
    try {
      // Testdata voorbereiden
      const initialCars = [
        { id: 1, driver: "Ouder 1", capacity: 3, assigned: [] },
        { id: 2, driver: "Ouder 2", capacity: 4, assigned: [] }
      ];
      
      const initialChildren = [
        { id: 1, name: "Kind 1" },
        { id: 2, name: "Kind 2" },
        { id: 3, name: "Kind 3" }
      ];
      
      // Nieuwe trip aanmaken
      const initialTripData = {
        title: tripData.title || "Testrit",
        date: tripData.date || new Date().toISOString(),
        destination: tripData.destination || "Testbestemming",
        heenreis: {
          cars: initialCars,
          children: initialChildren
        },
        terugreis: {
          cars: initialCars,
          children: initialChildren
        },
        createdBy: user?.uid
      };
      
      const tripId = await createTrip(initialTripData);
      
      // Nieuwe trip laden
      await loadTrip(tripId);
      await loadTrips(); // Trips opnieuw laden
      
      return tripId;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };
  
  // Functie om de heenreis data bij te werken
  const updateHeenreisData = async (newData) => {
    if (!currentTrip) return false;
    
    try {
      setHeenreisData(prev => ({
        ...prev,
        ...newData
      }));
      
      // Update Firebase
      if (currentTrip) {
        await updateTripHeenreis(currentTrip.id, {
          ...heenreisData,
          ...newData
        });
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };
  
  // Functie om de terugreis data bij te werken
  const updateTerugreisData = async (newData) => {
    if (!currentTrip) return false;
    
    try {
      setTerugreisData(prev => ({
        ...prev,
        ...newData
      }));
      
      // Update Firebase
      if (currentTrip) {
        await updateTripTerugreis(currentTrip.id, {
          ...terugreisData,
          ...newData
        });
      }
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };
  
  // Functie om kind toe te wijzen aan heenreis auto
  const assignChildToCarHeenreis = async (childId, carId) => {
    const childToAssign = heenreisData.children.find(c => c.id === childId);
    if (!childToAssign) return false;
    
    const updatedCars = heenreisData.cars.map(car => {
      if (car.id === carId) {
        // Controleer of auto vol is
        if (car.assigned.length >= car.capacity) return car;
        
        return {
          ...car,
          assigned: [...car.assigned, childToAssign]
        };
      }
      return car;
    });
    
    const updatedChildren = heenreisData.children.filter(c => c.id !== childId);
    
    const updatedData = {
      cars: updatedCars,
      children: updatedChildren
    };
    
    // Update state en Firebase
    const success = await updateHeenreisData(updatedData);
    
    if (success) {
      // Poging om hetzelfde kind in dezelfde auto voor terugreis toe te wijzen
      tryAssignChildToSameCarTerugreis(childToAssign, carId);
    }
    
    return success;
  };
  
  // Functie om kind toe te wijzen aan terugreis auto
  const assignChildToCarTerugreis = async (childId, carId) => {
    const childToAssign = terugreisData.children.find(c => c.id === childId);
    if (!childToAssign) return false;
    
    const updatedCars = terugreisData.cars.map(car => {
      if (car.id === carId) {
        // Controleer of auto vol is
        if (car.assigned.length >= car.capacity) return car;
        
        return {
          ...car,
          assigned: [...car.assigned, childToAssign]
        };
      }
      return car;
    });
    
    const updatedChildren = terugreisData.children.filter(c => c.id !== childId);
    
    const updatedData = {
      cars: updatedCars,
      children: updatedChildren
    };
    
    // Update state en Firebase
    return await updateTerugreisData(updatedData);
  };
  
  // Probeer kind in dezelfde auto toe te wijzen voor terugreis
  const tryAssignChildToSameCarTerugreis = (child, heenreisCarId) => {
    // Controleer of het kind al in de terugreis zit
    const isChildInTerugreis = terugreisData.cars.some(car => 
      car.assigned.some(c => c.id === child.id)
    );
    
    if (isChildInTerugreis) return false;
    
    // Zoek het kind in de beschikbare kinderen voor terugreis
    const childInTerugreis = terugreisData.children.find(c => c.id === child.id);
    if (!childInTerugreis) return false;
    
    // Zoek dezelfde auto in terugreis
    const terugreisCar = terugreisData.cars.find(car => car.id === heenreisCarId);
    if (!terugreisCar) return false;
    
    // Controleer of auto nog ruimte heeft
    if (terugreisCar.assigned.length >= terugreisCar.capacity) return false;
    
    // Wijs toe aan dezelfde auto
    assignChildToCarTerugreis(child.id, heenreisCarId);
    return true;
  };
  
  // Functie om kind te verwijderen uit heenreis auto
  const removeChildFromCarHeenreis = async (childId, carId) => {
    const car = heenreisData.cars.find(c => c.id === carId);
    if (!car) return false;
    
    const childToRemove = car.assigned.find(c => c.id === childId);
    if (!childToRemove) return false;
    
    const updatedCars = heenreisData.cars.map(car => {
      if (car.id === carId) {
        return {
          ...car,
          assigned: car.assigned.filter(c => c.id !== childId)
        };
      }
      return car;
    });
    
    const updatedData = {
      cars: updatedCars,
      children: [...heenreisData.children, childToRemove]
    };
    
    // Update state en Firebase
    return await updateHeenreisData(updatedData);
  };
  
  // Functie om kind te verwijderen uit terugreis auto
  const removeChildFromCarTerugreis = async (childId, carId) => {
    const car = terugreisData.cars.find(c => c.id === carId);
    if (!car) return false;
    
    const childToRemove = car.assigned.find(c => c.id === childId);
    if (!childToRemove) return false;
    
    const updatedCars = terugreisData.cars.map(car => {
      if (car.id === carId) {
        return {
          ...car,
          assigned: car.assigned.filter(c => c.id !== childId)
        };
      }
      return car;
    });
    
    const updatedData = {
      cars: updatedCars,
      children: [...terugreisData.children, childToRemove]
    };
    
    // Update state en Firebase
    return await updateTerugreisData(updatedData);
  };
  
  // Functie om alle kinderen (uit alle ritten) op te halen en op te slaan in localStorage
  const loadAllSavedChildren = () => {
    try {
      // Eerst alle huidige kinderen ophalen (toegewezen en niet-toegewezen)
      const currentChildren = getAllChildrenFromCurrentTrip();
      
      // Opgeslagen kinderen ophalen
      let savedChildren = [];
      const savedChildrenString = localStorage.getItem('automaatje_all_children');
      if (savedChildrenString) {
        savedChildren = JSON.parse(savedChildrenString);
      }
      
      // Combineer huidige kinderen met opgeslagen kinderen (voorkom duplicaten op ID)
      const allChildren = [...savedChildren];
      
      currentChildren.forEach(child => {
        // Controleer of kind met dit ID al bestaat
        if (!allChildren.some(c => c.id === child.id)) {
          allChildren.push(child);
        }
      });
      
      // Sla alle kinderen op in localStorage
      localStorage.setItem('automaatje_all_children', JSON.stringify(allChildren));
      
      return allChildren;
    } catch (error) {
      console.error('Fout bij laden van alle kinderen:', error);
      return [];
    }
  };
  
  // Functie om alle kinderen uit de huidige trip te verzamelen
  const getAllChildrenFromCurrentTrip = () => {
    if (!currentTrip) return [];
    
    const heenreisChildren = heenreisData.children || [];
    const heenreisAssignedChildren = heenreisData.cars ? 
      heenreisData.cars.flatMap(car => car.assigned || []) : [];
    
    const terugreisChildren = terugreisData.children || [];
    const terugreisAssignedChildren = terugreisData.cars ? 
      terugreisData.cars.flatMap(car => car.assigned || []) : [];
    
    // Combineer alle kinderen en verwijder duplicaten op basis van ID
    const allChildrenWithDuplicates = [
      ...heenreisChildren, 
      ...heenreisAssignedChildren,
      ...terugreisChildren,
      ...terugreisAssignedChildren
    ];
    
    // Map om duplicaten te verwijderen
    const childMap = new Map();
    allChildrenWithDuplicates.forEach(child => {
      if (child && child.id) {
        childMap.set(child.id, child);
      }
    });
    
    return Array.from(childMap.values());
  };
  
  // Functie om opgeslagen kinderen toe te voegen aan de huidige trip
  const addSavedChildrenToCurrentTrip = async () => {
    if (!currentTrip) {
      setError('Geen actieve rit geselecteerd');
      return false;
    }
    
    try {
      // Update het lokale bestand met de huidige trip data
      loadAllSavedChildren();
      
      // Haal alle opgeslagen kinderen op
      const savedChildrenString = localStorage.getItem('automaatje_all_children');
      if (!savedChildrenString) {
        setError('Geen opgeslagen kinderen gevonden');
        return false;
      }
      
      const savedChildren = JSON.parse(savedChildrenString);
      if (savedChildren.length === 0) {
        setError('Geen opgeslagen kinderen gevonden');
        return false;
      }
      
      // Huidige kinderen IDs ophalen om duplicaten te voorkomen
      const currentChildrenIds = getAllChildrenFromCurrentTrip().map(child => child.id);
      
      // Filter kinderen die nog niet in de huidige trip zitten
      const newChildren = savedChildren.filter(child => !currentChildrenIds.includes(child.id));
      
      if (newChildren.length === 0) {
        alert('Alle beschikbare kinderen zijn al toegevoegd aan deze trip');
        return false;
      }
      
      // Voeg nieuwe kinderen toe aan heenreis en terugreis
      await updateHeenreisData({
        children: [...heenreisData.children, ...newChildren]
      });
      
      await updateTerugreisData({
        children: [...terugreisData.children, ...newChildren]
      });
      
      alert(`${newChildren.length} eerder gebruikte kinderen toegevoegd`);
      return true;
    } catch (error) {
      console.error('Fout bij toevoegen van opgeslagen kinderen:', error);
      setError(error.message);
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
    loadTrips,
    loadTrip,
    updateTripInfo,
    removeTrip,
    setupInitialData,
    updateHeenreisData,
    updateTerugreisData,
    assignChildToCarHeenreis,
    assignChildToCarTerugreis,
    removeChildFromCarHeenreis,
    removeChildFromCarTerugreis,
    tryAssignChildToSameCarTerugreis,
    loadAllSavedChildren,
    addSavedChildrenToCurrentTrip
  };
  
  return <RideContext.Provider value={value}>{children}</RideContext.Provider>;
};

export default RideContext; 