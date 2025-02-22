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
    if (gameState.isGameClear) return;
    
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
  }, [gameState.isGameClear]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '10px', fontSize: '20px' }}>
        地下{gameState.currentFloor}階
      </div>
      <div style={{ display: 'inline-block', border: '2px solid black' }}>
        {gameState.map.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex' }}>
            {row.map((cell, colIndex) => {
              const isPlayer =
                gameState.player.x === colIndex &&
                gameState.player.y === rowIndex;
              let backgroundColor;
              let content = '';
              
              if (cell.type === 'wall') {
                backgroundColor = '#333';
              } else if (cell.type === 'stairs') {
                backgroundColor = cell.isVisible ? '#8B4513' : '#fff';
                content = cell.isVisible ? '>' : '';
              } else {
                backgroundColor = cell.isVisible ? '#ccc' : '#fff';
              }

              if (isPlayer) {
                content = '@';
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
                    color: isPlayer ? '#ff0000' : '#000',
                  }}
                >
                  {content}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {gameState.isGameClear && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            padding: '20px',
            borderRadius: '10px',
            fontSize: '24px',
            zIndex: 1000,
          }}
        >
          Game Clear!
        </div>
      )}
    </div>
  );
};

export default Game;