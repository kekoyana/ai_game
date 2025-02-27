import { useState, useCallback, useMemo, useEffect } from 'react';
import { MapTile, TerrainType } from './MapTile';
import { Unit, UnitData, UnitType, UnitSide } from './Unit';

interface GameMapProps {
  width: number;
  height: number;
  tileSize: number;
}

// 地形生成関数
const createInitialTerrain = (width: number, height: number): TerrainType[][] => {
  const terrain: TerrainType[][] = [];
  
  for (let y = 0; y < height; y++) {
    terrain[y] = [];
    for (let x = 0; x < width; x++) {
      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        terrain[y][x] = 'water';
        continue;
      }

      const random = Math.random();
      if (random < 0.1) {
        terrain[y][x] = 'mountain';
      } else if (random < 0.3) {
        terrain[y][x] = 'forest';
      } else if (random < 0.35) {
        terrain[y][x] = 'water';
      } else {
        terrain[y][x] = 'plain';
      }
    }
  }
  
  return terrain;
};

// 初期ユニット生成関数
const generateInitialUnits = (width: number, height: number): UnitData[] => {
  const units: UnitData[] = [];
  const unitTypes: UnitType[] = ['infantry', 'tank', 'artillery'];

  // プレイヤーのユニットを配置（下部）
  for (let i = 0; i < 5; i++) {
    units.push({
      type: unitTypes[i % unitTypes.length],
      side: 'player',
      x: 3 + i * 3,
      y: height - 2,
      hasActed: false
    });
  }

  // 敵ユニットを配置（上部）
  for (let i = 0; i < 5; i++) {
    units.push({
      type: unitTypes[i % unitTypes.length],
      side: 'enemy',
      x: 3 + i * 3,
      y: 2,
      hasActed: false
    });
  }

  return units;
};

// 2点間の距離を計算
const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

