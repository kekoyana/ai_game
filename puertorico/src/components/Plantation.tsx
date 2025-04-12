import React from 'react';
import { type Plantation as PlantationType, PLANTATION_DETAILS } from '../types/game';

type PlantationProps = {
  plantation: PlantationType;
  onColonistAdd?: () => void;
  onColonistRemove?: () => void;
};

const plantationColors = {
  corn: '#FFD700',    // 黄色
  indigo: '#4B0082',  // インディゴ
  sugar: '#FFFFFF',   // 白
  tobacco: '#8B4513', // 茶色
  coffee: '#3C2312',  // 濃い茶色
  quarry: '#808080'   // グレー
};

export const Plantation: React.FC<PlantationProps> = ({
  plantation,
  onColonistAdd,
  onColonistRemove
}) => {
  const details = PLANTATION_DETAILS[plantation.type];
  const backgroundColor = plantationColors[plantation.type];
  const textColor = ['corn', 'sugar'].includes(plantation.type) ? '#000' : '#FFF';

  return (
    <div
      className="plantation"
      style={{
        width: '80px',
        height: '120px',
        backgroundColor,
        color: textColor,
        border: '2px solid #000',
        borderRadius: '5px',
        padding: '5px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        margin: '5px',
        cursor: plantation.colonists < plantation.maxColonists ? 'pointer' : 'default'
      }}
      onClick={onColonistAdd}
    >
      <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
        {details.name}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        gap: '5px',
        flexWrap: 'wrap'
      }}>
        {Array.from({ length: plantation.maxColonists }).map((_, index) => (
          <div
            key={index}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '2px solid',
              borderColor: index < plantation.colonists ? '#FFD700' : '#666',
              backgroundColor: index < plantation.colonists ? '#FFA500' : 'transparent',
              cursor: index < plantation.colonists ? 'pointer' : 'default'
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (index < plantation.colonists && onColonistRemove) {
                onColonistRemove();
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Plantation;