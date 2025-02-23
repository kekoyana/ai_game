import React, { useEffect, useState, useCallback } from 'react';
import { GameState, Direction, Cell, Monster } from './types/game';
import { createInitialGameState, movePlayer, applyItem, getPlayerPower, dropItem } from './game/gameLogic';
import './Game.css';

const Game: React.FC = () => {
  const width = 20;
  const height = 20;
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(width, height)
  );
  const [showFloorAnnouncement, setShowFloorAnnouncement] = useState(true);
  const [prevFloor, setPrevFloor] = useState(1);

  // 初期表示とフロア変更時のアナウンス表示
  useEffect(() => {
    // 初期表示または階層が変わった時
    if (gameState.currentFloor !== prevFloor) {
      setShowFloorAnnouncement(true);
      setPrevFloor(gameState.currentFloor);
      
      // 3秒後に非表示
      const timer = setTimeout(() => {
        setShowFloorAnnouncement(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [gameState.currentFloor, prevFloor]);

  // 初期表示用
  useEffect(() => {
    setShowFloorAnnouncement(true);
    const timer = setTimeout(() => {
      setShowFloorAnnouncement(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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
    <div className="game-container">
      {showFloorAnnouncement && (
        <div className="floor-announcement">
          地下{gameState.currentFloor}階
        </div>
      )}
      <div>
        <div className="floor-title">
          <span role="img" aria-label="castle">🏰</span> 地下{gameState.currentFloor}階
        </div>
        <div className={`map-container ${
          gameState.currentFloor <= 3 ? 'dungeon-early' :
          gameState.currentFloor <= 6 ? 'dungeon-middle' :
          gameState.currentFloor <= 8 ? 'dungeon-late' :
          'dungeon-final'
        }`}>
          {gameState.map.map((row: Cell[], rowIndex: number) => (
            <div key={rowIndex} className="map-row">
              {row.map((cell: Cell, colIndex: number) => {
                const isPlayer =
                  gameState.player.x === colIndex &&
                  gameState.player.y === rowIndex;
                const monster = getMonsterAtPosition(colIndex, rowIndex);
                
                let content = '';
                if (cell.type === 'stairs' && cell.isVisible) {
                  content = '🚪';
                }

                // アイテムの表示処理
                const item = gameState.items.find(
                  item => item.position !== null &&
                         item.position.x === colIndex &&
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
                    className="map-cell"
                    data-type={cell.isVisible ? cell.type : 'hidden'}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="status-container">
        {/* ステータス表示 */}
        <div className="status-display">
          <h3 className="status-title">👤 ステータス</h3>
          <div>❤️ HP: {gameState.playerStatus.hp}/{gameState.playerStatus.maxHp}</div>
          <div>⭐️ Level: {gameState.playerStatus.level}</div>
          <div>📈 EXP: {gameState.playerStatus.exp}</div>
          <div>⚔️ Attack: {getPlayerPower(gameState.playerStatus, gameState).attack}</div>
          <div>🛡️ Defense: {getPlayerPower(gameState.playerStatus, gameState).defense}</div>
          
          <h3 style={{ margin: '15px 0', color: '#e74c3c' }}>🎒 インベントリ ({gameState.inventory.items.length}/{gameState.inventory.maxSize})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {gameState.inventory.items.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '5px',
                  backgroundColor: '#2c3e50',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  onClick={() => setGameState(prevState => applyItem(prevState, index))}
                >
                  {item.symbol} {item.isEquipped ? 'E ' : ''}{item.name}
                </div>
                {!item.isEquipped && (
                  <button
                    onClick={() => setGameState(prevState => dropItem(prevState, index))}
                    style={{
                      backgroundColor: '#c0392b',
                      border: 'none',
                      color: 'white',
                      padding: '2px 5px',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* バトルログ表示 */}
        <div className="battle-log">
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
        <div className="operation-instructions">
          <h3 style={{ margin: '0 0 15px 0', color: '#e74c3c' }}>🎮 操作方法</h3>
          <div>矢印キー: 上下左右移動</div>
          <div>テンキー: 斜め移動</div>
          <div>7️⃣8️⃣9️⃣</div>
          <div>4️⃣5️⃣6️⃣</div>
          <div>1️⃣2️⃣3️⃣</div>
        </div>
      </div>

      {gameState.isGameOver && (
        <div className="game-over">
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