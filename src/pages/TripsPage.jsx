import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useClassAuthContext } from '../context/ClassAuthContext';
import { useRide } from '../context/RideContext';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiCheckCircle } from 'react-icons/fi';

function TripsPage() {
  const [tripName, setTripName] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [tripDestination, setTripDestination] = useState('');
  const [editingTrip, setEditingTrip] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { currentUser, currentClass } = useClassAuthContext();
  const { trips, currentTrip, setCurrentTrip, refreshTrips } = useRide();
  const navigate = useNavigate();

  // Effectieve datum van vandaag in YYYY-MM-DD formaat
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!currentClass) {
      navigate('/login');
    }
  }, [currentClass, navigate]);

  const resetForm = () => {
    setTripName('');
    setTripDate(today);
    setTripDestination('');
    setEditingTrip(null);
    setIsFormOpen(false);
  };

  const handleTripSelect = (trip) => {
    setCurrentTrip(trip);
    // Ga naar de Heenreis pagina na selectie
    navigate('/heenreis');
  };

  const handleAddTrip = async (e) => {
    e.preventDefault();
    
    if (!tripName.trim() || !tripDate) return;
    
    try {
      // Nieuw uitstapje toevoegen
      const tripData = {
        name: tripName.trim(),
        date: tripDate,
        destination: tripDestination.trim(),
        classId: currentClass.id,
        createdBy: currentUser.name,
        createdAt: new Date().toISOString(),
      };
      
      if (editingTrip) {
        // Update bestaand uitstapje
        await updateDoc(doc(db, 'trips', editingTrip.id), tripData);
      } else {
        // Nieuw uitstapje aanmaken
        await addDoc(collection(db, 'trips'), tripData);
      }
      
      // Reset formulier en ververs uitstapjes
      resetForm();
      refreshTrips();
      
    } catch (error) {
      console.error('Fout bij uitstapje toevoegen/bewerken:', error);
      alert('Er is een fout opgetreden. Probeer het later nog eens.');
    }
  };

  const handleEditTrip = (trip) => {
    setTripName(trip.name);
    setTripDate(trip.date);
    setTripDestination(trip.destination || '');
    setEditingTrip(trip);
    setIsFormOpen(true);
  };

  const handleDeleteTrip = async (tripId) => {
    try {
      await deleteDoc(doc(db, 'trips', tripId));
      
      // Als het huidige uitstapje wordt verwijderd, reset currentTrip
      if (currentTrip && currentTrip.id === tripId) {
        setCurrentTrip(null);
      }
      
      refreshTrips();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Fout bij uitstapje verwijderen:', error);
      alert('Er is een fout opgetreden bij het verwijderen. Probeer het later nog eens.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-striksMarine">Ritten</h1>
        
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="bg-striksMarine hover:bg-striksMarineDark text-white px-3 py-2 rounded-md flex items-center transition-colors"
        >
          <FiPlus className="mr-2" /> Nieuwe Rit
        </button>
      </div>

      {/* Formulier voor toevoegen/bewerken van uitstapjes */}
      {isFormOpen && (
        <div className="bg-white p-4 mb-6 rounded-md shadow-md">
          <h2 className="text-lg font-semibold text-striksMarine mb-4">
            {editingTrip ? 'Rit Bewerken' : 'Nieuwe Rit Toevoegen'}
          </h2>
          
          <form onSubmit={handleAddTrip} className="space-y-4">
            <div>
              <label htmlFor="tripName" className="block text-sm font-medium text-gray-700 mb-1">
                Naam
              </label>
              <input
                type="text"
                id="tripName"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-striksTurquoise"
                placeholder="Bijv. Schoolreisje"
                required
              />
            </div>
            
            <div>
              <label htmlFor="tripDate" className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                id="tripDate"
                value={tripDate}
                onChange={(e) => setTripDate(e.target.value)}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-striksTurquoise"
                required
              />
            </div>
            
            <div>
              <label htmlFor="tripDestination" className="block text-sm font-medium text-gray-700 mb-1">
                Bestemming
              </label>
              <input
                type="text"
                id="tripDestination"
                value={tripDestination}
                onChange={(e) => setTripDestination(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-striksTurquoise"
                placeholder="Bijv. Efteling"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-white bg-striksMarine rounded-md hover:bg-striksMarineDark"
              >
                {editingTrip ? 'Bijwerken' : 'Toevoegen'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lijst van uitstapjes */}
      <div className="bg-white rounded-md shadow-md overflow-hidden">
        {trips.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {trips.map((trip) => (
              <div 
                key={trip.id} 
                className={`p-4 hover:bg-gray-50 ${
                  currentTrip && currentTrip.id === trip.id ? 'bg-striksTurquoise/10 border-l-4 border-striksTurquoise' : ''
                }`}
              >
                <div className="flex justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => handleTripSelect(trip)}>
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{trip.name}</h3>
                      {currentTrip && currentTrip.id === trip.id && (
                        <span className="ml-2 text-striksTurquoise">
                          <FiCheckCircle className="w-5 h-5" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(trip.date).toLocaleDateString()} 
                      {trip.destination && ` - ${trip.destination}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Aangemaakt door: {trip.createdBy || 'Onbekend'}
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <button
                      onClick={() => handleEditTrip(trip)}
                      className="p-1 text-gray-500 hover:text-striksMarine"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    
                    {showDeleteConfirm === trip.id ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="p-1 text-gray-500"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(trip.id)}
                        className="p-1 text-gray-500 hover:text-red-500"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">Geen ritten gevonden. Maak je eerste rit aan!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TripsPage; 