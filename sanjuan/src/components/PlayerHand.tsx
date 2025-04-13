// src/components/PlayerHand.tsx
import React from 'react';
import { useGame } from '../store/GameContext';
import { BuildingCard } from '../data/cards';

const PlayerHand: React.FC = () => {
  const { state } = useGame();
  const humanPlayer = state.players.find(p => p.isHuman);

  if (!humanPlayer) {
    return null;
  }

  // 勝利点の表示を処理する関数
  const renderVP = (vp: BuildingCard['baseVP']) => {
    if (typeof vp === 'function') {
      return '変動';
    }
    return vp;
  };

  // 建物の種類を日本語で表示
  const getBuildingType = (type: 'production' | 'city') => {
    return type === 'production' ? '生産施設' : '都市施設';
  };

  // 生産施設の場合、生産する商品の種類を日本語で表示
  const getProductType = (produces: string): string => {
    const productNames: Record<string, string> = {
      indigo: 'インディゴ',
      sugar: '砂糖',
      tobacco: 'タバコ',
      coffee: 'コーヒー',
      silver: 'シルバー'
    };

    return productNames[produces] || produces;
  };

  return (
    <div className="player-hand">
      <h4>手札 ({humanPlayer.hand.length}枚)</h4>
      <ul className="card-list">
        {humanPlayer.hand.map(card => (
          <li key={card.id} className="card">
            <h5>{card.name}</h5>
            <p>コスト: {card.cost}</p>
            <p>勝利点: {renderVP(card.baseVP)}</p>
            <p>種類: {getBuildingType(card.type)}</p>
            {card.type === 'production' && (
              <p>生産: {getProductType(card.produces)}</p>
            )}
            {card.type === 'city' && card.effectDescription && (
              <p className="effect">効果: {card.effectDescription}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerHand;