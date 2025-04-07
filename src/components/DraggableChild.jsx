import React from 'react';
import { useDraggable } from '@dnd-kit/core';

function DraggableChild({ child, id, children }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id || `child-${child.id}`,
    data: {
      type: 'child',
      child
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-2 bg-gray-100 rounded border border-gray-200 cursor-move ${isDragging ? 'ring-2 ring-indigo-400' : ''} flex justify-between items-center`}
      {...listeners}
      {...attributes}
    >
      <span>{child.name}</span>
      {children}
    </div>
  );
}

export default DraggableChild; 