import React, { useEffect, useState, useCallback } from 'react';
import { GameState, Direction, Cell, Monster } from './types/game';
import { createInitialGameState, movePlayer } from './game/gameLogic';

const CELL_SIZE = 40;

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
      // Arrow keys for orthogonal movement
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
      // Numpad for diagonal movement
      case '7':
      case 'Home':
        direction = 'upleft';
        break;
      case '9':
      case 'PageUp':
        direction = 'upright';
        break;
      case '1':
      case 'End':
        direction = 'downleft';
        break;
      case '3':
      case 'PageDown':
        direction = 'downright';
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
        <div style={{ marginBottom: '10px', fontSize: '24px' }}>
          🏰 地下{gameState.currentFloor}階
        </div>
        <div style={{ display: 'inline-block', border: '2px solid black', backgroundColor: '#2c3e50' }}>
          {gameState.map.map((row: Cell[], rowIndex: number) => (
            <div key={rowIndex} style={{ display: 'flex', height: `${CELL_SIZE}px` }}>
              {row.map((cell: Cell, colIndex: number) => {
                const isPlayer =
                  gameState.player.x === colIndex &&
                  gameState.player.y === rowIndex;
                const monster = getMonsterAtPosition(colIndex, rowIndex);
                
                let content = '';
                let backgroundColor = cell.isVisible ? '#34495e' : '#2c3e50';
                
                if (cell.type === 'wall') {
                  backgroundColor = cell.isVisible ? '#7f8c8d' : '#2c3e50';
                } else if (cell.type === 'stairs') {
                  content = cell.isVisible ? '🚪' : '';
                }

                // アイテムの表示処理を追加
                const item = gameState.items.find(
                  item => item.position.x === colIndex &&
                         item.position.y === rowIndex &&
                         cell.isVisible
                );

                if (isPlayer) {
                  content = '🦸';
                } else if (monster) {
                  content = monster.symbol;
                } else if (item) {
                  content = item.symbol;
                }

                return (
                  <div
                    key={colIndex}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      transition: 'background-color 0.3s'
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
          backgroundColor: '#34495e',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          color: '#ecf0f1'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>👤 ステータス</h3>
          <div>❤️ HP: {gameState.playerStatus.hp}/{gameState.playerStatus.maxHp}</div>
          <div>⭐️ Level: {gameState.playerStatus.level}</div>
          <div>📈 EXP: {gameState.playerStatus.exp}</div>
          <div>⚔️ Attack: {gameState.playerStatus.attack}</div>
          <div>🛡️ Defense: {gameState.playerStatus.defense}</div>
        </div>

        {/* バトルログ表示 */}
        <div style={{
          backgroundColor: '#34495e',
          padding: '15px',
          borderRadius: '8px',
          height: '300px',
          overflowY: 'auto',
          color: '#ecf0f1'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>📜 バトルログ</h3>
          <div>
            {gameState.battleLogs.slice().reverse().map((log, index) => (
              <div key={index} style={{ marginBottom: '8px' }}>
                {log.message}
              </div>
            ))}
          </div>
        </div>

        {/* 操作説明 */}
        <div style={{
          backgroundColor: '#34495e',
          padding: '15px',
          marginTop: '20px',
          borderRadius: '8px',
          color: '#ecf0f1'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>🎮 操作方法</h3>
          <div>矢印キー: 上下左右移動</div>
          <div>テンキー: 斜め移動</div>
          <div>7️⃣8️⃣9️⃣</div>
          <div>4️⃣5️⃣6️⃣</div>
          <div>1️⃣2️⃣3️⃣</div>
        </div>
      </div>

      {gameState.isGameOver && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: '#e74c3c',
            padding: '30px',
            borderRadius: '15px',
            fontSize: '32px',
            zIndex: 1000,
          }}
        >
          💀 Game Over...
        </div>
      )}

      {gameState.isGameClear && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: '#f1c40f',
            padding: '30px',
            borderRadius: '15px',
            fontSize: '32px',
            zIndex: 1000,
          }}
        >
          🏆 Game Clear!
        </div>
      )}
    </div>
  );
};

export default Game;