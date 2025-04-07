import React, { useState } from 'react';

function ManageChildren() {
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  const handleStartDelete = (childId) => {
    setDeleteConfirmationId(childId);
  };

  const handleConfirmDelete = (childId) => {
    removeChild(childId);
    setDeleteConfirmationId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationId(null);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {children.map(child => (
          <div key={child.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
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
    </div>
  );
}

export default ManageChildren; 