// Mock rideService implementatie voor lokaal gebruik zonder Firebase

// Mock collecties - initiële data
const initialMockData = {
  trips: [
    {
      id: "trip1",
      title: "Uitje naar Speeltuin",
      date: new Date().toISOString(),
      destination: "De Leuke Speeltuin",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "123456",
      heenreis: {
        cars: [
          { id: 1, driver: "Ouder 1", capacity: 3, assigned: [] },
          { id: 2, driver: "Ouder 2", capacity: 4, assigned: [] }
        ],
        children: [
          { id: 1, name: "Kind 1" },
          { id: 2, name: "Kind 2" },
          { id: 3, name: "Kind 3" },
          { id: 4, name: "Kind 4" },
          { id: 5, name: "Kind 5" }
        ]
      },
      terugreis: {
        cars: [
          { id: 1, driver: "Ouder 1", capacity: 3, assigned: [] },
          { id: 2, driver: "Ouder 2", capacity: 4, assigned: [] }
        ],
        children: [
          { id: 1, name: "Kind 1" },
          { id: 2, name: "Kind 2" },
          { id: 3, name: "Kind 3" },
          { id: 4, name: "Kind 4" },
          { id: 5, name: "Kind 5" }
        ]
      }
    }
  ],
  cars: [
    { id: 1, driver: "Ouder 1", capacity: 3 },
    { id: 2, driver: "Ouder 2", capacity: 4 }
  ],
  children: [
    { id: 1, name: "Kind 1" },
    { id: 2, name: "Kind 2" },
    { id: 3, name: "Kind 3" },
    { id: 4, name: "Kind 4" },
    { id: 5, name: "Kind 5" }
  ]
};

// Een verzameling van alle kinderen die ooit aangemaakt zijn
let allChildrenGlobal = [];

// Initialiseren van de verzameling van alle kinderen
const initAllChildren = () => {
  // Probeer eerst uit localStorage
  const storedAllChildren = localStorage.getItem('automaatje_all_children');
  if (storedAllChildren) {
    try {
      allChildrenGlobal = JSON.parse(storedAllChildren);
    } catch (e) {
      allChildrenGlobal = [];
    }
  } 
  
  // Als er nog niets in localStorage stond, vul met initialMockData kinderen
  if (allChildrenGlobal.length === 0) {
    // Voeg de kinderen uit initialMockData toe
    allChildrenGlobal = [...initialMockData.children];
    localStorage.setItem('automaatje_all_children', JSON.stringify(allChildrenGlobal));
  }
};

// Roep initialisatie aan bij starten van de service
initAllChildren();

// Haal data op uit localStorage of gebruik initiële data
const loadStoredData = () => {
  try {
    const storedData = localStorage.getItem('automaatje_data');
    if (storedData) {
      return JSON.parse(storedData);
    }
    // Als er geen opgeslagen data is, gebruik de initiële data en sla deze op
    localStorage.setItem('automaatje_data', JSON.stringify(initialMockData));
    return initialMockData;
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return initialMockData;
  }
};

// Laad data bij initialisatie
let mockData = loadStoredData();

