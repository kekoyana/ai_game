import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { GameBoard } from './components/GameBoard';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import type { EnvironmentType, GameState, EvolutionStage, Cell } from './types/game';
import { environments } from './data/environments';
import { EVOLUTION_PATHS } from './types/game';

// 隣接セルの座標を取得（周囲8マス）
const getAdjacentCells = (row: number, col: number, maxRow: number, maxCol: number) => {
  const adjacent: [number, number][] = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const newRow = row + i;
      const newCol = col + j;
      if (newRow >= 0 && newRow < maxRow && newCol >= 0 && newCol < maxCol) {
        adjacent.push([newRow, newCol]);
      }
    }
  }
  return adjacent;
};

// 同種の生物の数をカウント
const countSameSpecies = (
  board: Cell[][],
  row: number,
  col: number,
  stage: EvolutionStage
): number => {
  const adjacent = getAdjacentCells(row, col, board.length, board[0].length);
  return adjacent.reduce((count, [r, c]) => {
    const organism = board[r][c].organism;
    return organism && organism.stage === stage ? count + 1 : count;
  }, 0);
};

// ボード上の特定の種の生物の数をカウント
const countSpecies = (board: Cell[][], stage: EvolutionStage): number => {
  return board.reduce((total, row) => {
    return total + row.reduce((count, cell) => {
      return cell.organism?.stage === stage ? count + 1 : count;
    }, 0);
  }, 0);
};

