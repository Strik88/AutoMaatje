import { useState, useEffect } from 'react';

/**
 * Custom hook voor het beheren van de toewijzing van kinderen aan auto's
 * @param {Array} initialCars - De initiële lijst met auto's
 * @param {Array} initialChildren - De initiële lijst met kinderen
 * @param {Object} options - Extra opties
 * @returns {Object} - State en functies voor het beheren van de toewijzingen
 */
function useRideAssignment(initialCars = [], initialChildren = [], options = {}) {
  const [cars, setCars] = useState(initialCars);
  const [availableChildren, setAvailableChildren] = useState(initialChildren);
  
  // Functie om een kind toe te wijzen aan een auto
  const assignChildToCar = (childId, carId) => {
    // Vind het kind
    const child = availableChildren.find(c => c.id === childId);
    if (!child) return false;
    
    // Werk de auto's bij
    setCars(prev => 
      prev.map(car => {
        if (car.id === carId) {
          // Controleer of de auto vol is
          if (car.assigned.length >= car.capacity) {
            return car; // Auto is vol, geen wijzigingen
          }
          
          return {
            ...car,
            assigned: [...car.assigned, child]
          };
        }
        return car;
      })
    );
    
    // Verwijder kind uit de beschikbare kinderen
    setAvailableChildren(prev => 
      prev.filter(c => c.id !== childId)
    );
    
    return true;
  };
  
  // Functie om een kind te verwijderen uit een auto
  const removeChildFromCar = (childId, carId) => {
    // Vind de auto en het toegewezen kind
    const car = cars.find(c => c.id === carId);
    if (!car) return false;
    
    const child = car.assigned.find(c => c.id === childId);
    if (!child) return false;
    
    // Werk de auto's bij
    setCars(prev => 
      prev.map(car => {
        if (car.id === carId) {
          return {
            ...car,
            assigned: car.assigned.filter(c => c.id !== childId)
          };
        }
        return car;
      })
    );
    
    // Voeg kind toe aan de beschikbare kinderen
    setAvailableChildren(prev => [...prev, child]);
    
    return true;
  };
  
  // Functie om alle kinderen uit een auto te verwijderen
  const clearCar = (carId) => {
    const car = cars.find(c => c.id === carId);
    if (!car || car.assigned.length === 0) return false;
    
    // Voeg alle kinderen terug aan de beschikbare lijst
    setAvailableChildren(prev => [...prev, ...car.assigned]);
    
    // Leeg de auto
    setCars(prev => 
      prev.map(c => {
        if (c.id === carId) {
          return {
            ...c,
            assigned: []
          };
        }
        return c;
      })
    );
    
    return true;
  };
  
  // Functie om de hele indeling te resetten
  const resetAssignments = () => {
    // Verzamel alle toegewezen kinderen uit auto's
    const allAssignedChildren = cars
      .flatMap(car => car.assigned);
    
    // Reset auto's
    setCars(prev => 
      prev.map(car => ({
        ...car,
        assigned: []
      }))
    );
    
    // Zet alle kinderen terug in de beschikbare lijst
    setAvailableChildren(prev => [...prev, ...allAssignedChildren]);
  };
  
  return {
    cars,
    availableChildren,
    assignChildToCar,
    removeChildFromCar,
    clearCar,
    resetAssignments,
    setCars,
    setAvailableChildren
  };
}

export default useRideAssignment; 