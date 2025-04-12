import React from 'react';
import { Building as BuildingComponent } from './Building';
import { type BuildingType, BUILDING_DETAILS } from '../types/game';

type BuildingSelectionProps = {
  onSelect: (buildingType: BuildingType) => void;
  availableMoney: number;
  hasConstructionHut: boolean;
  onClose: () => void;
};

export const BuildingSelection: React.FC<BuildingSelectionProps> = ({
  onSelect,
  availableMoney,
  hasConstructionHut,
  onClose
}) => {
  const buildingTypes = Object.keys(BUILDING_DETAILS) as BuildingType[];

  const getBuildingCost = (buildingType: BuildingType): number => {
    const cost = BUILDING_DETAILS[buildingType].cost;
    if (hasConstructionHut) {
      return Math.max(0, cost - 1);
    }
    return cost;
  };

  const canAfford = (buildingType: BuildingType): boolean => {
    return getBuildingCost(buildingType) <= availableMoney;
  };

  return (
    <div className="building-selection">
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>建物を選択</h3>
        <button
          onClick={onClose}
          style={{
            padding: '5px 10px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#ff4444',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          閉じる
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '10px',
        maxHeight: '500px',
        overflowY: 'auto',
        padding: '10px'
      }}>
        {buildingTypes.map(buildingType => {
          const details = BUILDING_DETAILS[buildingType];
          const cost = getBuildingCost(buildingType);
          const affordable = canAfford(buildingType);

          return (
            <div
              key={buildingType}
              onClick={() => affordable && onSelect(buildingType)}
              style={{
                cursor: affordable ? 'pointer' : 'not-allowed',
                opacity: affordable ? 1 : 0.5
              }}
            >
              <BuildingComponent
                building={{
                  type: buildingType,
                  colonists: 0,
                  maxColonists: details.maxColonists,
                  victoryPoints: details.victoryPoints
                }}
                onColonistAdd={() => {}}
                onColonistRemove={() => {}}
              />
              <div style={{ 
                textAlign: 'center',
                marginTop: '5px',
                fontSize: '12px'
              }}>
                コスト: {cost} ドブロン
                {hasConstructionHut && cost < details.cost && ' (割引適用)'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BuildingSelection;