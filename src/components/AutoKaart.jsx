import React from 'react';

function AutoKaart({ autoData }) {
  // TODO: Implement AutoKaart component logic and styling
  return (
    <div className="border p-4 rounded shadow mb-4">
      <h3 className="font-bold">Auto: {autoData?.naamOuder || 'Onbekend'}</h3>
      <p>Vrije Plaatsen: {autoData?.vrijePlaatsen ?? 'N/A'}</p>
      <div>
        <h4>Kinderen:</h4>
        {/* TODO: Render KindItem components for assigned children */}
        <ul>
          {autoData?.kinderen?.map(kind => <li key={kind.id}>{kind.naam}</li>) || <li>Nog geen kinderen</li>}
        </ul>
      </div>
      {/* TODO: Add drag-and-drop target logic */}
    </div>
  );
}

export default AutoKaart; 