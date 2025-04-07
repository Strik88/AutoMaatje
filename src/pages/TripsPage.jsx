import React, { useState, useEffect } from 'react';
import { useRideContext } from '../context/RideContext';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

function TripsPage() {
  const { 
    trips, 
    currentTrip, 
    loadTrip, 
    loading, 
    error, 
    setupInitialData,
    updateTripInfo,
    removeTrip
  } = useRideContext();
  
  const [newTripTitle, setNewTripTitle] = useState('');
  const [newTripDestination, setNewTripDestination] = useState('');
  const [newTripDate, setNewTripDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTripId, setEditTripId] = useState(null);
  const [editTripTitle, setEditTripTitle] = useState('');
  const [editTripDestination, setEditTripDestination] = useState('');
  const [editTripDate, setEditTripDate] = useState('');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  
  // Functie om een nieuwe trip aan te maken
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    
    if (!newTripTitle || !newTripDestination || !newTripDate) {
      alert('Vul alle velden in');
      return;
    }
    
    try {
      // De ingevoerde gegevens doorgeven aan setupInitialData
      await setupInitialData({
        title: newTripTitle,
        destination: newTripDestination,
        date: new Date(newTripDate).toISOString()
      });
      
      // Reset form
      setNewTripTitle('');
      setNewTripDestination('');
      setNewTripDate(new Date().toISOString().split('T')[0]);
      setIsCreating(false);
    } catch (error) {
      console.error('Fout bij aanmaken trip:', error);
    }
  };

  // Functie om te beginnen met bewerken van een trip
  const handleStartEdit = (trip) => {
    setEditTripId(trip.id);
    setEditTripTitle(trip.title);
    setEditTripDestination(trip.destination);
    setEditTripDate(new Date(trip.date).toISOString().split('T')[0]);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Functie om een trip bij te werken
  const handleUpdateTrip = async (e) => {
    e.preventDefault();
    
    if (!editTripTitle || !editTripDestination || !editTripDate) {
      alert('Vul alle velden in');
      return;
    }
    
    try {
      await updateTripInfo(editTripId, {
        title: editTripTitle,
        destination: editTripDestination,
        date: new Date(editTripDate).toISOString()
      });
      
      // Reset edit form
      setEditTripId(null);
      setEditTripTitle('');
      setEditTripDestination('');
      setEditTripDate('');
      setIsEditing(false);
    } catch (error) {
      console.error('Fout bij bijwerken trip:', error);
    }
  };

  // Functie om het bewerken te annuleren
  const handleCancelEdit = () => {
    setEditTripId(null);
    setEditTripTitle('');
    setEditTripDestination('');
    setEditTripDate('');
    setIsEditing(false);
  };

  // Functie om te beginnen met verwijderen van een trip
  const handleStartDelete = (tripId) => {
    setDeleteConfirmationId(tripId);
  };

  // Functie om verwijderen te bevestigen
  const handleConfirmDelete = async (tripId) => {
    try {
      await removeTrip(tripId);
      setDeleteConfirmationId(null);
    } catch (error) {
      console.error('Fout bij verwijderen trip:', error);
    }
  };

  // Functie om verwijderen te annuleren
  const handleCancelDelete = () => {
    setDeleteConfirmationId(null);
  };
  
  // Functie om een trip te selecteren
  const handleSelectTrip = (tripId) => {
    // Alleen selecteren als we niet bezig zijn met bewerken/verwijderen
    if (!isEditing && deleteConfirmationId === null) {
      loadTrip(tripId);
    }
  };
  
  // Formateer datum voor weergave
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMMM yyyy', { locale: nl });
    } catch (error) {
      return dateString;
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Laden...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-striksMarine">Ritten</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Lijst van ritten */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 text-striksMarine">Jouw ritten</h2>
        
        {trips.length === 0 ? (
          <p className="text-gray-500">Nog geen ritten. Maak een nieuwe rit aan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map(trip => (
              <div 
                key={trip.id}
                className={`border rounded-lg p-4 transition-all ${
                  currentTrip?.id === trip.id 
                    ? 'border-striksRose bg-striksLight' 
                    : 'border-gray-200 hover:border-striksTurquoise'
                }`}
              >
                <div onClick={() => handleSelectTrip(trip.id)} className="cursor-pointer">
                  <h3 className="font-bold text-lg text-striksMarine">{trip.title}</h3>
                  <p className="text-gray-600">{trip.destination}</p>
                  <p className="text-sm text-gray-500">{formatDate(trip.date)}</p>
                  
                  {currentTrip?.id === trip.id && (
                    <div className="mt-2 inline-block bg-striksRose bg-opacity-20 text-striksRose text-xs px-2 py-1 rounded">
                      Actief
                    </div>
                  )}
                </div>

                {/* Bewerk- en verwijderknoppen */}
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleStartEdit(trip)}
                    className="text-sm px-3 py-1 border border-striksMarine text-striksMarine rounded hover:bg-striksMarine hover:bg-opacity-10 transition-colors"
                    aria-label={`Bewerk rit ${trip.title}`}
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Bewerken
                    </span>
                  </button>
                  <button 
                    onClick={() => handleStartDelete(trip.id)}
                    className="text-sm px-3 py-1 border border-gray-300 text-gray-600 rounded hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                    aria-label={`Verwijder rit ${trip.title}`}
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
            ))}
          </div>
        )}
      </div>
      
      {/* Verwijder bevestiging als modal */}
      {deleteConfirmationId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Bevestig verwijderen</h3>
            <p className="text-sm text-gray-700 mb-4">
              Weet je zeker dat je deze rit wilt verwijderen?
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
      
      {/* Formulier voor bewerken van een rit */}
      {isEditing && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-striksTurquoise mb-6">
          <h2 className="text-xl font-semibold mb-3 text-striksMarine">Rit bewerken</h2>
          <form onSubmit={handleUpdateTrip} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titel</label>
              <input
                type="text"
                value={editTripTitle}
                onChange={e => setEditTripTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksRose focus:border-striksRose"
                placeholder="Rit naam"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Bestemming</label>
              <input
                type="text"
                value={editTripDestination}
                onChange={e => setEditTripDestination(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksRose focus:border-striksRose"
                placeholder="Bestemming"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Datum</label>
              <input
                type="date"
                value={editTripDate}
                onChange={e => setEditTripDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksRose focus:border-striksRose"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-striksMarine text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                Opslaan
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Formulier voor nieuwe rit */}
      <div className="bg-striksLight p-4 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-3 text-striksMarine">
          {isCreating ? 'Nieuwe rit aanmaken' : ''}
        </h2>
        
        {!isCreating ? (
          <button 
            onClick={() => {
              setIsCreating(true);
              setIsEditing(false);
            }}
            className="bg-striksMarine text-white px-4 py-2 rounded hover:bg-opacity-90"
          >
            Nieuwe rit
          </button>
        ) : (
          <form onSubmit={handleCreateTrip} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Titel</label>
              <input
                type="text"
                value={newTripTitle}
                onChange={e => setNewTripTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksRose focus:border-striksRose"
                placeholder="Rit naam"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Bestemming</label>
              <input
                type="text"
                value={newTripDestination}
                onChange={e => setNewTripDestination(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksRose focus:border-striksRose"
                placeholder="Bestemming"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Datum</label>
              <input
                type="date"
                value={newTripDate}
                onChange={e => setNewTripDate(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksRose focus:border-striksRose"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-striksMarine text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                Aanmaken
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Annuleren
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default TripsPage; 