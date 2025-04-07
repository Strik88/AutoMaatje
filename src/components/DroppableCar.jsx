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

  // Bereken de bezettingsstatus van de auto
  const usedCapacity = car.assigned.length;
  const totalCapacity = car.capacity;
  const isFull = usedCapacity >= totalCapacity;
  const isNearlyFull = usedCapacity >= totalCapacity - 1;
  
  // Bepaal de kleur op basis van bezetting
  let statusColorClass = 'bg-green-100 border-green-200';
  let textColorClass = 'text-green-700';
  
  if (isFull) {
    statusColorClass = 'bg-red-100 border-red-200';
    textColorClass = 'text-red-700';
  } else if (isNearlyFull) {
    statusColorClass = 'bg-yellow-100 border-yellow-200';
    textColorClass = 'text-yellow-700';
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4 border-l-4 border-striksTurquoise">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-striksMarine">{car.driver}</h3>
        <div className={`px-2 py-1 rounded-full text-sm font-medium ${statusColorClass} ${textColorClass}`}>
          {usedCapacity}/{totalCapacity} plaatsen
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`min-h-[120px] bg-gray-50 rounded-lg p-3 transition-all
          ${isOver ? 'bg-striksLight ring-2 ring-striksTurquoise' : 'border border-gray-200'} 
          ${isFull ? 'opacity-70' : 'hover:border-striksTurquoise'}`}
      >
        {car.assigned.length === 0 ? (
          <p className="text-gray-400 text-sm flex items-center justify-center h-full">
            <span>Sleep kinderen hierheen</span>
          </p>
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