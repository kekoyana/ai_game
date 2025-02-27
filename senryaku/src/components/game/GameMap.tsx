import { useState, useCallback, useEffect } from 'react';
import { MapTile, TerrainType } from './MapTile';
import { Unit, UnitData, UnitType, UnitSide, unitInitialStats } from './Unit';

interface GameMapProps {
  width: number;
  height: number;
  tileSize: number;
}

// 地形による防御ボーナス
const terrainDefenseBonus: Record<TerrainType, number> = {
  plain: 1.0,
  mountain: 1.5,
  forest: 1.2,
  water: 1.0,
  city: 1.2,
  capital: 1.5,
};

interface TerrainOwnership {
  terrain: TerrainType;
  owner: UnitSide | null;
}

// 地形生成関数
const createInitialTerrain = (width: number, height: number): TerrainOwnership[][] => {
  const terrain: TerrainOwnership[][] = [];
  
  for (let y = 0; y < height; y++) {
    terrain[y] = [];
    for (let x = 0; x < width; x++) {
      const terrainData: TerrainOwnership = { terrain: 'plain', owner: null };

      if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
        terrainData.terrain = 'water';
      } else if (y === height - 2 && x === width - 3) {
        terrainData.terrain = 'capital';
        terrainData.owner = 'player';
      } else if (y === 2 && x === 2) {
        terrainData.terrain = 'capital';
        terrainData.owner = 'enemy';
      } else if ((y === height - 3 && x === 5) || (y === height - 2 && x === width - 6)) {
        terrainData.terrain = 'city';
        terrainData.owner = 'player';
      } else if ((y === 2 && x === width - 5) || (y === 3 && x === 5)) {
        terrainData.terrain = 'city';
        terrainData.owner = 'enemy';
      } else {
        const random = Math.random();
        if (random < 0.1) {
          terrainData.terrain = 'mountain';
        } else if (random < 0.3) {
          terrainData.terrain = 'forest';
        } else if (random < 0.35) {
          terrainData.terrain = 'water';
        }
      }

      terrain[y][x] = terrainData;
    }
  }

  // ユニットの初期位置は必ず平地に
  for (let i = 0; i < 5; i++) {
    terrain[height - 2][3 + i * 3] = { terrain: 'plain', owner: null };
    terrain[2][3 + i * 3] = { terrain: 'plain', owner: null };
  }

  return terrain;
};

const generateInitialUnits = (width: number, height: number): UnitData[] => {
  const units: UnitData[] = [];
  const unitTypes: UnitType[] = ['infantry', 'tank', 'artillery'];

  // プレイヤーのユニットを配置（下部）
  for (let i = 0; i < 5; i++) {
    const type = unitTypes[i % unitTypes.length];
    const stats = unitInitialStats[type];
    units.push({
      type,
      side: 'player',
      x: 3 + i * 3,
      y: height - 2,
      hasActed: false,
      hp: stats.hp,
      maxHp: stats.hp,
    });
  }

  // 敵ユニットを配置（上部）
  for (let i = 0; i < 5; i++) {
    const type = unitTypes[i % unitTypes.length];
    const stats = unitInitialStats[type];
    units.push({
      type,
      side: 'enemy',
      x: 3 + i * 3,
      y: 2,
      hasActed: false,
      hp: stats.hp,
      maxHp: stats.hp,
    });
  }

  return units;
};

const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
};

const getTargetsInRange = (
  attacker: UnitData,
  units: UnitData[],
): UnitData[] => {
  const range = unitInitialStats[attacker.type].range;
  return units.filter(unit => 
    unit.side !== attacker.side &&
    unit.hp > 0 &&
    calculateDistance(attacker.x, attacker.y, unit.x, unit.y) <= range
  );
};

