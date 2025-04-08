import React from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import DraggableChild from '../components/DraggableChild';
import DroppableCar from '../components/DroppableCar';
import { useRideContext } from '../context/RideContext';
import { FiX } from 'react-icons/fi';
import { FaCarSide } from 'react-icons/fa';

function TerugreisPage() {
  // Gebruik de ride context
  const { 
    terugreisData, 
    assignChildToCarTerugreis, 
    removeChildFromCarTerugreis,
    updateTerugreisData
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
      const childInCar = terugreisData.cars
        .find(car => car.id === sourceCarId)
        .assigned.find(child => child.id === childId);
      
      if (childInCar) {
        // Eerst het kind verwijderen uit de huidige auto
        const updatedCars = terugreisData.cars.map(car => {
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
        updateTerugreisData({ cars: updatedCars });
        return;
      }
    }
    
    // Standaard gedrag voor nieuwe toewijzing
    assignChildToCarTerugreis(childId, carId);
  };
  
  // Hulpfunctie om te bepalen in welke auto een kind zit
  const getSourceCarId = (childId) => {
    for (const car of terugreisData.cars) {
      if (car.assigned.some(child => child.id === childId)) {
        return car.id;
      }
    }
    return null;
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="container mx-auto px-4">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-striksMarine">Terugreis Indeling</h1>
        
        <div className="flex flex-col md:flex-row md:gap-6">
          {/* Beschikbare kinderen */}
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <div className="bg-white p-4 rounded-lg shadow-md h-full border-t-4 border-striksRose">
              <h2 className="text-lg font-semibold mb-4 text-striksMarine">In te delen kinderen</h2>
              <div className="space-y-1">
                {terugreisData.children.map(child => (
                  <DraggableChild 
                    key={child.id} 
                    child={child}
                    id={`child-${child.id}`}
                  />
                ))}
                
                {terugreisData.children.length === 0 && (
                  <p className="text-gray-400 text-sm py-2 text-center">Alle kinderen zijn ingedeeld</p>
                )}
              </div>
            </div>
          </div>

          {/* Auto's */}
          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {terugreisData.cars.map(car => (
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
                        onClick={() => removeChildFromCarTerugreis(child.id, car.id)}
                        className="text-red-500 hover:text-red-700 text-lg px-1"
                        aria-label="Verwijder kind uit auto"
                      >
                        <FiX size={20} />
                      </button>
                    </DraggableChild>
                  ))}
                </DroppableCar>
              ))}
            </div>
            
            {/* Instructie voor gebruikers */}
            <div className="mt-4 bg-striksMarine bg-opacity-5 p-3 rounded-md border border-striksMarine border-opacity-20 text-sm">
              <p className="text-striksMarine">
                <strong>Tip:</strong> Sleep een kind naar een auto om deze toe te wijzen. Klik op het kruisje om een kind te verwijderen.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export default TerugreisPage; 