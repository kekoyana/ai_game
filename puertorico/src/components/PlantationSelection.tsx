import React from 'react';
import { Plantation as PlantationType } from '../types/game';
import Plantation from './Plantation';

type PlantationSelectionProps = {
  availablePlantations: PlantationType[];
  onSelect: (plantation: PlantationType) => void;
  canSelectQuarry: boolean;
};

export const PlantationSelection: React.FC<PlantationSelectionProps> = ({
  availablePlantations,
  onSelect,
  canSelectQuarry
}) => {
  return (
    <div className="plantation-selection">
      <h3>利用可能なプランテーション</h3>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        padding: '10px',
        backgroundColor: '#E8F5E9',
        borderRadius: '5px',
        margin: '10px 0'
      }}>
        {availablePlantations.map((plantation, index) => (
          <div
            key={index}
            onClick={() => onSelect(plantation)}
            style={{ cursor: 'pointer' }}
          >
            <Plantation
              plantation={plantation}
              onColonistAdd={() => {}}
              onColonistRemove={() => {}}
            />
          </div>
        ))}
        {canSelectQuarry && (
          <div
            onClick={() => onSelect({
              type: 'quarry',
              colonists: 0,
              maxColonists: 1
            })}
            style={{ cursor: 'pointer' }}
          >
            <Plantation
              plantation={{
                type: 'quarry',
                colonists: 0,
                maxColonists: 1
              }}
              onColonistAdd={() => {}}
              onColonistRemove={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantationSelection;