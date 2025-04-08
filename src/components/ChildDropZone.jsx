import React from 'react';
import { useDroppable } from '@dnd-kit/core';

const ChildDropZone = ({ id, children, className }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`${className || ''} ${isOver ? 'bg-blue-50 border-blue-400' : ''}`}
      data-testid={`dropzone-${id}`}
    >
      {children}
    </div>
  );
};

export default ChildDropZone; 