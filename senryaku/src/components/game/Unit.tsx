export type UnitType = 'infantry' | 'tank' | 'artillery';
export type UnitSide = 'player' | 'enemy';

export interface UnitData {
  type: UnitType;
  side: UnitSide;
  x: number;
  y: number;
  hasActed: boolean;
  hp: number;
  maxHp: number;
}

interface UnitProps {
  unit: UnitData;
  size: number;
  isSelected?: boolean;
  isTargetable?: boolean;
  onClick?: () => void;
}

const unitSymbols: Record<UnitType, string> = {
  infantry: '歩',
  tank: '戦',
  artillery: '砲',
};

// ユニットタイプごとの初期HP
export const unitInitialStats: Record<UnitType, { hp: number, attack: number, range: number }> = {
  infantry: { hp: 100, attack: 30, range: 1 },
  tank: { hp: 150, attack: 50, range: 1 },
  artillery: { hp: 80, attack: 40, range: 3 },
};

export const Unit: React.FC<UnitProps> = ({
  unit,
  size,
  isSelected = false,
  isTargetable = false,
  onClick,
}) => {
  const backgroundColor = unit.side === 'player' ? '#4169E1' : '#FF4500';
  const textColor = '#FFFFFF';

  // HPバーの色を計算
  const hpPercentage = (unit.hp / unit.maxHp) * 100;
  const hpColor = hpPercentage > 50 ? '#00FF00' : hpPercentage > 25 ? '#FFFF00' : '#FF0000';

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: unit.x * size,
        top: unit.y * size,
        width: size,
        height: size,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.5}px`,
          backgroundColor,
          color: textColor,
          border: isSelected ? '3px solid yellow' : 
                 isTargetable ? '3px solid red' : 
                 '2px solid #FFFFFF',
          borderRadius: '50%',
          zIndex: 1,
          cursor: (unit.side === 'player' && !unit.hasActed) || isTargetable ? 'pointer' : 'default',
          fontWeight: 'bold',
          boxShadow: isSelected ? '0 0 10px yellow' : 
                    isTargetable ? '0 0 10px red' : 
                    'none',
          opacity: unit.hasActed ? 0.6 : 1,
        }}
      >
        {unitSymbols[unit.type]}
      </div>
      {/* HPバー */}
      <div
        style={{
          position: 'absolute',
          bottom: '2px',
          left: '10%',
          width: '80%',
          height: '3px',
          backgroundColor: '#333',
          borderRadius: '2px',
        }}
      >
        <div
          style={{
            width: `${hpPercentage}%`,
            height: '100%',
            backgroundColor: hpColor,
            borderRadius: '2px',
            transition: 'width 0.3s ease-out',
          }}
        />
      </div>
    </div>
  );
};