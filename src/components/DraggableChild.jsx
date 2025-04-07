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
      className={`p-2.5 my-1.5 bg-gray-100 rounded-lg border border-gray-200 cursor-move 
        ${isDragging ? 'ring-2 ring-striksRose shadow-md' : ''} 
        flex justify-between items-center
        touch-manipulation select-none active:scale-[0.98] transition-all
        hover:bg-striksLight hover:border-striksTurquoise`}
      {...listeners}
      {...attributes}
    >
      <span className="text-striksMarine font-medium">{child.name}</span>
      {children}
    </div>
  );
}

export default DraggableChild; 