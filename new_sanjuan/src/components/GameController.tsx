import React, { useState, useEffect } from 'react';
import { GameState, RoleType } from '../types';
import { GameManager } from '../game/GameManager';
import './GameController.css';

// 役割カードの日本語名
const roleNames: Record<RoleType, string> = {
  [RoleType.BUILDER]: "建築家",
  [RoleType.COUNCILLOR]: "参事",
  [RoleType.PRODUCER]: "生産者",
  [RoleType.TRADER]: "商人",
  [RoleType.PROSPECTOR]: "金鉱掘り",
  [RoleType.CAPTAIN]: "船長",
  [RoleType.MAYOR]: "市長"
};

/**
 * ゲームコントローラーコンポーネント
 * ゲーム状態の管理、表示、操作を行う
 */
const GameController: React.FC = () => {
  // GameManagerインスタンスをuseStateで保持
  const [gameManager] = useState<GameManager>(() => new GameManager());
  // ゲーム状態をuseStateで管理
  const [gameState, setGameState] = useState<GameState | null>(null);
  // ログメッセージの配列
  const [logs, setLogs] = useState<string[]>([]);
  
  // GameManagerの状態変更を監視
  useEffect(() => {
    const handleGameStateChange = (newGameState: GameState) => {
      setGameState(newGameState);
      addLog(`フェーズ変更: ${newGameState.currentPhase}`);
    };
    
    gameManager.addChangeListener(handleGameStateChange);
    
    return () => {
      gameManager.removeChangeListener(handleGameStateChange);
    };
  }, [gameManager]);
  
  /**
   * ログメッセージを追加する関数
   * @param message ログメッセージ
   */
  const addLog = (message: string) => {
    setLogs(prevLogs => [...prevLogs, `${new Date().toLocaleTimeString()}: ${message}`]);
  };
  
  /**
   * ゲームを初期化する関数
   */
  const handleInitializeGame = () => {
    // プレイヤー名を指定（実際のアプリでは入力フォームから取得する）
    const playerNames = ['プレイヤー1', 'プレイヤー2', 'プレイヤー3'];
    
    // ゲーム初期化
    gameManager.initializeGame(playerNames);
    
    // ログに記録
    addLog(`${playerNames.length}人プレイヤーでゲームを開始しました`);
    addLog(`ラウンド1開始: 役割を選択してください`);
  };
  
  /**
   * 役割を選択する処理
   * @param role 選択する役割
   */
  const handleRoleSelection = (role: RoleType) => {
    if (!gameState) {
      addLog('ゲームが初期化されていません');
      return;
    }
    
    // 現在の手番プレイヤー
    const currentPlayerIndex = gameState.currentTurnPlayerIndex;
    
    // 役割選択処理を実行
    gameManager.selectRole(currentPlayerIndex, role);
    
    // ログに記録
    addLog(`プレイヤー${currentPlayerIndex + 1}が役割「${roleNames[role]}」を選択しました`);
  };
  
  /**
   * 役割選択をパスする処理
   */
  const handlePassRoleSelection = () => {
    if (!gameState) {
      addLog('ゲームが初期化されていません');
      return;
    }
    
    // 現在の手番プレイヤー
    const currentPlayerIndex = gameState.currentTurnPlayerIndex;
    
    // パス処理を実行
    gameManager.selectRole(currentPlayerIndex, null);
    
    // ログに記録
    addLog(`プレイヤー${currentPlayerIndex + 1}が役割選択をパスしました`);
  };
  
  /**
   * 現在の手番プレイヤーかどうかを判定する
   */
  const isCurrentTurnPlayer = (playerIndex: number): boolean => {
    return gameState?.currentTurnPlayerIndex === playerIndex;
  };
  
  /**
   * プレイヤーの手札情報を表示するコンポーネント
   */
  const PlayerHandInfo: React.FC<{ playerIndex: number }> = ({ playerIndex }) => {
    if (!gameState) return null;
    
    const player = gameState.players[playerIndex];
    const isTurn = isCurrentTurnPlayer(playerIndex);
    const isRolePlayer = gameState.currentRolePlayerIndex === playerIndex;
    
    const playerClassNames = [
      'player-hand-info',
      isTurn ? 'current-turn' : '',
      isRolePlayer ? 'role-player' : ''
    ].filter(Boolean).join(' ');
    
    return (
      <div className={playerClassNames}>
        <h3>
          {player.name} 
          {player.isGovernor && <span className="governor-icon">👑</span>} 
          {isTurn && <span className="turn-icon">🎲</span>} 
          {isRolePlayer && <span className="role-icon">⭐</span>}
          {player.hasPassed && <span className="pass-icon">⏭️</span>}
        </h3>
        <p>手札: {player.hand.length}枚</p>
        <div className="hand-cards">
          {player.hand.map((card, idx) => (
            <div key={idx} className="card-info">
              {card.name} (コスト: {card.cost})
            </div>
          ))}
        </div>
        <p>建物: {player.buildings.length}件</p>
        <div className="buildings">
          {player.buildings.map((building, idx) => (
            <div key={idx} className="building-info">
              {building.card.name}
            </div>
          ))}
        </div>
        <p>コイン: {player.coins}</p>
      </div>
    );
  };
  
  /**
   * 役割カード情報を表示するコンポーネント
   */
  const RoleCardsInfo: React.FC = () => {
    if (!gameState) return null;
    
    // フェーズが役割選択中であるかを確認
    const isRoleSelectionPhase = gameState.currentPhase === "役割選択中" || gameState.currentPhase === "ラウンド開始";
    
    // 現在の手番プレイヤー
    const currentPlayerIndex = gameState.currentTurnPlayerIndex;
    const currentPlayer = gameState.players[currentPlayerIndex];
    
    return (
      <div className="role-cards-info">
        <h3>役割カード</h3>
        {isRoleSelectionPhase && (
          <div className="current-player-info">
            <p>プレイヤー{currentPlayerIndex + 1} ({currentPlayer.name})の手番です</p>
            <button 
              className="pass-button"
              onClick={handlePassRoleSelection}
            >
              パスする
            </button>
          </div>
        )}
        <div className="role-cards">
          {gameState.roleCards.map((card, idx) => {
            const isAvailable = card.isAvailable && isRoleSelectionPhase;
            const roleCardClass = isAvailable ? 'role-card available' : 'role-card used';
            
            return (
              <div 
                key={idx} 
                className={roleCardClass}
                onClick={() => isAvailable && handleRoleSelection(card.role)}
              >
                <div className="role-name">{roleNames[card.role]}</div>
                {card.bonusCoins > 0 && (
                  <div className="bonus-coins">
                    +{card.bonusCoins}コイン
                  </div>
                )}
                {!card.isAvailable && <div className="used-indicator">使用済み</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  /**
   * ゲーム状態の概要を表示するコンポーネント
   */
  const GameStateInfo: React.FC = () => {
    if (!gameState) return null;
    
    return (
      <div className="game-state-info">
        <h3>ゲーム状態</h3>
        <p><strong>ラウンド:</strong> {gameState.round}</p>
        <p><strong>現在のフェーズ:</strong> {gameState.currentPhase}</p>
        <p><strong>選択された役割:</strong> {gameState.selectedRole ? roleNames[gameState.selectedRole] : 'なし'}</p>
        <p><strong>山札:</strong> {gameState.drawPile.length}枚</p>
        <p><strong>捨て札:</strong> {gameState.discardPile.length}枚</p>
      </div>
    );
  };
  
  return (
    <div className="game-controller">
      <h2>サンファン ゲームコントローラー</h2>
      
      {/* ゲーム制御ボタン */}
      <div className="control-buttons">
        <button 
          className="init-button"
          onClick={handleInitializeGame}
        >
          ゲームを初期化
        </button>
      </div>
      
      {/* ゲーム状態の表示 */}
      {gameState ? (
        <div className="game-display">
          <GameStateInfo />
          
          <RoleCardsInfo />
          
          <h3 className="players-section-title">プレイヤー情報</h3>
          <div className="players-info">
            {gameState.players.map((_, idx) => (
              <PlayerHandInfo key={idx} playerIndex={idx} />
            ))}
          </div>
          
          {/* ログ表示 */}
          <div className="game-logs">
            <h3>ゲームログ</h3>
            <div className="logs-container">
              {logs.map((log, idx) => (
                <div key={idx} className="log-entry">
                  {log}
                </div>
              ))}
            </div>
          </div>
          
          {/* デバッグ用の完全なゲーム状態の表示 */}
          <details className="debug-details">
            <summary className="debug-summary">
              詳細なゲーム状態（デバッグ用）
            </summary>
            <pre className="debug-content">
              {JSON.stringify(gameState, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div className="not-initialized">
          <p>ゲームが初期化されていません。「ゲームを初期化」ボタンをクリックしてください。</p>
        </div>
      )}
    </div>
  );
};

export default GameController; 