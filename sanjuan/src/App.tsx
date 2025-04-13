import React, { useState, useEffect } from 'react';
import './App.css';
import { PlayerState, Role } from './store/gameStore';
import PlayerHand from './components/PlayerHand';
import PlayerBuildings from './components/PlayerBuildings';
import GameInfo from './components/GameInfo';
import Actions from './components/Actions';
import GameMessage from './components/GameMessage';
import { GameProvider, useGame } from './store/GameContext';
import { MessageProvider, useMessage } from './store/messageContext';

function GameContent() {
  const { state: gameState } = useGame();
  const { state: messageState, addMessage } = useMessage();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const humanPlayer = gameState.players.find((p: PlayerState) => p.isHuman);
  const cpuPlayers = gameState.players.filter((p: PlayerState) => !p.isHuman);

  // 前回のゲーム状態を保持
  const [prevGameState, setPrevGameState] = useState(gameState);
  
  // ゲーム状態の変更を監視してメッセージを追加
  useEffect(() => {
    if (!humanPlayer) return;

    const roleNames: Record<Role, string> = {
      builder: '建築士',
      producer: '監督',
      trader: '商人',
      councilor: '参事会議員',
      prospector: '金鉱掘り'
    };

    // CPU プレイヤーの役割選択時のメッセージ
    if (gameState.selectedRole && gameState.selectedRole !== prevGameState.selectedRole) {
      const isHumanPlayer = gameState.currentPlayerId === humanPlayer.id;
      // 人間プレイヤーの場合はActionsコンポーネントで処理するためスキップ
      if (!isHumanPlayer) {
        addMessage({
          text: `プレイヤー${gameState.currentPlayerId}は${roleNames[gameState.selectedRole]}を選択しました`,
          type: 'cpu'
        });
      }
    }

    // 現在のゲーム状態を保存
    setPrevGameState(gameState);
  }, [gameState, prevGameState, humanPlayer, addMessage]);

  // TODO: ゲームロジックと状態更新関数を実装

  // ゲーム状態に基づいてアクションモーダルを開閉するロジック (Hooksはトップレベルで呼び出す)
  useEffect(() => {
    // humanPlayer が見つからない場合は何もしない
    if (!humanPlayer) {
      setIsActionModalOpen(false);
      return;
    }

    const isHumanPlayerTurn = gameState.currentPlayerId === humanPlayer.id;
    const needsAction =
      (gameState.gamePhase === 'role_selection' && isHumanPlayerTurn) ||
      (gameState.gamePhase === 'action' && isHumanPlayerTurn && gameState.selectedRole !== null); // アクション実行フェーズも考慮 (必要に応じて調整)
      // TODO: 他のアクションが必要な条件を追加 (例: 建築フェーズでのカード選択など)

    setIsActionModalOpen(needsAction);
  }, [gameState.gamePhase, gameState.currentPlayerId, gameState.selectedRole, humanPlayer]); // humanPlayer も依存配列に追加

  // humanPlayer が見つからない場合はエラー表示
  if (!humanPlayer) {
    return <div>Error: Human player not found!</div>;
  }

  return (
    <div className="app-grid">
      {/* ゲーム情報表示ボタン */}
      <GameInfo />

      {/* プレイヤー施設エリア (左上) */}
      <div className="player-buildings-area">
        <PlayerBuildings />
      </div>

      {/* 相手プレイヤーエリア (右上) */}
      <div className="opponent-area">
        <div className="cpu-players-container">
          {cpuPlayers.map((cpu: PlayerState) => (
            <div key={cpu.id} className="cpu-player-summary">
              <h3>{cpu.id}</h3>
              <p>手札: {cpu.hand.length}枚</p>
              <p>建物: {cpu.buildings.length}個</p>
              {/* TODO: 商品数なども表示 */}
            </div>
          ))}
        </div>
      </div>

      {/* メッセージエリア (中央) */}
      <div className="message-area">
        <GameMessage messages={messageState.messages} />
        {/* Actionsコンポーネントは削除し、モーダルで表示するように変更 */}
      </div>

      {/* 手札エリア (下) */}
      <div className="player-hand-area">
        <PlayerHand />
      </div>

      {/* デバッグ用: ゲーム状態表示 */}
      {/* <pre>{JSON.stringify(gameState, null, 2)}</pre> */}

      {/* アクションモーダル */}
      {isActionModalOpen && (
        <div className="dialog-overlay">
          <div className="dialog action-modal"> {/* action-modal クラスを追加 */}
            {/* モーダルのタイトルはActionsコンポーネント内で管理する方が良いかも */}
            {/* <h2>アクションを選択してください</h2> */}
            <Actions />
            {/* TODO: モーダルを閉じるボタンや条件を追加（例: アクション完了時） */}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <MessageProvider>
        <GameContent />
      </MessageProvider>
    </GameProvider>
  );
}

export default App;
