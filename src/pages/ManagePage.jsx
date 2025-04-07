import React from 'react';
import ManageCars from '../components/ManageCars';
import ManageChildren from '../components/ManageChildren';
import { useRideContext } from '../context/RideContext';

function ManagePage() {
  const { currentTrip, loading, error } = useRideContext();
  
  if (loading) {
    return <div className="text-center py-8">Laden...</div>;
  }
  
  if (!currentTrip) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Selecteer eerst een rit om te beheren op de Ritten pagina.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Beheren: {currentTrip.title}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ManageCars />
        <ManageChildren />
      </div>
    </div>
  );
}

export default ManagePage; 