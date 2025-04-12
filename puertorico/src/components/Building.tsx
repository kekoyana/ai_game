import React from 'react';
import { type Building as BuildingType, BUILDING_DETAILS } from '../types/game';

type BuildingProps = {
  building: BuildingType;
  onColonistAdd?: () => void;
  onColonistRemove?: () => void;
};

const buildingColors = {
  // 生産施設（紫）
  smallIndigoPlant: '#9370DB',
  indigoPlant: '#9370DB',
  smallSugarMill: '#9370DB',
  sugarMill: '#9370DB',
  tobaccoStorage: '#9370DB',
  coffeeRoaster: '#9370DB',
  
  // 特殊建物（緑）
  hacienda: '#228B22',
  constructionHut: '#228B22',
  hospice: '#228B22',
  office: '#228B22',
  university: '#228B22',
  harbor: '#228B22',
  wharf: '#228B22',
  
  // 商業施設（黄）
  smallMarket: '#DAA520',
  largeMarket: '#DAA520',
  
  // 倉庫（茶）
  smallWarehouse: '#8B4513',
  largeWarehouse: '#8B4513',
  
  // 工場（赤）
  factory: '#B22222',
  
  // 記念建造物（金）
  guildHall: '#FFD700',
  residence: '#FFD700',
  fortress: '#FFD700',
  customsHouse: '#FFD700',
  cityHall: '#FFD700'
};

export const Building: React.FC<BuildingProps> = ({
  building,
  onColonistAdd,
  onColonistRemove
}) => {
  const details = BUILDING_DETAILS[building.type];
  const backgroundColor = buildingColors[building.type];

  return (
    <div
      className="building"
      style={{
        width: '120px',
        height: '160px',
        backgroundColor,
        color: '#FFF',
        border: '2px solid #000',
        borderRadius: '5px',
        padding: '5px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        margin: '5px',
        cursor: building.colonists < building.maxColonists ? 'pointer' : 'default'
      }}
      onClick={onColonistAdd}
    >
      <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
        {details.name}
      </div>

      <div style={{ fontSize: '12px', textAlign: 'center' }}>
        コスト: {details.cost}
        <br />
        勝利点: {details.victoryPoints}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        gap: '5px',
        flexWrap: 'wrap'
      }}>
        {Array.from({ length: building.maxColonists }).map((_, index) => (
          <div
            key={index}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '2px solid',
              borderColor: index < building.colonists ? '#FFD700' : '#666',
              backgroundColor: index < building.colonists ? '#FFA500' : 'transparent',
              cursor: index < building.colonists ? 'pointer' : 'default'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (index < building.colonists && onColonistRemove) {
                onColonistRemove();
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Building;