// Hulpfunctie om data op te slaan in localStorage
const saveDataToStorage = () => {
  try {
    localStorage.setItem('automaatje_data', JSON.stringify(mockData));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

// Functie om een kind toe te voegen aan allChildrenGlobal
const addChildToGlobal = (child) => {
  if (!child || !child.id) return;
  
  // Controleer of het kind al in de globale lijst staat
  if (!allChildrenGlobal.some(c => c.id === child.id)) {
    allChildrenGlobal.push(child);
    localStorage.setItem('automaatje_all_children', JSON.stringify(allChildrenGlobal));
  }
};

// Trip functies
export const createTrip = async (tripData) => {
  try {
    const newId = `trip${mockData.trips.length + 1}`;
    const newTrip = {
      ...tripData,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Voeg kinderen toe aan de globale lijst
    if (newTrip.heenreis && newTrip.heenreis.children) {
      newTrip.heenreis.children.forEach(addChildToGlobal);
    }
    if (newTrip.terugreis && newTrip.terugreis.children) {
      newTrip.terugreis.children.forEach(addChildToGlobal);
    }
    
    mockData.trips.push(newTrip);
    saveDataToStorage(); // Sla op in localStorage
    return newId;
  } catch (error) {
    console.error('Error creating trip:', error);
    throw error;
  }
};

export const getTripById = async (tripId) => {
  try {
    const trip = mockData.trips.find(t => t.id === tripId);
    return trip || null;
  } catch (error) {
    console.error('Error getting trip:', error);
    throw error;
  }
};

export const getTrips = async () => {
  try {
    // Ververs de data uit localStorage (in geval van wijzigingen in andere tabs)
    mockData = loadStoredData();
    return [...mockData.trips];
  } catch (error) {
    console.error('Error getting trips:', error);
    throw error;
  }
};

// Functie om trip bij te werken
export const updateTrip = async (tripId, tripData) => {
  try {
    const tripIndex = mockData.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) {
      throw new Error(`Trip met ID ${tripId} niet gevonden`);
    }
    
    // Bewaar de bestaande heenreis en terugreis informatie
    const existingTrip = mockData.trips[tripIndex];
    const updatedTrip = {
      ...existingTrip,
      ...tripData,
      updatedAt: new Date(),
      // Behoud de bestaande reis info tenzij expliciet meegeleverd
      heenreis: tripData.heenreis || existingTrip.heenreis,
      terugreis: tripData.terugreis || existingTrip.terugreis
    };
    
    mockData.trips[tripIndex] = updatedTrip;
    saveDataToStorage();
    return updatedTrip;
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

// Functie om trip te verwijderen
export const deleteTrip = async (tripId) => {
  try {
    const tripIndex = mockData.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) {
      throw new Error(`Trip met ID ${tripId} niet gevonden`);
    }
    
    // Verwijder de trip uit de lijst
    mockData.trips.splice(tripIndex, 1);
    saveDataToStorage();
    return true;
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

export const updateTripHeenreis = async (tripId, heenreisData) => {
  try {
    const tripIndex = mockData.trips.findIndex(t => t.id === tripId);
    if (tripIndex >= 0) {
      // Voeg kinderen toe aan de globale lijst
      if (heenreisData.children) {
        heenreisData.children.forEach(addChildToGlobal);
      }
      if (heenreisData.cars) {
        heenreisData.cars.forEach(car => {
          if (car.assigned) {
            car.assigned.forEach(addChildToGlobal);
          }
        });
      }
      
      mockData.trips[tripIndex].heenreis = heenreisData;
      mockData.trips[tripIndex].updatedAt = new Date();
      saveDataToStorage(); // Sla op in localStorage
    }
    return true;
  } catch (error) {
    console.error('Error updating heenreis:', error);
    throw error;
  }
};

export const updateTripTerugreis = async (tripId, terugreisData) => {
  try {
    const tripIndex = mockData.trips.findIndex(t => t.id === tripId);
    if (tripIndex >= 0) {
      // Voeg kinderen toe aan de globale lijst
      if (terugreisData.children) {
        terugreisData.children.forEach(addChildToGlobal);
      }
      if (terugreisData.cars) {
        terugreisData.cars.forEach(car => {
          if (car.assigned) {
            car.assigned.forEach(addChildToGlobal);
          }
        });
      }
      
      mockData.trips[tripIndex].terugreis = terugreisData;
      mockData.trips[tripIndex].updatedAt = new Date();
      saveDataToStorage(); // Sla op in localStorage
    }
    return true;
  } catch (error) {
    console.error('Error updating terugreis:', error);
    throw error;
  }
};

// Auto functies
export const createCar = async (carData) => {
  try {
    const newId = `car${mockData.cars.length + 1}`;
    const newCar = {
      ...carData,
      id: newId,
      createdAt: new Date()
    };
    
    mockData.cars.push(newCar);
    saveDataToStorage(); // Sla op in localStorage
    return newId;
  } catch (error) {
    console.error('Error creating car:', error);
    throw error;
  }
};

export const getCars = async () => {
  try {
    // Ververs de data uit localStorage
    mockData = loadStoredData();
    return [...mockData.cars];
  } catch (error) {
    console.error('Error getting cars:', error);
    throw error;
  }
};

export const updateCar = async (carId, carData) => {
  try {
    const carIndex = mockData.cars.findIndex(c => c.id === carId);
    if (carIndex >= 0) {
      mockData.cars[carIndex] = {
        ...mockData.cars[carIndex],
        ...carData,
        updatedAt: new Date()
      };
      saveDataToStorage(); // Sla op in localStorage
    }
    return true;
  } catch (error) {
    console.error('Error updating car:', error);
    throw error;
  }
};

// Kind functies
export const createChild = async (childData) => {
  try {
    const newId = `child${mockData.children.length + 1}`;
    const newChild = {
      ...childData,
      id: newId,
      createdAt: new Date()
    };
    
    // Voeg toe aan globale lijst
    addChildToGlobal(newChild);
    
    mockData.children.push(newChild);
    saveDataToStorage(); // Sla op in localStorage
    return newId;
  } catch (error) {
    console.error('Error creating child:', error);
    throw error;
  }
};

export const getChildren = async () => {
  try {
    // Ververs de data uit localStorage
    mockData = loadStoredData();
    return [...mockData.children];
  } catch (error) {
    console.error('Error getting children:', error);
    throw error;
  }
};

export const getAllSavedChildren = async () => {
  try {
    return [...allChildrenGlobal];
  } catch (error) {
    console.error('Error getting all saved children:', error);
    throw error;
  }
};

export const updateChild = async (childId, childData) => {
  try {
    const childIndex = mockData.children.findIndex(c => c.id === childId);
    if (childIndex >= 0) {
      const updatedChild = {
        ...mockData.children[childIndex],
        ...childData,
        updatedAt: new Date()
      };
      
      mockData.children[childIndex] = updatedChild;
      
      // Update in globale lijst
      const globalIndex = allChildrenGlobal.findIndex(c => c.id === childId);
      if (globalIndex >= 0) {
        allChildrenGlobal[globalIndex] = updatedChild;
        localStorage.setItem('automaatje_all_children', JSON.stringify(allChildrenGlobal));
      }
      
      saveDataToStorage(); // Sla op in localStorage
    }
    return true;
  } catch (error) {
    console.error('Error updating child:', error);
    throw error;
  }
}; 