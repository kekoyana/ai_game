import React, { useState, useEffect } from 'react';
import './App.css';
import { PlayerState, Role } from './store/gameStore';
import PlayerHand from './components/PlayerHand';
import PlayerBuildings from './components/PlayerBuildings';
import GameInfo from './components/GameInfo';
import Actions from './components/Actions';
import GameMessage from './components/GameMessage';
import CpuInfoDialog from './components/dialogs/CpuInfoDialog';
import { GameProvider, useGame } from './store/GameContext';
import { MessageProvider, useMessage } from './store/messageContext';

function GameContent() {
  const { state: gameState } = useGame();
  const { state: messageState, addMessage } = useMessage();
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedCpu, setSelectedCpu] = useState<PlayerState | null>(null);

  const humanPlayer = gameState.players.find((p: PlayerState) => p.isHuman);
  const cpuPlayers = gameState.players.filter((p: PlayerState) => !p.isHuman);

  // 前回のゲーム状態を保持
  const [prevGameState, setPrevGameState] = useState(gameState);
  
  // 役割名の定義
  const roleNames: Record<Role, string> = {
    builder: '建築士',
    producer: '監督',
    trader: '商人',
    councilor: '参事会議員',
    prospector: '金鉱掘り'
  };

  // CPUの行動を監視してメッセージを追加
  useEffect(() => {
    if (!humanPlayer) return;

    const lastCpuAction = gameState.lastCpuAction;
    if (lastCpuAction && (!prevGameState.lastCpuAction || lastCpuAction !== prevGameState.lastCpuAction)) {
      const roleName = roleNames[lastCpuAction.role];

      switch (lastCpuAction.type) {
        case 'select_role':
          addMessage({
            text: `CPU ${lastCpuAction.playerId}は${roleName}を選択しました`,
            type: 'cpu'
          });
          break;
        case 'build_success':
          addMessage({
            text: `CPU ${lastCpuAction.playerId}が建物を建設しました`,
            type: 'cpu'
          });
          break;
        case 'build_fail':
          addMessage({
            text: `CPU ${lastCpuAction.playerId}は建物を建設できませんでした`,
            type: 'cpu'
          });
          break;
        case 'produce':
          addMessage({
            text: `CPU ${lastCpuAction.playerId}が生産を行いました`,
            type: 'cpu'
          });
          break;
        case 'trade':
          addMessage({
            text: `CPU ${lastCpuAction.playerId}が商品を売却しました`,
            type: 'cpu'
          });
          break;
        case 'council':
          addMessage({
            text: `CPU ${lastCpuAction.playerId}がカードを引いて選択しました`,
            type: 'cpu'
          });
          break;
        case 'prospect':
          addMessage({
            text: `CPU ${lastCpuAction.playerId}が金鉱掘りでカードを1枚引きました`,
            type: 'cpu'
          });
          break;
        case 'prospect_fail':
          addMessage({
            text: `CPU ${lastCpuAction.playerId}は金鉱掘りの特権がないためカードを引けません`,
            type: 'cpu'
          });
          break;
      }
    }

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
            <div
              key={cpu.id}
              className="cpu-player-summary"
              onClick={() => setSelectedCpu(cpu)}
              style={{ cursor: 'pointer' }}
            >
              <h3>{cpu.id}</h3>
              <p>手札: {cpu.hand.length}枚</p>
              <p>建物: {cpu.buildings.length}個</p>
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

      {/* CPU情報モーダル */}
      {selectedCpu && (
        <CpuInfoDialog
          cpu={selectedCpu}
          onClose={() => setSelectedCpu(null)}
        />
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
