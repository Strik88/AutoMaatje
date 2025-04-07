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
    licensePlate: '',
    capacity: 4
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingCarId, setEditingCarId] = useState(null);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  // Functie om te beginnen met verwijderen van een auto
  const handleStartDelete = (carId) => {
    setDeleteConfirmationId(carId);
  };

  // Functie om verwijderen te bevestigen
  const handleConfirmDelete = async (carId) => {
    try {
      // Update heenreis en terugreis data zonder de verwijderde auto
      await updateHeenreisData({
        cars: heenreisData.cars.filter(car => car.id !== carId),
        // Voeg kinderen uit verwijderde auto terug in de pool
        children: [
          ...heenreisData.children,
          ...heenreisData.cars
            .filter(car => car.id === carId)
            .flatMap(car => car.assigned)
        ]
      });

      await updateTerugreisData({
        cars: terugreisData.cars.filter(car => car.id !== carId),
        // Voeg kinderen uit verwijderde auto terug in de pool
        children: [
          ...terugreisData.children,
          ...terugreisData.cars
            .filter(car => car.id === carId)
            .flatMap(car => car.assigned)
        ]
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
      
      {/* Knop voor toevoegen */}
      <div className="mb-6">
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-striksMarine text-white px-4 py-2 rounded hover:bg-opacity-90"
        >
          Nieuwe auto toevoegen
        </button>
      </div>
      
      {/* Formulier voor nieuwe auto */}
      {isAdding && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-3">Nieuwe auto toevoegen</h3>
          <form onSubmit={handleAddCar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Chauffeur</label>
              <input
                type="text"
                value={newCar.driver}
                onChange={e => setNewCar({...newCar, driver: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                placeholder="Naam van de chauffeur"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Kenteken</label>
              <input
                type="text"
                value={newCar.licensePlate}
                onChange={e => setNewCar({...newCar, licensePlate: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                placeholder="Kenteken (optioneel)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Capaciteit</label>
              <input
                type="number"
                min="1"
                max="10"
                value={newCar.capacity}
                onChange={e => setNewCar({...newCar, capacity: parseInt(e.target.value) || 4})}
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
      
      {/* Lijst van auto's */}
      <h3 className="text-lg font-semibold mb-3 text-striksMarine">Alle auto's</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {getAllCars().map(car => (
          <div key={car.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">{car.driver}</h3>
                <div className="mt-1 text-sm text-gray-600">
                  {car.licensePlate && (
                    <p className="mb-1">Kenteken: {car.licensePlate}</p>
                  )}
                  <p className="font-medium">Capaciteit: {car.capacity} passagiers</p>
                  <p>Bezetting heenreis: {getOccupancyString(car, 'heenreis')}</p>
                  <p>Bezetting terugreis: {getOccupancyString(car, 'terugreis')}</p>
                </div>
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
          </div>
        ))}
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
      
      {/* Edit modal voor auto */}
      {editingCarId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Auto bewerken</h3>
            <form onSubmit={e => {
              e.preventDefault();
              const carToUpdate = getAllCars().find(c => c.id === editingCarId);
              if (carToUpdate) {
                handleUpdateCar(carToUpdate);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chauffeur</label>
                <input
                  type="text"
                  value={getEditingCar()?.driver || ''}
                  onChange={e => updateEditingCar('driver', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Kenteken</label>
                <input
                  type="text"
                  value={getEditingCar()?.licensePlate || ''}
                  onChange={e => updateEditingCar('licensePlate', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Capaciteit</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={getEditingCar()?.capacity || 4}
                  onChange={e => updateEditingCar('capacity', parseInt(e.target.value) || 4)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                  required
                />
              </div>
              
              <div className="flex space-x-3 justify-end mt-5">
                <button
                  type="button"
                  onClick={() => setEditingCarId(null)}
                  className="text-sm px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="text-sm px-4 py-2 bg-striksMarine text-white rounded hover:bg-opacity-90 transition-colors"
                >
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCars; 