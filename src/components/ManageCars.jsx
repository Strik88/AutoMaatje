import React, { useState } from 'react';
import { useRideContext } from '../context/RideContext';

function ManageCars() {
  const { 
    heenreisData, 
    updateHeenreisData, 
    terugreisData, 
    updateTerugreisData 
  } = useRideContext();
  
  const [newCar, setNewCar] = useState({
    driver: '',
    capacity: 3
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  
  // Alle auto's ophalen (op dit moment nemen we gewoon de auto's van heenreis)
  const getAllCars = () => {
    return heenreisData.cars || [];
  };
  
  // Functie om de auto die momenteel bewerkt wordt op te halen
  const getEditingCar = () => {
    return getAllCars().find(car => car.id === editingCarId);
  };
  
  // Functie om een specifiek veld van een auto bij te werken tijdens bewerken
  const updateEditingCar = (field, value) => {
    const updatedCars = heenreisData.cars.map(car => 
      car.id === editingCarId ? { ...car, [field]: value } : car
    );
    updateHeenreisData({ cars: updatedCars });
  };
  
  // Functie om bezettingsstring voor een auto te genereren
  const getOccupancyString = (car, rideType) => {
    const rideData = rideType === 'heenreis' ? heenreisData : terugreisData;
    const thisCar = rideData.cars.find(c => c.id === car.id);
    
    if (!thisCar) return 'N/A';
    return `${thisCar.assigned.length} / ${thisCar.capacity}`;
  };
  
  // Functie om het bewerken van een auto te starten
  const handleEdit = (car) => {
    setEditingCarId(car.id);
  };
  
  // Handle toevoegen van nieuwe auto
  const handleAddCar = async (e) => {
    e.preventDefault();
    
    if (!newCar.driver || newCar.capacity < 1) {
      alert('Vul alle velden correct in');
      return;
    }
    
    // Nieuwe auto maken met uniek ID
    const carId = Date.now();
    const newCarWithId = {
      ...newCar,
      id: carId,
      assigned: []
    };
    
    // Update beide ritten tegelijk met dezelfde auto's
    try {
      await updateHeenreisData({
        cars: [...heenreisData.cars, newCarWithId]
      });
      
      await updateTerugreisData({
        cars: [...terugreisData.cars, newCarWithId]
      });
      
      // Reset formulier
      setNewCar({
        driver: '',
        capacity: 3
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Fout bij toevoegen auto:', error);
    }
  };
  
  // Handle wijzigen van een auto
  const handleUpdateCar = async (car) => {
    try {
      // Update auto in heenreis
      const updatedHeenreisCars = heenreisData.cars.map(c => 
        c.id === car.id ? { ...car } : c
      );
      
      await updateHeenreisData({
        cars: updatedHeenreisCars
      });
      
      // Update auto in terugreis
      const updatedTerugreisCars = terugreisData.cars.map(c => 
        c.id === car.id ? { ...car } : c
      );
      
      await updateTerugreisData({
        cars: updatedTerugreisCars
      });
      
      setEditingCarId(null);
    } catch (error) {
      console.error('Fout bij wijzigen auto:', error);
    }
  };
  
  // Functie om te beginnen met verwijderen van een auto
  const handleStartDelete = (carId) => {
    setDeleteConfirmationId(carId);
  };

  // Functie om verwijderen te bevestigen
  const handleConfirmDelete = async (carId) => {
    try {
      // Zoek auto's voor beide ritten
      const heenreisCar = heenreisData.cars.find(c => c.id === carId);
      const terugreisCar = terugreisData.cars.find(c => c.id === carId);
      
      // Kinderen uit auto's terugzetten in de pool
      const updatedHeenreisChildren = [
        ...heenreisData.children,
        ...(heenreisCar?.assigned || [])
      ];
      
      const updatedTerugreisChildren = [
        ...terugreisData.children,
        ...(terugreisCar?.assigned || [])
      ];
      
      // Update heenreis zonder de auto
      await updateHeenreisData({
        cars: heenreisData.cars.filter(c => c.id !== carId),
        children: updatedHeenreisChildren
      });
      
      // Update terugreis zonder de auto
      await updateTerugreisData({
        cars: terugreisData.cars.filter(c => c.id !== carId),
        children: updatedTerugreisChildren
      });
      
      setDeleteConfirmationId(null);
    } catch (error) {
      console.error('Fout bij verwijderen auto:', error);
    }
  };

  // Functie om verwijderen te annuleren
  const handleCancelDelete = () => {
    setDeleteConfirmationId(null);
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-striksMarine">Auto's beheren</h2>
      
      {/* Lijst van auto's */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {heenreisData.cars.length === 0 ? (
          <p className="text-gray-500">Nog geen auto's toegevoegd.</p>
        ) : (
          heenreisData.cars.map(car => (
            <div key={car.id} className="border rounded-lg p-4 bg-white shadow-sm">
              {editingCarId === car.id ? (
                // Bewerkingsformulier
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Bestuurder</label>
                    <input
                      type="text"
                      value={car.driver}
                      onChange={e => {
                        const updatedCars = heenreisData.cars.map(c => 
                          c.id === car.id ? { ...c, driver: e.target.value } : c
                        );
                        updateHeenreisData({ cars: updatedCars });
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Capaciteit</label>
                    <input
                      type="number"
                      min="1"
                      max="9"
                      value={car.capacity}
                      onChange={e => {
                        const capacity = parseInt(e.target.value);
                        if (isNaN(capacity)) return;
                        
                        const updatedCars = heenreisData.cars.map(c => 
                          c.id === car.id ? { ...c, capacity } : c
                        );
                        updateHeenreisData({ cars: updatedCars });
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdateCar(car)}
                      className="bg-striksMarine text-white px-3 py-1 rounded hover:bg-opacity-90"
                    >
                      Opslaan
                    </button>
                    <button
                      onClick={() => setEditingCarId(null)}
                      className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                    >
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                // Normaal weergave
                <div>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{car.driver}</h3>
                      <p className="text-sm text-gray-600 mt-1">Capaciteit: {car.capacity}</p>
                      <p className="text-sm text-gray-600">
                        Bezet: {getOccupancyString(car, 'heenreis')}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button 
                        onClick={() => handleEdit(car)}
                        className="text-sm px-3 py-1 border border-striksMarine text-striksMarine rounded hover:bg-striksMarine hover:bg-opacity-10 transition-colors"
                      >
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Bewerken
                        </span>
                      </button>
                      <button 
                        onClick={() => handleStartDelete(car.id)}
                        className="text-sm px-3 py-1 border border-gray-300 text-gray-600 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                      >
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Verwijderen
                        </span>
                      </button>
                    </div>
                  </div>
                  {car.assigned.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Toegewezen kinderen:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {car.assigned.map(child => (
                          <span 
                            key={child.id}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {child.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Verwijder bevestiging als modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Bevestig verwijderen</h3>
            <p className="text-sm text-gray-700 mb-4">
              Weet je zeker dat je deze auto wilt verwijderen? Kinderen die in deze auto waren ingedeeld worden weer in de pool geplaatst.
            </p>
            <div className="flex space-x-3 justify-end">
              <button 
                onClick={handleCancelDelete}
                className="text-sm px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
              >
                Annuleren
              </button>
              <button 
                onClick={() => handleConfirmDelete(deleteConfirmationId)}
                className="text-sm px-4 py-2 border border-red-500 text-red-600 rounded hover:bg-red-500 hover:text-white transition-colors"
              >
                Ja, verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Nieuwe auto toevoegen */}
      <div className="mb-6">
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-striksMarine text-white px-4 py-2 rounded hover:bg-opacity-90"
          >
            Nieuwe auto toevoegen
          </button>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Nieuwe auto toevoegen</h3>
            <form onSubmit={handleAddCar}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Bestuurder</label>
                <input
                  type="text"
                  value={newCar.driver}
                  onChange={e => setNewCar({...newCar, driver: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Capaciteit</label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  value={newCar.capacity}
                  onChange={e => setNewCar({...newCar, capacity: parseInt(e.target.value) || 3})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-striksMarine text-white px-4 py-2 rounded hover:bg-opacity-90"
                >
                  Toevoegen
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Annuleren
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageCars; 