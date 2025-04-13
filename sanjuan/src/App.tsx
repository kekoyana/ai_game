import React, { useState, useEffect } from 'react'; // useState, useEffect をインポート
import './App.css';
import { PlayerState } from './store/gameStore';
import PlayerHand from './components/PlayerHand';
import PlayerBuildings from './components/PlayerBuildings';
import GameInfo from './components/GameInfo';
import Actions from './components/Actions'; // Actions を再度使用する
import { GameProvider, useGame } from './store/GameContext';

function GameContent() {
  const { state: gameState } = useGame();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false); // モーダル表示状態

  // TODO: ゲームロジックと状態更新関数を実装

  const humanPlayer = gameState.players.find((p: PlayerState) => p.isHuman);
  const cpuPlayers = gameState.players.filter((p: PlayerState) => !p.isHuman);

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
        <h2>あなた ({humanPlayer.id}) の施設</h2>
        <PlayerBuildings />
      </div>

      {/* 相手プレイヤーエリア (右上) */}
      <div className="opponent-area">
        <h2>相手プレイヤー</h2>
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
        <h2>メッセージ</h2>
        {/* TODO: ゲームメッセージ表示 */}
        {/* Actionsコンポーネントは削除し、モーダルで表示するように変更 */}
      </div>

      {/* 手札エリア (下) */}
      <div className="player-hand-area">
        <h2>あなたの手札</h2>
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
      <GameContent />
    </GameProvider>
  );
}

export default App;
