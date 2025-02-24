import React, { useEffect, useState, useCallback, useRef } from 'react'; // eslint-disable-line no-unused-vars
import { GameState, Direction, Cell, Monster } from './types/game';
import { createInitialGameState, movePlayer, applyItem, getPlayerPower, dropItem, getExpForNextLevel } from './game/gameLogic';
import './Game.css';

const Game: React.FC = () => {
  const width = 20;
  const height = 20;
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState(width, height)
  );
  const [showFloorAnnouncement, setShowFloorAnnouncement] = useState(true);
  const [prevFloor, setPrevFloor] = useState(1);
  const [showHelp, setShowHelp] = useState(false);
  const [battleLogFade, setBattleLogFade] = useState(true);
  /* eslint-disable-next-line no-unused-vars */
  const prevBattleLogLengthRef = useRef<number>(gameState.battleLogs.length);
  useEffect(() => {
    if (gameState.battleLogs.length > prevBattleLogLengthRef.current) {
      setBattleLogFade(false);
      const timer = setTimeout(() => {
        setBattleLogFade(true);
      }, 3000);
      prevBattleLogLengthRef.current = gameState.battleLogs.length;
      return () => clearTimeout(timer);
    } else {
      prevBattleLogLengthRef.current = gameState.battleLogs.length;
    }
  }, [gameState.battleLogs]);

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

      <div className={`battle-log ${battleLogFade ? "fade-out" : ""}`}>
        <div>
          {gameState.battleLogs.slice().reverse().map((log, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              {log.message}
            </div>
          ))}
        </div>
      </div>
      <div className="status-container">
        <div className="operation-container">
          <div className="button-group">
            <button className="help-button" onClick={() => setShowHelp(true)}>❔ 操作方法</button>
            <button className="logs-button" onClick={() => setBattleLogFade(prev => !prev)}>📜 ログ表示</button>
          </div>
          {showHelp && (
            <div className="operation-instructions">
              <button className="close-button" onClick={() => setShowHelp(false)}>×</button>
              <h3>🎮 操作方法</h3>
              <div>矢印キー: 上下左右移動</div>
              <div>テンキー: 斜め移動</div>
              <div>7️⃣8️⃣9️⃣</div>
              <div>4️⃣5️⃣6️⃣</div>
              <div>1️⃣2️⃣3️⃣</div>
            </div>
          )}
        </div>
        
        <div className="status-display">
          <h3 className="status-title">👤 ステータス</h3>
          <div className={`hp-status ${gameState.playerStatus.hp <= gameState.playerStatus.maxHp * 0.25 ? 'danger' : gameState.playerStatus.hp <= gameState.playerStatus.maxHp * 0.5 ? 'warning' : ''}`}>
            <div className="progress-bar hp-progress" style={{ width: `${(gameState.playerStatus.hp / gameState.playerStatus.maxHp) * 100}%` }} />
            <div className="status-text">❤️ HP: {gameState.playerStatus.hp}/{gameState.playerStatus.maxHp}</div>
          </div>
          <div className={`hp-status ${gameState.playerStatus.satiety <= gameState.playerStatus.maxSatiety * 0.25 ? 'danger' : gameState.playerStatus.satiety <= gameState.playerStatus.maxSatiety * 0.5 ? 'warning' : ''}`}>
            <div className="progress-bar satiety-progress" style={{ width: `${(gameState.playerStatus.satiety / gameState.playerStatus.maxSatiety) * 100}%` }} />
            <div className="status-text">🍖 満腹度: {Math.floor(gameState.playerStatus.satiety)}/{gameState.playerStatus.maxSatiety}</div>
          </div>
          <div>
            <div className="status-text">⭐️ Level: {gameState.playerStatus.level}</div>
          </div>
          <div>
            <div className="progress-bar exp-progress" style={{ width: `${(gameState.playerStatus.exp / getExpForNextLevel(gameState.playerStatus.level)) * 100}%` }} />
            <div className="status-text">📈 EXP: {gameState.playerStatus.exp}/{getExpForNextLevel(gameState.playerStatus.level)}</div>
          </div>
          <div>⚔️ Attack: {getPlayerPower(gameState.playerStatus, gameState).attack}</div>
          <div>🛡️ Defense: {getPlayerPower(gameState.playerStatus, gameState).defense}</div>
        </div>

        <div className="inventory-container">
          <h3>🎒 インベントリ ({gameState.inventory.items.length}/{gameState.inventory.maxSize})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {gameState.inventory.items.map((item, index) => (
              <div
                key={index}
                style={{ padding: '5px', backgroundColor: '#2c3e50', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onClick={() => setGameState(prevState => applyItem(prevState, index))}
                >
                  {item.symbol} {item.isEquipped ? 'E ' : ''}{item.name}
                </div>
                {!item.isEquipped && (
                  <button
                    onClick={() => setGameState(prevState => dropItem(prevState, index))}
                    style={{ backgroundColor: '#c0392b', border: 'none', color: 'white', padding: '2px 5px', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
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