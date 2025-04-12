// src/components/GameInfo.tsx
import React from 'react';
import { GameState } from '../store/gameStore';
import { Role } from '../store/gameStore';

interface GameInfoProps {
  gameState: GameState;
}

// 役割名を日本語に変換
const roleNames: Record<Role, string> = {
  builder: '建築士',
  producer: '監督',
  trader: '商人',
  councilor: '参事会議員',
  prospector: '金鉱掘り'
};

// ゲームフェーズを日本語に変換
const phaseNames: Record<GameState['gamePhase'], string> = {
  role_selection: '役割選択',
  action: 'アクション実行',
  end_round: 'ラウンド終了',
  game_over: 'ゲーム終了'
};

const GameInfo: React.FC<GameInfoProps> = ({ gameState }) => {
  const {
    deck,
    discardPile,
    tradingHouseTiles,
    currentTradingHouseTile,
    governorPlayerId,
    currentPlayerId,
    selectedRole,
    gamePhase,
    currentRoundRoles,
  } = gameState;

  // 商品価格の表示用ヘルパー関数
  const renderTradingHousePrices = () => {
    if (!currentTradingHouseTile) return null;

    const productNames: Record<string, string> = {
      indigo: 'インディゴ',
      sugar: '砂糖',
      tobacco: 'タバコ',
      coffee: 'コーヒー',
      silver: 'シルバー'
    };

    return (
      <div className="trading-house-prices">
        <h5>商館タイルの価格</h5>
        <ul>
          {Object.entries(currentTradingHouseTile.prices).map(([product, price]) => (
            <li key={product}>
              {productNames[product]}: {price}枚
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="game-info">
      <div className="game-status">
        <h4>ゲーム状況</h4>
        <p>フェーズ: <span className="highlight">{phaseNames[gamePhase]}</span></p>
        <p>総督: <span className="highlight">{governorPlayerId}</span></p>
        <p>現在の手番: <span className="highlight">{currentPlayerId}</span></p>
      </div>

      <div className="deck-info">
        <h4>カード情報</h4>
        <p>山札: {deck.length}枚</p>
        <p>捨て札: {discardPile.length}枚</p>
        <p>商館タイル残り: {tradingHouseTiles.length}枚</p>
      </div>

      <div className="role-info">
        <h4>役割情報</h4>
        <p>選択中の役割: {selectedRole ? roleNames[selectedRole] : 'なし'}</p>
        <div className="used-roles">
          <p>使用済みの役割:</p>
          <ul>
            {currentRoundRoles.map(role => (
              <li key={role}>{roleNames[role]}</li>
            ))}
          </ul>
        </div>
      </div>

      {currentTradingHouseTile && (
        <div className="trading-house">
          {renderTradingHousePrices()}
        </div>
      )}
    </div>
  );
};

export default GameInfo;