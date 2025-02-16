import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { GameBoard } from './components/GameBoard';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import type { EnvironmentType, GameState, EvolutionStage } from './types/game';
import { environments } from './data/environments';
import { EVOLUTION_PATHS } from './types/game';

function App() {
  // ゲームの初期状態を設定（20x24のマス目）
  const initialState: GameState = {
    board: Array(20).fill(null).map(() =>
      Array(24).fill(null).map(() => ({
        environment: null,
        organism: null,
      }))
    ),
    selectedEnvironment: null,
    turn: 0,
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
    if (!gameState.selectedEnvironment) return;

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
      // ランダムに1つの進化経路を選択（複数の進化経路がある場合）
      return possiblePaths[Math.floor(Math.random() * possiblePaths.length)].to;
    }
    return null;
  };

  // ターン経過処理
  const processTurn = useCallback(() => {
    setGameState(prev => {
      const newBoard = prev.board.map(row =>
        row.map(cell => {
          if (!cell.environment) return cell;

          if (!cell.organism) {
            // 新しい生物の発生（原生生物のみ、特定の環境でのみ）
            if (
              cell.environment.canSpawnPrimitive &&
              Math.random() < cell.environment.spawnRate
            ) {
              return {
                ...cell,
                organism: {
                  stage: 'primitive' as EvolutionStage,
                  health: 100,
                  age: 0,
                  adaptationScore: cell.environment.adaptability.primitive,
                },
              };
            }
            return cell;
          }

          // このポイントでは cell.organism は必ず存在する
          const organism = cell.organism;

          // 生物の更新
          const adaptability = cell.environment.adaptability[organism.stage];
          const environmentType = cell.environment.type;

          // より厳しい健康度の変動
          const healthChange = (adaptability - 60) / 5;
          const newHealth = Math.max(0, Math.min(100, organism.health + healthChange));
          const newAge = organism.age + 1;

          // 適応スコアの更新
          const newAdaptationScore = adaptability;

          // 死亡判定（より厳しく）
          if (newHealth <= 0 || (adaptability < 30 && Math.random() < 0.4)) {
            return { ...cell, organism: null };
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
            newAdaptationScore >= 70
          ) {
            return {
              ...cell,
              organism: {
                stage: nextStage,
                health: 100,
                age: 0,
                adaptationScore: cell.environment.adaptability[nextStage],
              },
            };
          }

          return {
            ...cell,
            organism: {
              ...organism,
              health: newHealth,
              age: newAge,
              adaptationScore: newAdaptationScore,
            },
          };
        })
      );

      return {
        ...prev,
        board: newBoard,
        turn: prev.turn + 1,
      };
    });
  }, []);

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
