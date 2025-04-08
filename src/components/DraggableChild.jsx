import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IconButton } from '@mui/material';

const DraggableChild = ({ 
  child, 
  isActive = false,
  onEdit,
  onDelete
}) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: child.id,
    data: {
      child
    }
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      {...listeners} 
      {...attributes}
      className={`
        flex justify-between items-center 
        p-2 rounded bg-white shadow-sm border 
        cursor-grab active:cursor-grabbing 
        ${isActive ? 'ring-2 ring-blue-500 shadow-md' : ''}
      `}
      data-testid={`draggable-child-${child.id}`}
    >
      <span className="truncate">{child.name}</span>
      <div className="flex">
        <IconButton 
          size="small" 
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit();
          }}
          className="p-1"
        >
          <FiEdit2 size={14} />
        </IconButton>
        <IconButton 
          size="small" 
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            onDelete && onDelete();
          }}
          className="p-1"
        >
          <FiTrash2 size={14} />
        </IconButton>
      </div>
    </div>
  );
};

export default DraggableChild; 