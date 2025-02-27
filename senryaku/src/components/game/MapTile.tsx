export type TerrainType = 'plain' | 'mountain' | 'forest' | 'water';

interface MapTileProps {
  x: number;
  y: number;
  size: number;
  terrain: TerrainType;
  isMovable?: boolean;
  onClick?: () => void;
}

const terrainColors: Record<TerrainType, string> = {
  plain: '#90EE90',    // 薄緑
  mountain: '#A0522D', // 茶色
  forest: '#228B22',   // 濃い緑
  water: '#4169E1',    // 青
};

export const MapTile: React.FC<MapTileProps> = ({
  x,
  y,
  size,
  terrain,
  isMovable = false,
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
      }}
    >
      {terrain === 'mountain' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `${size * 0.6}px`,
          userSelect: 'none',
        }}>
          ▲
        </div>
      )}
      {terrain === 'forest' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: `${size * 0.6}px`,
          userSelect: 'none',
        }}>
          🌲
        </div>
      )}
    </div>
  );
};