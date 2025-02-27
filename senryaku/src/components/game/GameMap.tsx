import { MapTile, TerrainType } from './MapTile';

interface GameMapProps {
  width: number;  // マップの横幅（タイル数）
  height: number; // マップの縦幅（タイル数）
  tileSize: number; // タイルの大きさ（ピクセル）
}

const generateTerrain = (x: number, y: number): TerrainType => {
  const random = Math.random();
  
  // 周辺部は水で囲む
  if (x === 0 || y === 0 || x === 19 || y === 14) {
    return 'water';
  }

  if (random < 0.1) {
    return 'mountain';
  } else if (random < 0.3) {
    return 'forest';
  } else if (random < 0.35) {
    return 'water';
  } else {
    return 'plain';
  }
};

export const GameMap: React.FC<GameMapProps> = ({ width, height, tileSize }) => {
  const tiles = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push(
        <MapTile
          key={`${x}-${y}`}
          x={x}
          y={y}
          size={tileSize}
          terrain={generateTerrain(x, y)}
        />
      );
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: width * tileSize,
          height: height * tileSize,
        }}
      >
        {tiles}
      </div>
    </div>
  );
};