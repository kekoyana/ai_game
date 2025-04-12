// src/components/PlayerHand.tsx
import React from 'react';
import { BuildingCard } from '../data/cards';

interface PlayerHandProps {
  hand: BuildingCard[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({ hand }) => {
  // 勝利点の表示を処理する関数
  const renderVP = (card: BuildingCard) => {
    if (typeof card.baseVP === 'function') {
      return '変動';
    }
    return card.baseVP;
  };

  // 建物の種類を日本語で表示
  const getBuildingType = (type: BuildingCard['type']) => {
    return type === 'production' ? '生産施設' : '都市施設';
  };

  // 生産施設の場合、生産する商品の種類を日本語で表示
  const getProductType = (card: BuildingCard) => {
    if (card.type !== 'production') return null;

    const productNames: Record<string, string> = {
      indigo: 'インディゴ',
      sugar: '砂糖',
      tobacco: 'タバコ',
      coffee: 'コーヒー',
      silver: 'シルバー'
    };

    return productNames[card.produces];
  };

  return (
    <div className="player-hand">
      <h4>手札 ({hand.length}枚)</h4>
      <ul className="card-list">
        {hand.map(card => (
          <li key={card.id} className="card">
            <h5>{card.name}</h5>
            <p>コスト: {card.cost}</p>
            <p>勝利点: {renderVP(card)}</p>
            <p>種類: {getBuildingType(card.type)}</p>
            {card.type === 'production' && (
              <p>生産: {getProductType(card)}</p>
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