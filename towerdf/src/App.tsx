import { useState, useEffect, useCallback } from 'react'
import './App.css'

interface Tower {
  type: 'basic' | 'power' | 'area';
  damage: number;
  range: number;
  lastAttack: number;
}

interface Cell {
  type: 'empty' | 'tower' | 'path';
  tower?: Tower;
}

interface Enemy {
  id: number;
  position: { x: number; y: number };
  health: number;
  maxHealth: number;
  type: 'normal' | 'fast' | 'tank';
  speed: number;
  pathIndex: number; // 現在の経路上のインデックス
}

function App() {
  const GRID_SIZE = 10;
  const TOWER_COSTS = {
    basic: 50,
    power: 100,
    area: 150
  };
  const TOWER_STATS = {
    basic: { range: 2, damage: 25, cooldown: 1000 },
    power: { range: 1, damage: 50, cooldown: 1500 },
    area: { range: 3, damage: 15, cooldown: 2000 }
  };
  const ENEMY_STATS = {
    normal: { health: 100, speed: 1, reward: 25 },
    fast: { health: 50, speed: 2, reward: 35 },
    tank: { health: 200, speed: 0.5, reward: 50 }
  };

  const [money, setMoney] = useState(150);
  const [wave, setWave] = useState(0); // Start at wave 0, click button for wave 1
  const [selectedTowerType, setSelectedTowerType] = useState<'basic' | 'power' | 'area'>('basic');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(20); // Player lives
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{x: number, y: number} | null>(null);
  const [waveInProgress, setWaveInProgress] = useState(false);
  const [spawningComplete, setSpawningComplete] = useState(false); // Track if spawning is done for the current wave

  // Define the enemy path (array of {x, y} coordinates)
  const enemyPath = [
    { x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }, { x: 2, y: 4 }, { x: 2, y: 3 },
    { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 },
    { x: 5, y: 6 }, { x: 5, y: 7 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 8, y: 7 },
    { x: 8, y: 6 }, { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 },
    { x: 9, y: 2 }
  ];
  const [grid, setGrid] = useState<Cell[][]>(() => {
    const initialGrid: Cell[][] = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      initialGrid[i] = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        initialGrid[i][j] = { type: 'empty' };
      }
    }
    // Mark path cells on the grid
    enemyPath.forEach(pos => {
      if (initialGrid[pos.y] && initialGrid[pos.y][pos.x]) {
        initialGrid[pos.y][pos.x] = { type: 'path' };
      }
    });
    return initialGrid;
  });

  const [enemies, setEnemies] = useState<Enemy[]>([]);

  const handleCellClick = (row: number, col: number) => {
    // Cannot build on path or if game is over
    if (isGameOver || grid[row][col].type !== 'empty' || money < TOWER_COSTS[selectedTowerType]) {
      return;
    }
    if (grid[row][col].type === 'empty' && money >= TOWER_COSTS[selectedTowerType]) {
      const newGrid = [...grid];
      newGrid[row][col] = {
        type: 'tower',
        tower: {
          type: selectedTowerType,
          damage: TOWER_STATS[selectedTowerType].damage,
          range: TOWER_STATS[selectedTowerType].range,
          lastAttack: 0
        }
      };
      setGrid(newGrid);
      setMoney(money - TOWER_COSTS[selectedTowerType]);
    }
    setSelectedCell({x: col, y: row});
  };

  const getEnemyType = (wave: number): 'normal' | 'fast' | 'tank' => {
    const random = Math.random();
    if (wave < 3) return 'normal';
    if (wave < 5) {
      return random < 0.7 ? 'normal' : 'fast';
    }
    return random < 0.5 ? 'normal' : random < 0.8 ? 'fast' : 'tank';
  };

  // タワーの攻撃範囲内にいる敵を探す
  const findTargetInRange = (towerX: number, towerY: number): Enemy | null => {
    // Find the closest enemy within range
    let closestEnemy: Enemy | null = null;
    let minDistance = Infinity;

    enemies.forEach(enemy => {
      const cell = grid[towerY][towerX];
      if (!cell || cell.type !== 'tower' || !cell.tower) return;
      const tower = cell.tower;
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - towerX, 2) +
        Math.pow(enemy.position.y - towerY, 2)
      );

      if (distance <= TOWER_STATS[tower.type].range && distance < minDistance) {
        minDistance = distance;
        closestEnemy = enemy;
      }
    });
    return closestEnemy;
  };

  // タワーの攻撃処理
  const handleTowerAttacks = () => {
    const now = Date.now();
    const newGrid = [...grid];
    let enemiesUpdated = false;

    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.type === 'tower' && cell.tower) {
          const target = findTargetInRange(colIndex, rowIndex);
          if (target && now - cell.tower.lastAttack >= TOWER_STATS[cell.tower.type].cooldown) {
            // エリア攻撃
            if (cell.tower.type === 'area') {
              setEnemies(prev => prev.map(enemy => {
                const distance = Math.sqrt(
                  Math.pow(enemy.position.x - colIndex, 2) +
                  Math.pow(enemy.position.y - rowIndex, 2)
                );
                if (distance <= TOWER_STATS.area.range) {
                  const newHealth = enemy.health - cell.tower!.damage;
                  if (newHealth <= 0) {
                    setMoney(prev => prev + ENEMY_STATS[enemy.type].reward);
                    setScore(prev => prev + 10);
                    return { ...enemy, health: 0 }; // Mark for removal
                  }
                  return { ...enemy, health: newHealth };
                }
                return enemy;
              }).filter(enemy => enemy.health > 0)); // Remove defeated enemies
            } else { // 単体攻撃 (basic, power)
              setEnemies(prev => prev.map(enemy => {
                if (enemy.id === target.id) {
                  const newHealth = enemy.health - cell.tower!.damage;
                  if (newHealth <= 0) {
                    setMoney(prev => prev + ENEMY_STATS[enemy.type].reward);
                    setScore(prev => prev + 10);
                    return { ...enemy, health: 0 }; // Mark for removal
                  }
                  return { ...enemy, health: newHealth };
                }
                return enemy;
              }).filter(enemy => enemy.health > 0)); // Remove defeated enemies
            }
            // 攻撃後にクールダウンを設定
            cell.tower.lastAttack = now;
            enemiesUpdated = true;
          }
        }
      }); // row.forEach の閉じ
    }); // grid.forEach の閉じ

    if (enemiesUpdated) {
      setGrid(newGrid);
    }
  };

  // Start Wave function (moved outside useEffect, wrapped in useCallback)
  const startWave = useCallback(() => {
    if (isGameOver || waveInProgress) return;
    const nextWave = wave + 1; // Use next wave number for calculations
    setWave(nextWave);
    setWaveInProgress(true);
    setSpawningComplete(false); // Reset spawning flag for the new wave
    const enemiesToSpawn = 5 + nextWave * 2;
    let spawnCount = 0;

    const spawnInterval = setInterval(() => {
      if (spawnCount >= enemiesToSpawn) {
        clearInterval(spawnInterval);
        setSpawningComplete(true); // Mark spawning as complete for this wave
        return;
      }

      const type = getEnemyType(nextWave); // Use nextWave
      const startPos = enemyPath[0];
      const newEnemy: Enemy = {
        id: Date.now() + spawnCount, // Ensure unique ID
        position: { ...startPos },
        health: ENEMY_STATS[type].health * (1 + nextWave * 0.1), // Scale health
        maxHealth: ENEMY_STATS[type].health * (1 + nextWave * 0.1),
        type: type,
        speed: ENEMY_STATS[type].speed,
        pathIndex: 0
      };
      setEnemies(prev => [...prev, newEnemy]);
      spawnCount++;
    }, 500); // Spawn interval
  }, [isGameOver, waveInProgress, wave]); // Dependencies for startWave

  useEffect(() => {


    // Main Game Loop
    const gameLoop = setInterval(() => {
      if (isGameOver) {
        clearInterval(gameLoop);
        return;
      }
      // 敵の移動
      handleTowerAttacks();

      let livesLostThisTick = 0;
      setEnemies(prevEnemies => {
        const updatedEnemies = prevEnemies.map(enemy => {
          if (enemy.pathIndex >= enemyPath.length - 1) {
            // Enemy reached the end
            livesLostThisTick++;
            return null; // Mark for removal
          }

          const targetPosition = enemyPath[enemy.pathIndex + 1];
          const currentPosition = enemy.position;

          // Vector from current position to target
          const dx = targetPosition.x - currentPosition.x;
          const dy = targetPosition.y - currentPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let newX = currentPosition.x;
          let newY = currentPosition.y;
          let nextPathIndex = enemy.pathIndex;

          // If distance is very small or zero, snap to target and increment pathIndex
          if (distance < 0.01) {
              newX = targetPosition.x;
              newY = targetPosition.y;
              nextPathIndex++;
          } else {
              // Calculate movement for this frame
              const moveX = (dx / distance) * enemy.speed;
              const moveY = (dy / distance) * enemy.speed;

              // Calculate potential new position
              const potentialX = currentPosition.x + moveX;
              const potentialY = currentPosition.y + moveY;

              // Check if the movement overshoots the target
              // Overshoot occurs if the vector from potential position to target
              // is roughly opposite to the original vector (dx, dy)
              const remainingDx = targetPosition.x - potentialX;
              const remainingDy = targetPosition.y - potentialY;

              // Dot product check: if dot product of (dx, dy) and (remainingDx, remainingDy) is negative or zero, we overshot.
              if (dx * remainingDx + dy * remainingDy <= 0) {
                  // Overshot or reached target exactly
                  newX = targetPosition.x;
                  newY = targetPosition.y;
                  nextPathIndex++;
              } else {
                  // Did not overshoot, update to potential position
                  newX = potentialX;
                  newY = potentialY;
              }
          }

          // Ensure pathIndex doesn't exceed bounds (safety check)
          if (nextPathIndex >= enemyPath.length) {
              nextPathIndex = enemyPath.length - 1;
              // Consider marking as reached end here too if needed
          }


          return {
            ...enemy,
            position: { x: newX, y: newY },
            pathIndex: nextPathIndex
          };
        }).filter(enemy => enemy !== null) as Enemy[]; // Remove nulls (enemies that reached the end)

        // Check if wave ended: Wave must be in progress, spawning must be complete, and no enemies left on screen.
        if (waveInProgress && spawningComplete && updatedEnemies.length === 0) {
           console.log(`Wave ${wave} ended.`);
           setWaveInProgress(false);
           setSpawningComplete(false); // Reset for the next wave button
        }


        return updatedEnemies;
      });


      if (livesLostThisTick > 0) {
        setLives(prevLives => {
          const newLives = prevLives - livesLostThisTick;
          if (newLives <= 0) {
            setIsGameOver(true);
            console.log("GAME OVER");
            return 0;
          }
          return newLives;
        });
      }

    }, 50); // Faster game loop interval (e.g., 50ms)

    // Removed the unreliable waveEndCheckTimeout

    return () => {
        clearInterval(gameLoop);
        // No timeout to clear anymore
    };
  }, [isGameOver, waveInProgress, enemies, grid, wave, spawningComplete]); // Updated dependencies

  return (
    <div className="game-container">
      <div className="game-info">
        <div>スコア: {score}</div>
        <div>所持金: {money}🪙</div>
        <div>ライフ: {lives}❤️</div>
      </div>

      {/* タワー選択UI */}
      <div className="tower-selection">
        <h3>タワーを選択</h3>
        <div className="tower-buttons">
          <button
            className={`tower-button ${selectedTowerType === 'basic' ? 'selected' : ''}`}
            onClick={() => setSelectedTowerType('basic')}
          >
            基本タワー (50🪙)
          </button>
          <button
            className={`tower-button ${selectedTowerType === 'power' ? 'selected' : ''}`}
            onClick={() => setSelectedTowerType('power')}
          >
            パワータワー (100🪙)
          </button>
          <button
            className={`tower-button ${selectedTowerType === 'area' ? 'selected' : ''}`}
            onClick={() => setSelectedTowerType('area')}
          >
            範囲タワー (150🪙)
          </button>
        </div>
      </div>

      {/* ウェーブ情報 */}
      <div className="wave-info">
        Wave {wave}
        <button onClick={startWave} disabled={isGameOver || waveInProgress} style={{marginLeft: '10px'}}>
          {isGameOver ? "ゲームオーバー" : waveInProgress ? `ウェーブ ${wave} 進行中` : `ウェーブ ${wave + 1} 開始`}
        </button>
      </div>
      <div className="game-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid-row">
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${cell.type}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {/* タワーの表示 */}
                {cell.type === 'tower' && (
                  <div className={`tower ${cell.tower?.type}`}>
                    {cell.tower?.type === 'basic' && '🗼'}
                    {cell.tower?.type === 'power' && '🏰'}
                    {cell.tower?.type === 'area' && '🗿'}
                  </div>
                )}

                {/* 選択されたセルの攻撃範囲表示 */}
                {selectedCell &&
                 selectedCell.x === colIndex &&
                 selectedCell.y === rowIndex &&
                 cell.type === 'tower' &&
                 <div
                   className="tower-range"
                   style={{
                     width: `${cell.tower!.range * 100}px`, // Diameter = range * 2 * cell_half_width
                     height: `${cell.tower!.range * 100}px` // Diameter = range * 2 * cell_half_height
                     // transform removed, will be handled by CSS class
                   }}
                 ></div>}

                {/* 敵の表示 */}
                {enemies.map(enemy => {
                  // Render enemy based on its current float position within the cell
                  const enemySize = 50; // Match cell size
                  const enemyRenderX = (enemy.position.x - colIndex) * enemySize;
                  const enemyRenderY = (enemy.position.y - rowIndex) * enemySize;

                  // Check if enemy center is roughly within this cell for rendering
                  if (Math.abs(enemy.position.x - colIndex) < 1 && Math.abs(enemy.position.y - rowIndex) < 1) {
                    return (
                      <div
                        key={enemy.id}
                        className={`enemy ${enemy.type}`}
                        style={{
                          position: 'absolute',
                          left: `${enemyRenderX}px`,
                          top: `${enemyRenderY}px`,
                          transform: 'translate(-50%, -50%)' // Center the enemy visually
                        }}
                      >
                        {enemy.type === 'fast' ? '⚡️' : enemy.type === 'tank' ? '🚜' : '👾'}
                        <div className="health-bar">
                          <div
                            className="health-bar-fill"
                            style={{width: `${(enemy.health / enemy.maxHealth) * 100}%`}}
                          ></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
