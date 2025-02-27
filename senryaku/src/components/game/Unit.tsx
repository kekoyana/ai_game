export type UnitType = 'infantry' | 'tank' | 'artillery';
export type UnitSide = 'player' | 'enemy';

export interface UnitData {
  type: UnitType;
  side: UnitSide;
  x: number;
  y: number;
  hasActed: boolean;
}

interface UnitProps {
  unit: UnitData;
  size: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const unitSymbols: Record<UnitType, string> = {
  infantry: '歩',
  tank: '戦',
  artillery: '砲',
};

export const Unit: React.FC<UnitProps> = ({
  unit,
  size,
  isSelected = false,
  onClick,
}) => {
  const backgroundColor = unit.side === 'player' ? '#4169E1' : '#FF4500';
  const textColor = '#FFFFFF';

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: unit.x * size,
        top: unit.y * size,
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.5}px`,
        backgroundColor,
        color: textColor,
        border: isSelected ? '3px solid yellow' : '2px solid #FFFFFF',
        borderRadius: '50%',
        zIndex: 1,
        cursor: unit.side === 'player' && !unit.hasActed ? 'pointer' : 'default',
        fontWeight: 'bold',
        boxShadow: isSelected ? '0 0 10px yellow' : 'none',
        userSelect: 'none',
        opacity: unit.hasActed ? 0.6 : 1,
      }}
    >
      {unitSymbols[unit.type]}
    </div>
  );
};