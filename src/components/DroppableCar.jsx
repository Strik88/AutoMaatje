import React from 'react';
import { useDroppable } from '@dnd-kit/core';

function DroppableCar({ car, children }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `car-${car.id}`,
    data: {
      type: 'car',
      car
    }
  });

  return (
    <div
      className="bg-white p-4 rounded-lg shadow"
    >
      <h3 className="font-semibold">{car.driver}</h3>
      <p className="text-sm text-gray-600 mb-2">
        Beschikbare plaatsen: {car.capacity - car.assigned.length}
      </p>
      <div 
        ref={setNodeRef}
        className={`min-h-[100px] bg-gray-50 rounded p-2 transition-colors ${isOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : ''}`}
      >
        {car.assigned.length === 0 ? (
          <p className="text-gray-400 text-sm">Sleep kinderen hierheen</p>
        ) : (
          <div className="space-y-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

export default DroppableCar; 