function App() {
  // ゲームの初期状態を設定（10x12のマス目）
  const initialState: GameState = {
    board: Array(10).fill(null).map(() =>
      Array(12).fill(null).map(() => ({
        environment: null,
        organism: null,
      }))
    ),
    selectedEnvironment: null,
    turn: 0,
    isGameCleared: false,
    humanCount: 0,
  };

  const [gameState, setGameState] = useState<GameState>(initialState);

  // 環境の選択
  const handleEnvironmentSelect = (type: EnvironmentType) => {
    setGameState(prev => ({
      ...prev,
      selectedEnvironment: type,
    }));
  };

  // セルのクリック処理
  const handleCellClick = (row: number, col: number) => {
    if (!gameState.selectedEnvironment || gameState.isGameCleared) return;

    setGameState(prev => {
      const newBoard = [...prev.board.map(row => [...row])];
      newBoard[row][col] = {
        ...newBoard[row][col],
        environment: environments[gameState.selectedEnvironment!],
      };
      return { ...prev, board: newBoard };
    });
  };

  // 指定された生物種の進化可能な次の段階を取得
  const getNextStage = (currentStage: EvolutionStage, environment: EnvironmentType): EvolutionStage | null => {
    const possiblePaths = EVOLUTION_PATHS.filter(
      path => 
        path.from === currentStage && 
        path.requirements.environments.includes(environment)
    );
    
    if (possiblePaths.length > 0) {
      return possiblePaths[Math.floor(Math.random() * possiblePaths.length)].to;
    }
    return null;
  };

  // ターン経過処理
  const processTurn = useCallback(() => {
    if (gameState.isGameCleared) return;

    setGameState(prev => {
      const newBoard: Cell[][] = JSON.parse(JSON.stringify(prev.board));
      const maxRow = prev.board.length;
      const maxCol = prev.board[0].length;

      // 各セルについて生物の更新と移動を処理
      for (let row = 0; row < maxRow; row++) {
        for (let col = 0; col < maxCol; col++) {
          const cell = newBoard[row][col];
          if (!cell.environment) continue;

          // 生物の移動と繁殖の処理
          if (cell.organism) {
            // 同種の生物の密集度をチェック
            const sameSpeciesCount = countSameSpecies(newBoard, row, col, cell.organism.stage);
            
            // 密集によるストレス
            if (sameSpeciesCount >= 4) {
              // 50%の確率で死滅
              if (Math.random() < 0.5) {
                cell.organism = null;
                continue;
              }
            }

            const adjacent = getAdjacentCells(row, col, maxRow, maxCol);
            
            // 30%の確率で隣接セルに移動または繁殖
            if (Math.random() < 0.3) {
              const [newRow, newCol] = adjacent[Math.floor(Math.random() * adjacent.length)];
              const targetCell = newBoard[newRow][newCol];

              if (targetCell.environment) {
                const adaptabilityInNewEnv = targetCell.environment.adaptability[cell.organism.stage];
                
                // 適応度が50以上なら移動または繁殖可能
                if (adaptabilityInNewEnv >= 50) {
                  if (!targetCell.organism && Math.random() < 0.6) { // 繁殖
                    targetCell.organism = {
                      ...cell.organism,
                      health: 80,
                      age: 0,
                      adaptationScore: adaptabilityInNewEnv,
                    };
                  } else if (!targetCell.organism && Math.random() < 0.4) { // 移動
                    targetCell.organism = cell.organism;
                    cell.organism = null;
                  }
                }
              }
            }
          }

          // 生物がいない場合の新規発生処理
          if (!cell.organism) {
            if (
              cell.environment.canSpawnPrimitive &&
              Math.random() < cell.environment.spawnRate
            ) {
              cell.organism = {
                stage: 'primitive' as EvolutionStage,
                health: 100,
                age: 0,
                adaptationScore: cell.environment.adaptability.primitive,
              };
            }
            continue;
          }

          // 生存している生物の更新
          const organism = cell.organism;
          const adaptability = cell.environment.adaptability[organism.stage];
          const environmentType = cell.environment.type;

          // 健康度の変動
          const healthChange = (adaptability - 60) / 5;
          const newHealth = Math.max(0, Math.min(100, organism.health + healthChange));
          const newAge = organism.age + 1;

          // 死亡判定
          if (newHealth <= 0 || (adaptability < 30 && Math.random() < 0.4)) {
            cell.organism = null;
            continue;
          }

          // 進化判定
          const nextStage = getNextStage(organism.stage, environmentType);
          const evolutionPath = EVOLUTION_PATHS.find(
            path => path.from === organism.stage && path.to === nextStage
          );

          if (
            nextStage &&
            evolutionPath &&
            newHealth >= evolutionPath.requirements.health &&
            newAge >= evolutionPath.requirements.age &&
            adaptability >= 70
          ) {
            cell.organism = {
              stage: nextStage,
              health: 100,
              age: 0,
              adaptationScore: cell.environment.adaptability[nextStage],
            };
          } else {
            cell.organism = {
              ...organism,
              health: newHealth,
              age: newAge,
              adaptationScore: adaptability,
            };
          }
        }
      }

      // 人類の数をカウント
      const newHumanCount = countSpecies(newBoard, 'human');

      // クリア判定
      const isCleared = newHumanCount >= 10;

      return {
        ...prev,
        board: newBoard,
        turn: prev.turn + 1,
        humanCount: newHumanCount,
        isGameCleared: isCleared,
      };
    });
  }, [gameState.isGameCleared]);

  // 定期的なターン処理（500ミリ秒ごとに更新）
  useEffect(() => {
    const interval = setInterval(processTurn, 500);
    return () => clearInterval(interval);
  }, [processTurn]);

  return (
    <div className="game-container">
      <div className="game-left-panel">
        <div className="game-info">
          <p>ターン: {gameState.turn}</p>
          <p>人類の数: {gameState.humanCount} / 10</p>
          {gameState.isGameCleared && (
            <div className="game-clear-message">
              クリア！おめでとうございます！
            </div>
          )}
        </div>
        <EnvironmentSelector
          selectedEnvironment={gameState.selectedEnvironment}
          onSelect={handleEnvironmentSelect}
        />
      </div>
      <div className="game-right-panel">
        <GameBoard gameState={gameState} onCellClick={handleCellClick} />
      </div>
    </div>
  );
}

export default App;
