import React, { useState, useCallback, useEffect } from 'react';
import './App.css';
import { GameBoard } from './components/GameBoard';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import type { EnvironmentType, GameState, EvolutionStage } from './types/game';
import { environments } from './data/environments';

// 進化の条件（健康度と年齢）
const EVOLUTION_REQUIREMENTS: Record<EvolutionStage, { health: number; age: number }> = {
  primitive: { health: 70, age: 5 },
  jellyfish: { health: 75, age: 8 },
  shellfish: { health: 80, age: 10 },
  fish: { health: 85, age: 12 },
  lungfish: { health: 90, age: 15 },
  amphibian: { health: 85, age: 18 },
  reptile: { health: 80, age: 20 },
  dinosaur: { health: 85, age: 25 },
  mammal: { health: 90, age: 30 },
  primate: { health: 95, age: 35 },
  human: { health: 100, age: 40 },
};

// 進化の順序を定義
const EVOLUTION_ORDER: EvolutionStage[] = [
  'primitive',
  'jellyfish',
  'shellfish',
  'fish',
  'lungfish',
  'amphibian',
  'reptile',
  'dinosaur',
  'mammal',
  'primate',
  'human',
];

// 次の進化段階を取得
const getNextStage = (stage: EvolutionStage): EvolutionStage | null => {
  const currentIndex = EVOLUTION_ORDER.indexOf(stage);
  return currentIndex < EVOLUTION_ORDER.length - 1 ? EVOLUTION_ORDER[currentIndex + 1] : null;
};

function App() {
  // ゲームの初期状態を設定
  const initialState: GameState = {
    board: Array(8).fill(null).map(() =>
      Array(8).fill(null).map(() => ({
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

  // ターン経過処理
  const processTurn = useCallback(() => {
    setGameState(prev => {
      const newBoard = prev.board.map(row =>
        row.map(cell => {
          if (!cell.organism) {
            // 新しい生物の発生（環境に応じた確率で）
            if (cell.environment && Math.random() < cell.environment.spawnRate) {
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

          // 生物の更新
          const adaptability = cell.environment
            ? cell.environment.adaptability[cell.organism.stage]
            : 20; // 環境がない場合は厳しい条件に

          // より厳しい健康度の変動
          const healthChange = (adaptability - 60) / 5;
          const newHealth = Math.max(0, Math.min(100, cell.organism.health + healthChange));
          const newAge = cell.organism.age + 1;

          // 適応スコアの更新
          const newAdaptationScore = cell.environment
            ? cell.environment.adaptability[cell.organism.stage]
            : 20;

          // 死亡判定（より厳しく）
          if (newHealth <= 0 || (adaptability < 30 && Math.random() < 0.3)) {
            return { ...cell, organism: null };
          }

          // 進化判定
          const requirements = EVOLUTION_REQUIREMENTS[cell.organism.stage];
          const nextStage = getNextStage(cell.organism.stage);
          if (
            nextStage &&
            newHealth >= requirements.health &&
            newAge >= requirements.age &&
            newAdaptationScore >= 70 // 適応度が十分高い場合のみ進化可能
          ) {
            return {
              ...cell,
              organism: {
                stage: nextStage,
                health: 100,
                age: 0,
                adaptationScore: cell.environment
                  ? cell.environment.adaptability[nextStage]
                  : 20,
              },
            };
          }

          return {
            ...cell,
            organism: {
              ...cell.organism,
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
      <div className="game-info">
        <p>ターン: {gameState.turn}</p>
      </div>
      <EnvironmentSelector
        selectedEnvironment={gameState.selectedEnvironment}
        onSelect={handleEnvironmentSelect}
      />
      <GameBoard gameState={gameState} onCellClick={handleCellClick} />
    </div>
  );
}

export default App;
