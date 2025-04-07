import React from 'react';
import ManageCars from '../components/ManageCars';
import ManageChildren from '../components/ManageChildren';
import { useRideContext } from '../context/RideContext';

function ManagePage() {
  const { currentTrip, loading, error } = useRideContext();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-striksMarine rounded-full"></div>
          <div className="h-3 w-3 bg-striksMarine rounded-full"></div>
          <div className="h-3 w-3 bg-striksMarine rounded-full"></div>
        </div>
      </div>
    );
  }
  
  if (!currentTrip) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 px-4 py-3 rounded shadow-md mb-4">
          <p className="text-sm md:text-base">Selecteer eerst een rit om te beheren op de Ritten pagina.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-striksMarine">Beheren: {currentTrip.title}</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-md mb-4">
          <p className="text-sm md:text-base">{error}</p>
        </div>
      )}
      
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-striksTurquoise">
          <ManageCars />
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-t-4 border-striksRose">
          <ManageChildren />
        </div>
      </div>
      
      {/* Instructie voor gebruikers */}
      <div className="mt-6 bg-striksMarine bg-opacity-5 p-3 rounded-md border border-striksMarine border-opacity-20 text-sm">
        <p className="text-striksMarine">
          <strong>Tip:</strong> Hier kunt u auto's en kinderen toevoegen, bewerken en verwijderen. De wijzigingen worden automatisch toegepast op de heen- en terugreis pagina's.
        </p>
      </div>
    </div>
  );
}

export default ManagePage; 