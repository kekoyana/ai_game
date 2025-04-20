import { useState } from 'react';
import { GameState, PlayerState } from '../types';
import { sampleGame } from '../data/sampleGame';

// プレイヤー情報コンポーネント
const PlayerInfo: React.FC<{ player: PlayerState }> = ({ player }) => {
  return (
    <div className="player-info">
      <h3>{player.name} {player.isGovernor && '👑'}</h3>
      <p>手札: {player.hand.length}枚</p>
      <p>建物: {player.buildings.length}件</p>
      <p>生産物: {player.goods.length}個</p>
      <p>勝利点: {player.victoryPoints}点</p>
      <p>資金: {player.money}ドル</p>
      {player.currentRole && <p>役割: {player.currentRole}</p>}
    </div>
  );
};

// ゲームボードコンポーネント
const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(sampleGame);

  return (
    <div className="game-board">
      <h2>サンファン - ラウンド {gameState.round}</h2>
      
      <div className="game-info">
        <p>フェーズ: {gameState.currentPhase}</p>
        <p>選択された役割: {gameState.selectedRole || 'なし'}</p>
      </div>
      
      <div className="available-buildings">
        <h3>利用可能な建物</h3>
        <ul>
          {gameState.availableBuildings.map(building => (
            <li key={building.id}>
              {building.name} (コスト: {building.cost}, 勝利点: {building.victoryPoints})
            </li>
          ))}
        </ul>
      </div>
      
      <div className="market-prices">
        <h3>市場価格</h3>
        <ul>
          {Object.entries(gameState.marketPrices).map(([good, price]) => (
            <li key={good}>{good}: {price}ドル</li>
          ))}
        </ul>
      </div>
      
      <div className="players">
        <h3>プレイヤー</h3>
        {gameState.players.map(player => (
          <PlayerInfo key={player.id} player={player} />
        ))}
      </div>
      
      <div className="game-status">
        <p>山札残り: {gameState.drawPile.length}枚</p>
        <p>捨て札: {gameState.discardPile.length}枚</p>
      </div>
    </div>
  );
};

export default GameBoard; 