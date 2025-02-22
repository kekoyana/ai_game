import React, { useEffect, useState } from 'react';
import { GameState } from './types/game';
import { createInitialGameState, movePlayer } from './game/gameLogic';

const CELL_SIZE = 30; // ピクセル単位

const Game: React.FC = () => {
  const width = 20;
  const height = 20;
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(width, height)
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;
    switch (e.key) {
      case 'ArrowUp':
        direction = 'up';
        break;
      case 'ArrowDown':
        direction = 'down';
        break;
      case 'ArrowLeft':
        direction = 'left';
        break;
      case 'ArrowRight':
        direction = 'right';
        break;
      default:
        break;
    }
    if (direction) {
      setGameState((prevState) => movePlayer(prevState, direction));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () =>
      window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{ display: 'inline-block', border: '2px solid black' }}>
      {gameState.map.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: 'flex' }}>
          {row.map((cell, colIndex) => {
            const isPlayer =
              gameState.player.x === colIndex &&
              gameState.player.y === rowIndex;
            let backgroundColor;
            if (cell.type === 'wall') {
              backgroundColor = '#333';
            } else {
              backgroundColor = cell.isVisible ? '#ccc' : '#fff';
            }
            return (
              <div
                key={colIndex}
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: backgroundColor,
                  border: '1px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                {isPlayer ? 'P' : ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Game;