export const GameMap: React.FC<GameMapProps> = ({ width, height, tileSize }) => {
  const [terrain, setTerrain] = useState(() => createInitialTerrain(width, height));
  const [units, setUnits] = useState(() => generateInitialUnits(width, height));
  const [selectedUnit, setSelectedUnit] = useState<UnitData | null>(null);
  const [movablePositions, setMovablePositions] = useState<{ x: number; y: number }[]>([]);
  const [attackableUnits, setAttackableUnits] = useState<UnitData[]>([]);
  const [currentTurn, setCurrentTurn] = useState<UnitSide>('player');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<UnitSide | null>(null);

  const executeAttack = useCallback((attacker: UnitData, target: UnitData) => {
    const baseDamage = unitInitialStats[attacker.type].attack;
    const defenseBonus = terrainDefenseBonus[terrain[target.y][target.x].terrain];
    const damage = Math.floor(baseDamage / defenseBonus);

    setUnits(prevUnits =>
      prevUnits.map(unit =>
        unit === target ? { ...unit, hp: Math.max(0, unit.hp - damage) } : unit
      )
    );
  }, [terrain]);

  const calculateMovablePositions = useCallback((
    unit: UnitData,
    currentUnits: UnitData[],
  ): { x: number; y: number }[] => {
    if (unit.hasActed || unit.side !== currentTurn || unit.hp <= 0) return [];

    const positions: { x: number; y: number }[] = [];
    const moveRange = unit.type === 'tank' ? 4 : 3;

    for (let dy = -moveRange; dy <= moveRange; dy++) {
      for (let dx = -moveRange; dx <= moveRange; dx++) {
        const newX = unit.x + dx;
        const newY = unit.y + dy;

        if (newX < 0 || newY < 0 || newX >= width || newY >= height) continue;
        if (terrain[newY][newX].terrain === 'water') continue;
        if (terrain[newY][newX].terrain === 'mountain' && unit.type !== 'infantry') continue;
        if (Math.abs(dx) + Math.abs(dy) > moveRange) continue;
        if (!currentUnits.some(u => u.x === newX && u.y === newY && u.hp > 0)) {
          positions.push({ x: newX, y: newY });
        }
      }
    }

    return positions;
  }, [terrain, width, height, currentTurn]);

  const handleUnitClick = useCallback((clickedUnit: UnitData) => {
    if (isProcessing || gameOver) return;

    if (selectedUnit && attackableUnits.includes(clickedUnit)) {
      executeAttack(selectedUnit, clickedUnit);
      setUnits(prevUnits =>
        prevUnits.map(u =>
          u === selectedUnit ? { ...u, hasActed: true } : u
        )
      );
      setSelectedUnit(null);
      setAttackableUnits([]);
      setMovablePositions([]);
    } else if (clickedUnit.side === currentTurn && !clickedUnit.hasActed && clickedUnit.hp > 0) {
      setSelectedUnit(clickedUnit);
      setMovablePositions(calculateMovablePositions(clickedUnit, units));
      setAttackableUnits(getTargetsInRange(clickedUnit, units));
    }
  }, [
    currentTurn,
    selectedUnit,
    attackableUnits,
    units,
    calculateMovablePositions,
    executeAttack,
    isProcessing,
    gameOver
  ]);

  const updateTerritoryControl = useCallback((x: number, y: number, side: UnitSide) => {
    setTerrain(prevTerrain =>
      prevTerrain.map((row, yIdx) =>
        row.map((tile, xIdx) =>
          xIdx === x && yIdx === y && (tile.terrain === 'city' || tile.terrain === 'capital')
            ? { ...tile, owner: side }
            : tile
        )
      )
    );
  }, []);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (isProcessing || gameOver || !selectedUnit || !movablePositions.some(pos => pos.x === x && pos.y === y)) {
      return;
    }

    // 領地の支配権を更新
    updateTerritoryControl(x, y, selectedUnit.side);

    // ユニットを移動
    setUnits(prevUnits =>
      prevUnits.map(u =>
        u === selectedUnit ? { ...u, x, y } : u
      )
    );

    // 移動後に攻撃可能な対象を更新
    const movedUnit = { ...selectedUnit, x, y };
    setAttackableUnits(getTargetsInRange(movedUnit, units));
    setSelectedUnit(movedUnit);
    setMovablePositions([]);
  }, [selectedUnit, movablePositions, units, isProcessing, gameOver, updateTerritoryControl]);

  const checkVictoryCondition = useCallback(() => {
    let playerCapitalCaptured = true;
    let enemyCapitalCaptured = true;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = terrain[y][x];
        if (tile.terrain === 'capital') {
          if (tile.owner === 'player') playerCapitalCaptured = false;
          if (tile.owner === 'enemy') enemyCapitalCaptured = false;
        }
      }
    }

    if (playerCapitalCaptured) {
      setGameOver(true);
      setWinner('enemy');
    } else if (enemyCapitalCaptured) {
      setGameOver(true);
      setWinner('player');
    }
  }, [terrain, height]);

  const handleCityEffects = useCallback(() => {
    setUnits(prevUnits =>
      prevUnits.map(unit => {
        const currentTile = terrain[unit.y][unit.x];
        if ((currentTile.terrain === 'city' || currentTile.terrain === 'capital') &&
            currentTile.owner === unit.side) {
          const healAmount = 20;
          return {
            ...unit,
            hp: Math.min(unit.maxHp, unit.hp + healAmount)
          };
        }
        return unit;
      })
    );
  }, [terrain]);

  const handleEndTurn = useCallback(() => {
    if (!isProcessing && !gameOver) {
      handleCityEffects();
      checkVictoryCondition();
      const nextTurn = currentTurn === 'player' ? 'enemy' : 'player';
      setCurrentTurn(nextTurn);
      setUnits(prevUnits =>
        prevUnits.map(unit => ({ ...unit, hasActed: false }))
      );
      setSelectedUnit(null);
      setMovablePositions([]);
      setAttackableUnits([]);
    }
  }, [currentTurn, isProcessing, gameOver, handleCityEffects, checkVictoryCondition]);

  useEffect(() => {
    if (currentTurn === 'enemy' && !isProcessing && !gameOver) {
      setIsProcessing(true);
      setTimeout(() => {
        // ここにCPUの行動を実装
        handleEndTurn();
        setIsProcessing(false);
      }, 1000);
    }
  }, [currentTurn, isProcessing, gameOver, handleEndTurn]);

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
        {gameOver ? (
          <div>
            ゲーム終了！ {winner === 'player' ? 'プレイヤー' : '敵'}の勝利！
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
      <div
        style={{
          position: 'relative',
          width: width * tileSize,
          height: height * tileSize,
        }}
      >
        {Array(height).fill(0).map((_, y) =>
          Array(width).fill(0).map((_, x) => (
            <MapTile
              key={`${x}-${y}`}
              x={x}
              y={y}
              size={tileSize}
              terrain={terrain[y][x].terrain}
              owner={terrain[y][x].owner}
              isMovable={!isProcessing && !gameOver && movablePositions.some(pos => pos.x === x && pos.y === y)}
              onClick={() => handleTileClick(x, y)}
            />
          ))
        )}
        {units.filter(unit => unit.hp > 0).map((unit, index) => (
          <Unit
            key={`unit-${index}`}
            unit={unit}
            size={tileSize}
            isSelected={unit === selectedUnit}
            isTargetable={attackableUnits.includes(unit)}
            onClick={() => handleUnitClick(unit)}
          />
        ))}
      </div>
    </div>
  );
};