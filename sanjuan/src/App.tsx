import './App.css';
import { PlayerState } from './store/gameStore';
import PlayerHand from './components/PlayerHand';
import PlayerBuildings from './components/PlayerBuildings';
import GameInfo from './components/GameInfo';
import Actions from './components/Actions';
import { GameProvider, useGame } from './store/GameContext';

function GameContent() {
  const { state: gameState } = useGame();

  // TODO: ゲームロジックと状態更新関数を実装

  const humanPlayer = gameState.players.find((p: PlayerState) => p.isHuman);
  const cpuPlayers = gameState.players.filter((p: PlayerState) => !p.isHuman);

  if (!humanPlayer) {
    return <div>Error: Human player not found!</div>;
  }

  return (
    <div className="app">
      <h1>サンファン</h1>

      {/* ゲーム情報表示エリア */}
      <GameInfo />

      {/* CPUプレイヤー表示エリア (簡易) */}
      <div className="cpu-players-area">
        {cpuPlayers.map((cpu: PlayerState) => (
          <div key={cpu.id} className="cpu-player-summary">
            <h3>{cpu.id}</h3>
            <p>手札: {cpu.hand.length}枚</p>
            <p>建物: {cpu.buildings.length}個</p>
            {/* TODO: 商品数なども表示 */}
          </div>
        ))}
      </div>

      {/* プレイヤー操作エリア */}
      <div className="player-area">
        <h2>あなた ({humanPlayer.id})</h2>
        <PlayerHand />
        <PlayerBuildings />
      </div>

      {/* アクション選択/実行エリア */}
      <Actions />

      {/* デバッグ用: ゲーム状態表示 */}
      {/* <pre>{JSON.stringify(gameState, null, 2)}</pre> */}
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
