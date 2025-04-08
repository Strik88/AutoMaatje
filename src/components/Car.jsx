import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';
import { Card, CardContent, CardActions, Typography, IconButton, Tooltip } from '@mui/material';
import DraggableChild from './DraggableChild';

const Car = ({ 
  car, 
  activeChildId = null,
  onEdit, 
  onDelete, 
  onEditChild, 
  onDeleteChild 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: car.id
  });
  
  // Bereken bezettingspercentage
  const occupancyPercentage = car.assigned ? (car.assigned.length / car.capacity) * 100 : 0;
  
  // Bepaal kleur op basis van bezetting
  const getOccupancyColor = () => {
    if (occupancyPercentage === 0) return 'bg-gray-100'; // Leeg
    if (occupancyPercentage < 50) return 'bg-green-100'; // Minder dan helft
    if (occupancyPercentage < 100) return 'bg-yellow-100'; // Meer dan helft
    return 'bg-red-100'; // Vol
  };

  // Occupancy indicator style
  const occupancyIndicatorStyle = {
    width: `${occupancyPercentage}%`,
    transition: 'width 0.3s ease'
  };

  return (
    <Card 
      ref={setNodeRef}
      className={`${isOver && car.assigned.length < car.capacity ? 'border-2 border-blue-400' : ''}`}
      data-testid={`car-${car.id}`}
    >
      <CardContent className="pb-1">
        <div className="flex justify-between items-center mb-2">
          <Typography variant="h6" component="h3">
            {car.driver}
          </Typography>
          <div className="flex items-center">
            <Tooltip title={`${car.assigned.length}/${car.capacity} kinderen`}>
              <div className="bg-gray-100 px-2 py-1 rounded-md flex items-center mr-2">
                <FiUsers className="mr-1" />
                <span>{car.assigned.length}/{car.capacity}</span>
              </div>
            </Tooltip>
          </div>
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full mb-3">
          <div 
            className={`h-2 rounded-full ${
              occupancyPercentage === 100 
                ? 'bg-red-500' 
                : occupancyPercentage >= 75 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`} 
            style={occupancyIndicatorStyle}
          ></div>
        </div>
        
        <div className={`min-h-20 p-2 rounded-md ${getOccupancyColor()} ${isOver ? 'ring-2 ring-blue-400' : ''}`}>
          {car.assigned && car.assigned.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {car.assigned.map(child => (
                <DraggableChild
                  key={child.id}
                  child={child}
                  isActive={activeChildId === child.id}
                  onEdit={() => onEditChild(child)}
                  onDelete={() => onDeleteChild(child.id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-2">Sleep kinderen hierheen</p>
          )}
        </div>
      </CardContent>
      
      <CardActions className="px-4 pb-3">
        <IconButton 
          size="small" 
          color="primary" 
          onClick={onEdit}
        >
          <FiEdit2 />
        </IconButton>
        <IconButton 
          size="small" 
          color="error" 
          onClick={onDelete}
        >
          <FiTrash2 />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default Car; 