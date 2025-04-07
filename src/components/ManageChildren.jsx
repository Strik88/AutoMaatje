import React, { useState } from 'react';
import { useRideContext } from '../context/RideContext';

function ManageChildren() {
  const { 
    heenreisData, 
    updateHeenreisData, 
    terugreisData, 
    updateTerugreisData,
    loadAllSavedChildren,
    addSavedChildrenToCurrentTrip
  } = useRideContext();
  
  const [newChild, setNewChild] = useState({
    name: ''
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingChildId, setEditingChildId] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  
  // Alle kinderen (vrije + toegewezen in auto's)
  const getAllChildren = () => {
    const assignedInHeenreis = heenreisData.cars.flatMap(car => car.assigned);
    return [...heenreisData.children, ...assignedInHeenreis];
  };
  
  // Handle toevoegen van nieuw kind
  const handleAddChild = async (e) => {
    e.preventDefault();
    
    if (!newChild.name) {
      alert('Vul een naam in');
      return;
    }
    
    // Nieuw kind maken met uniek ID
    const childId = Date.now();
    const newChildWithId = {
      ...newChild,
      id: childId
    };
    
    // Update beide ritten tegelijk met hetzelfde kind
    try {
      await updateHeenreisData({
        children: [...heenreisData.children, newChildWithId]
      });
      
      await updateTerugreisData({
        children: [...terugreisData.children, newChildWithId]
      });
      
      // Reset formulier
      setNewChild({
        name: ''
      });
      setIsAdding(false);
    } catch (error) {
      console.error('Fout bij toevoegen kind:', error);
    }
  };
  
  // Functie om meerdere kinderen in één keer toe te voegen (bulk import)
  const handleBulkImport = async (e) => {
    e.preventDefault();
    
    if (!bulkImportText.trim()) {
      alert('Voer de namen van kinderen in');
      return;
    }
    
    try {
      // Split op nieuwe regels en/of komma's
      const childNames = bulkImportText
        .split(/[\n,;]+/)
        .map(name => name.trim())
        .filter(name => name.length > 0);
      
      if (childNames.length === 0) {
        alert('Geen geldige namen gevonden');
        return;
      }
      
      // Maak nieuwe kinderen met unieke IDs
      const newChildren = childNames.map(name => ({
        name,
        id: Date.now() + Math.floor(Math.random() * 1000000)
      }));
      
      // Update beide ritten met de nieuwe kinderen
      await updateHeenreisData({
        children: [...heenreisData.children, ...newChildren]
      });
      
      await updateTerugreisData({
        children: [...terugreisData.children, ...newChildren]
      });
      
      // Reset formulier
      setBulkImportText('');
      setShowBulkImport(false);
      
      alert(`${newChildren.length} kinderen succesvol toegevoegd`);
    } catch (error) {
      console.error('Fout bij bulk importeren:', error);
      alert('Er is een fout opgetreden bij het importeren');
    }
  };
  
  // Handle wijzigen van een kind
  const handleUpdateChild = async (child) => {
    try {
      // Zoek waar het kind is in beide ritten (in auto of in pool)
      // 1. Update in heenreis pools
      if (heenreisData.children.some(c => c.id === child.id)) {
        const updatedChildren = heenreisData.children.map(c => 
          c.id === child.id ? { ...child } : c
        );
        
        await updateHeenreisData({
          children: updatedChildren
        });
      } 
      // 2. Update in heenreis auto's
      else {
        const updatedCars = heenreisData.cars.map(car => {
          if (car.assigned.some(c => c.id === child.id)) {
            return {
              ...car,
              assigned: car.assigned.map(c => 
                c.id === child.id ? { ...child } : c
              )
            };
          }
          return car;
        });
        
        await updateHeenreisData({
          cars: updatedCars
        });
      }
      
      // 3. Update in terugreis pools
      if (terugreisData.children.some(c => c.id === child.id)) {
        const updatedChildren = terugreisData.children.map(c => 
          c.id === child.id ? { ...child } : c
        );
        
        await updateTerugreisData({
          children: updatedChildren
        });
      } 
      // 4. Update in terugreis auto's
      else {
        const updatedCars = terugreisData.cars.map(car => {
          if (car.assigned.some(c => c.id === child.id)) {
            return {
              ...car,
              assigned: car.assigned.map(c => 
                c.id === child.id ? { ...child } : c
              )
            };
          }
          return car;
        });
        
        await updateTerugreisData({
          cars: updatedCars
        });
      }
      
      setEditingChildId(null);
    } catch (error) {
      console.error('Fout bij wijzigen kind:', error);
    }
  };
  
  // Functie om te beginnen met verwijderen van een kind
  const handleStartDelete = (childId) => {
    setDeleteConfirmationId(childId);
  };

  // Functie om verwijderen te bevestigen
  const handleConfirmDelete = async (childId) => {
    try {
      // Verwijder uit heenreis (uit pool of uit auto)
      if (heenreisData.children.some(c => c.id === childId)) {
        // Kind is in pool
        await updateHeenreisData({
          children: heenreisData.children.filter(c => c.id !== childId)
        });
      } else {
        // Kind is in een auto
        const updatedCars = heenreisData.cars.map(car => ({
          ...car,
          assigned: car.assigned.filter(c => c.id !== childId)
        }));
        
        await updateHeenreisData({
          cars: updatedCars
        });
      }
      
      // Verwijder uit terugreis (uit pool of uit auto)
      if (terugreisData.children.some(c => c.id === childId)) {
        // Kind is in pool
        await updateTerugreisData({
          children: terugreisData.children.filter(c => c.id !== childId)
        });
      } else {
        // Kind is in een auto
        const updatedCars = terugreisData.cars.map(car => ({
          ...car,
          assigned: car.assigned.filter(c => c.id !== childId)
        }));
        
        await updateTerugreisData({
          cars: updatedCars
        });
      }
      setDeleteConfirmationId(null);
    } catch (error) {
      console.error('Fout bij verwijderen kind:', error);
    }
  };

  // Functie om verwijderen te annuleren
  const handleCancelDelete = () => {
    setDeleteConfirmationId(null);
  };
  
  // Handle het importeren van eerder gebruikte kinderen
  const handleImportSavedChildren = async () => {
    try {
      await addSavedChildrenToCurrentTrip();
    } catch (error) {
      console.error('Fout bij importeren opgeslagen kinderen:', error);
      alert('Er is een fout opgetreden bij het importeren van opgeslagen kinderen');
    }
  };
  
  // Functie om de rijtoewijzing van een kind op te halen
  const getRideAssignment = (child, rideType) => {
    const rideData = rideType === 'heenreis' ? heenreisData : terugreisData;
    
    // Controleer of het kind in de vrije pool zit
    if (rideData.children.some(c => c.id === child.id)) {
      return "Vrij";
    }
    
    // Zoek in welke auto het kind zit
    for (const car of rideData.cars) {
      if (car.assigned.some(c => c.id === child.id)) {
        return `Auto: ${car.driver}`;
      }
    }
    
    return "Onbekend";
  };

  // Functie om een kind te bewerken
  const handleEdit = (child) => {
    setEditingChildId(child.id);
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-striksMarine">Kinderen beheren</h2>
      
      {/* Importeer eerder gebruikte kinderen */}
      <div className="mb-6">
        <button 
          onClick={handleImportSavedChildren}
          className="bg-striksTurquoise text-white px-4 py-2 rounded mb-4 hover:bg-opacity-90"
        >
          Importeer eerder gebruikte kinderen
        </button>
      </div>
      
      {/* Knoppen voor toevoegen */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => {
            setIsAdding(true);
            setShowBulkImport(false);
          }}
          className="bg-striksMarine text-white px-4 py-2 rounded hover:bg-opacity-90"
        >
          Kind toevoegen
        </button>
        <button 
          onClick={() => {
            setShowBulkImport(true);
            setIsAdding(false);
          }}
          className="bg-striksMarine text-white px-4 py-2 rounded hover:bg-opacity-90"
        >
          Groep kinderen toevoegen
        </button>
      </div>
      
      {/* Formulier voor nieuw kind */}
      {isAdding && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-3">Nieuw kind toevoegen</h3>
          <form onSubmit={handleAddChild} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Naam</label>
              <input
                type="text"
                value={newChild.name}
                onChange={e => setNewChild({...newChild, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                placeholder="Naam van het kind"
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
      
      {/* Formulier voor bulk import */}
      {showBulkImport && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-3">Groep kinderen toevoegen</h3>
          <form onSubmit={handleBulkImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Namen (één per regel, of gescheiden door komma's)</label>
              <textarea
                value={bulkImportText}
                onChange={e => setBulkImportText(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine h-32"
                placeholder="Jan Jansen&#10;Piet Pietersen&#10;Marie Mariesen"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-striksMarine text-white px-4 py-2 rounded hover:bg-opacity-90"
              >
                Importeren
              </button>
              <button
                type="button"
                onClick={() => setShowBulkImport(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Lijst van kinderen */}
      <h3 className="text-lg font-semibold mb-3 text-striksMarine">Alle kinderen</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {getAllChildren().map(child => (
          <div key={child.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">{child.name}</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p><span className="font-medium">Heenreis:</span> {getRideAssignment(child, 'heenreis')}</p>
                  <p><span className="font-medium">Terugreis:</span> {getRideAssignment(child, 'terugreis')}</p>
                </div>
              </div>
              <div className="space-x-2">
                <button 
                  onClick={() => handleEdit(child)}
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
                  onClick={() => handleStartDelete(child.id)}
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
              Weet je zeker dat je dit kind wilt verwijderen?
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
      
      {/* Edit modal */}
      {editingChildId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Kind bewerken</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const childToUpdate = getAllChildren().find(c => c.id === editingChildId);
                if (childToUpdate) {
                  handleUpdateChild(childToUpdate);
                }
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Naam</label>
                <input
                  type="text"
                  value={getAllChildren().find(c => c.id === editingChildId)?.name || ''}
                  onChange={e => {
                    const updatedChild = {
                      ...getAllChildren().find(c => c.id === editingChildId),
                      name: e.target.value
                    };
                    handleUpdateChild(updatedChild);
                  }}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-striksMarine focus:border-striksMarine"
                  placeholder="Naam van het kind"
                  required
                />
              </div>
              
              <div className="flex space-x-3 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingChildId(null)}
                  className="text-sm px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageChildren; 