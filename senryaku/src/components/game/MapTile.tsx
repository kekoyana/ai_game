export type TerrainType = 'plain' | 'mountain' | 'forest' | 'water' | 'city' | 'capital';

interface MapTileProps {
  x: number;
  y: number;
  size: number;
  terrain: TerrainType;
  isMovable?: boolean;
  owner?: 'player' | 'enemy' | null;
  onClick?: () => void;
}

const terrainColors: Record<TerrainType, string> = {
  plain: '#90EE90',    // 薄緑
  mountain: '#A0522D', // 茶色
  forest: '#228B22',   // 濃い緑
  water: '#4169E1',    // 青
  city: '#FFD700',     // 金色
  capital: '#FF0000',  // 赤
};

const terrainSymbols: Record<TerrainType, string> = {
  plain: '',
  mountain: '▲',
  forest: '🌲',
  water: '',
  city: '🏰',
  capital: '👑',
};

export const MapTile: React.FC<MapTileProps> = ({
  x,
  y,
  size,
  terrain,
  isMovable = false,
  owner = null,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: x * size,
        top: y * size,
        width: size,
        height: size,
        border: isMovable ? '2px solid yellow' : '1px solid #444',
        backgroundColor: terrainColors[terrain],
        cursor: isMovable ? 'pointer' : 'default',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${size * 0.6}px`,
      }}
    >
      {terrainSymbols[terrain]}
      {(terrain === 'city' || terrain === 'capital') && owner && (
        <div
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: owner === 'player' ? '#0000FF' : '#FF0000',
          }}
        />
      )}
    </div>
  );
};