export const GameMap: React.FC<GameMapProps> = ({ width, height, tileSize }) => {
  const [terrain] = useState(() => createInitialTerrain(width, height));
  const [units, setUnits] = useState(() => generateInitialUnits(width, height));
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
  const [movablePositions, setMovablePositions] = useState<{ x: number; y: number }[]>([]);
  const [currentTurn, setCurrentTurn] = useState<UnitSide>('player');
  const [isProcessing, setIsProcessing] = useState(false);

  // 移動可能なマスを計算
  const calculateMovablePositions = useCallback((
    unit: UnitData,
    currentUnits: UnitData[],
  ): { x: number; y: number }[] => {
    if (unit.hasActed || unit.side !== currentTurn) return [];

    const positions: { x: number; y: number }[] = [];
    const moveRange = unit.type === 'tank' ? 4 : 3;

    for (let dy = -moveRange; dy <= moveRange; dy++) {
      for (let dx = -moveRange; dx <= moveRange; dx++) {
        const newX = unit.x + dx;
        const newY = unit.y + dy;

        if (newX < 0 || newY < 0 || newX >= width || newY >= height) continue;
        if (terrain[newY][newX] === 'water') continue;
        if (Math.abs(dx) + Math.abs(dy) > moveRange) continue;
        if (!currentUnits.some(u => u.x === newX && u.y === newY)) {
          positions.push({ x: newX, y: newY });
        }
      }
    }

    return positions;
  }, [terrain, width, height, currentTurn]);

  // CPUの行動を実行
  const executeCPUTurn = useCallback(async () => {
    setIsProcessing(true);

    const enemyUnits = units.filter(u => u.side === 'enemy' && !u.hasActed);
    const playerUnits = units.filter(u => u.side === 'player');

    // 各敵ユニットの行動を順番に実行
    for (const enemyUnit of enemyUnits) {
      // 一時停止して動きを見やすくする
      await new Promise(resolve => setTimeout(resolve, 500));

      // 最も近いプレイヤーユニットを見つける
      let nearestPlayer = playerUnits[0];
      let minDistance = calculateDistance(enemyUnit.x, enemyUnit.y, nearestPlayer.x, nearestPlayer.y);

      for (const playerUnit of playerUnits) {
        const distance = calculateDistance(enemyUnit.x, enemyUnit.y, playerUnit.x, playerUnit.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearestPlayer = playerUnit;
        }
      }

      // 移動可能な位置を取得
      const positions = calculateMovablePositions(enemyUnit, units);
      
      // 最も近いプレイヤーに近づく位置を選択
      let bestPosition = positions[0];
      let bestDistance = Infinity;

      for (const pos of positions) {
        const distance = calculateDistance(pos.x, pos.y, nearestPlayer.x, nearestPlayer.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestPosition = pos;
        }
      }

      // 移動を実行
      if (bestPosition) {
        setUnits(prevUnits =>
          prevUnits.map(u =>
            u === enemyUnit ? { ...u, x: bestPosition.x, y: bestPosition.y, hasActed: true } : u
          )
        );
      }
    }

    // 全ての行動が終了したらプレイヤーターンへ
    await new Promise(resolve => setTimeout(resolve, 500));
    handleEndTurn();
    setIsProcessing(false);
  }, [units, calculateMovablePositions]);

  // ターン開始時のCPU処理
  useEffect(() => {
    if (currentTurn === 'enemy' && !isProcessing) {
      executeCPUTurn();
    }
  }, [currentTurn, executeCPUTurn, isProcessing]);

  const handleUnitClick = useCallback((unit: UnitData) => {
    if (!isProcessing && unit.side === currentTurn && !unit.hasActed) {
      setSelectedUnit(unit);
      setMovablePositions(calculateMovablePositions(unit, units));
    }
  }, [units, calculateMovablePositions, currentTurn, isProcessing]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!isProcessing && selectedUnit && movablePositions.some(pos => pos.x === x && pos.y === y)) {
      setUnits(prevUnits => 
        prevUnits.map(u => 
          u === selectedUnit ? { ...u, x, y, hasActed: true } : u
        )
      );
      setSelectedUnit(null);
      setMovablePositions([]);
    }
  }, [selectedUnit, movablePositions, isProcessing]);

  const handleEndTurn = useCallback(() => {
    if (!isProcessing) {
      const nextTurn = currentTurn === 'player' ? 'enemy' : 'player';
      setCurrentTurn(nextTurn);
      setUnits(prevUnits =>
        prevUnits.map(unit => ({ ...unit, hasActed: false }))
      );
      setSelectedUnit(null);
      setMovablePositions([]);
    }
  }, [currentTurn, isProcessing]);

  const tiles = useMemo(() => {
    const tileElements = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        tileElements.push(
          <MapTile
            key={`${x}-${y}`}
            x={x}
            y={y}
            size={tileSize}
            terrain={terrain[y][x]}
            isMovable={!isProcessing && movablePositions.some(pos => pos.x === x && pos.y === y)}
            onClick={() => handleTileClick(x, y)}
          />
        );
      }
    }
    return tileElements;
  }, [height, width, tileSize, terrain, movablePositions, handleTileClick, isProcessing]);

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
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '10px',
          backgroundColor: '#fff',
          border: '1px solid #000',
          borderRadius: '5px',
          zIndex: 2,
          userSelect: 'none',
        }}
      >
        <div>現在のターン: {currentTurn === 'player' ? 'プレイヤー' : '敵'}</div>
        {currentTurn === 'player' && !isProcessing && (
          <button
            onClick={handleEndTurn}
            style={{
              marginTop: '5px',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
          >
            ターン終了
          </button>
        )}
      </div>
      <div
        style={{
          position: 'relative',
          width: width * tileSize,
          height: height * tileSize,
        }}
      >
        {tiles}
        {units.map((unit, index) => (
          <Unit
            key={`unit-${index}`}
            unit={unit}
            size={tileSize}
            isSelected={unit === selectedUnit}
            onClick={() => handleUnitClick(unit)}
          />
        ))}
      </div>
    </div>
  );
};