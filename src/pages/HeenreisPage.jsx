import React from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import DraggableChild from '../components/DraggableChild';
import DroppableCar from '../components/DroppableCar';
import { useRideContext } from '../context/RideContext';

function HeenreisPage() {
  // Gebruik de ride context
  const { 
    heenreisData, 
    assignChildToCarHeenreis, 
    removeChildFromCarHeenreis,
    updateHeenreisData
  } = useRideContext();

  // Configureer sensors voor drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px beweging voordat drag start
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms vertraging voor touch devices
        tolerance: 8, // 8px tolerantie
      },
    })
  );

  // Handle DnD Events
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Haal IDs op
    const childId = parseInt(active.id.toString().replace('child-', ''));
    const carId = parseInt(over.id.toString().replace('car-', ''));
    
    // Controleren of het kind al is toegewezen aan een auto
    const sourceCarId = getSourceCarId(childId);
    
    // Als het kind al was toegewezen aan een auto
    if (sourceCarId !== null) {
      // Als het dezelfde auto is, niets doen
      if (sourceCarId === carId) return;
      
      // Voor een direct overzetting tussen auto's
      const childInCar = heenreisData.cars
        .find(car => car.id === sourceCarId)
        .assigned.find(child => child.id === childId);
      
      if (childInCar) {
        // Eerst het kind verwijderen uit de huidige auto
        const updatedCars = heenreisData.cars.map(car => {
          if (car.id === sourceCarId) {
            return {
              ...car,
              assigned: car.assigned.filter(c => c.id !== childId)
            };
          } else if (car.id === carId) {
            // Direct toevoegen aan de nieuwe auto
            return {
              ...car,
              assigned: [...car.assigned, childInCar]
            };
          }
          return car;
        });
        
        // Update state via context
        updateHeenreisData({ cars: updatedCars });
        return;
      }
    }
    
    // Standaard gedrag voor nieuwe toewijzing
    assignChildToCarHeenreis(childId, carId);
  };
  
  // Hulpfunctie om te bepalen in welke auto een kind zit
  const getSourceCarId = (childId) => {
    for (const car of heenreisData.cars) {
      if (car.assigned.some(child => child.id === childId)) {
        return car.id;
      }
    }
    return null;
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Heenreis Indeling</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Beschikbare kinderen */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Beschikbare Kinderen</h2>
            <div className="space-y-2">
              {heenreisData.children.map(child => (
                <DraggableChild 
                  key={child.id} 
                  child={child}
                  id={`child-${child.id}`}
                />
              ))}
              
              {heenreisData.children.length === 0 && (
                <p className="text-gray-400 text-sm">Alle kinderen zijn ingedeeld</p>
              )}
            </div>
          </div>

          {/* Auto's */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heenreisData.cars.map(car => (
                <DroppableCar 
                  key={car.id} 
                  car={car}
                >
                  {car.assigned.map(child => (
                    <DraggableChild
                      key={child.id}
                      child={child}
                      id={`child-${child.id}`}
                    >
                      <button 
                        onClick={() => removeChildFromCarHeenreis(child.id, car.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        &times;
                      </button>
                    </DraggableChild>
                  ))}
                </DroppableCar>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export default HeenreisPage; 