import React from 'react';

function KindItem({ kindData }) {
  // TODO: Implement KindItem component logic and styling
  // TODO: Add drag-and-drop source logic
  return (
    <div className="border p-2 rounded bg-gray-100 mb-2 cursor-grab">
      {kindData?.naam || 'Onbekend Kind'}
    </div>
  );
}

export default KindItem;
