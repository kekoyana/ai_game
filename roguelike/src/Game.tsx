import React, { useEffect, useState, useCallback } from 'react';
import { GameState, Direction, Cell, Monster } from './types/game';
import { createInitialGameState, movePlayer } from './game/gameLogic';

const CELL_SIZE = 30;

const Game: React.FC = () => {
  const width = 20;
  const height = 20;
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(width, height)
  );

  const handleKeyDown = useCallback((e: KeyboardEvent): void => {
    if (gameState.isGameClear || gameState.isGameOver) return;
    
    let direction: Direction | null = null;
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
      setGameState((prevState: GameState) => movePlayer(prevState, direction as Direction));
    }
  }, [gameState.isGameClear, gameState.isGameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () =>
      window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getMonsterAtPosition = (x: number, y: number): Monster | undefined => {
    return gameState.monsters.find(
      monster => monster.position.x === x && 
                monster.position.y === y && 
                monster.isVisible &&
                monster.hp > 0
    );
  };

  return (
    <div style={{ display: 'flex', padding: '20px', gap: '20px' }}>
      <div>
        <div style={{ marginBottom: '10px', fontSize: '20px' }}>
          地下{gameState.currentFloor}階
        </div>
        <div style={{ display: 'inline-block', border: '2px solid black' }}>
          {gameState.map.map((row: Cell[], rowIndex: number) => (
            <div key={rowIndex} style={{ display: 'flex', height: `${CELL_SIZE}px` }}>
              {row.map((cell: Cell, colIndex: number) => {
                const isPlayer =
                  gameState.player.x === colIndex &&
                  gameState.player.y === rowIndex;
                const monster = getMonsterAtPosition(colIndex, rowIndex);
                
                let backgroundColor: string;
                let content = '';
                let textColor = '#000';
                
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
                  textColor = '#ff0000';
                } else if (monster) {
                  content = monster.symbol;
                  textColor = '#0000ff';
                }

                return (
                  <div
                    key={colIndex}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor,
                      border: '1px solid #000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: textColor,
                      fontWeight: monster ? 'bold' : 'normal',
                    }}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '300px' }}>
        {/* ステータス表示 */}
        <div style={{ 
          backgroundColor: '#eee',
          padding: '10px',
          marginBottom: '20px',
          borderRadius: '5px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>ステータス</h3>
          <div>HP: {gameState.playerStatus.hp}/{gameState.playerStatus.maxHp}</div>
          <div>Level: {gameState.playerStatus.level}</div>
          <div>EXP: {gameState.playerStatus.exp}</div>
          <div>Attack: {gameState.playerStatus.attack}</div>
          <div>Defense: {gameState.playerStatus.defense}</div>
        </div>

        {/* バトルログ表示 */}
        <div style={{
          backgroundColor: '#eee',
          padding: '10px',
          borderRadius: '5px',
          height: '300px',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>バトルログ</h3>
          <div>
            {gameState.battleLogs.slice().reverse().map((log, index) => (
              <div key={index} style={{ marginBottom: '5px' }}>
                {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      {gameState.isGameOver && (
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
          Game Over...
        </div>
      )}

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