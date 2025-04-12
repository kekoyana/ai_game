// src/components/PlayerBuildings.tsx
import React from 'react';
import { BuildingCard } from '../data/cards';
import { PlayerState } from '../store/gameStore';

interface PlayerBuildingsProps {
  buildings: BuildingCard[];
  goods: PlayerState['goods'];
}

const PlayerBuildings: React.FC<PlayerBuildingsProps> = ({ buildings, goods }) => {
  // 勝利点の表示を処理する関数
  const renderVP = (card: BuildingCard) => {
    if (typeof card.baseVP === 'function') {
      return '変動';
    }
    return card.baseVP;
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

  // 生産施設と都市施設を分類
  const productionBuildings = buildings.filter(b => b.type === 'production');
  const cityBuildings = buildings.filter(b => b.type === 'city');

  return (
    <div className="player-buildings">
      <h4>建設済み建物 ({buildings.length}個)</h4>
      
      {/* 生産施設 */}
      <div className="buildings-section">
        <h5>生産施設 ({productionBuildings.length}個)</h5>
        <ul className="card-list">
          {productionBuildings.map(building => (
            <li key={building.id} className="card production-building">
              <h5>{building.name}</h5>
              <p>コスト: {building.cost}</p>
              <p>勝利点: {renderVP(building)}</p>
              <p>生産: {getProductType(building)}</p>
              <div className="goods-slot">
                {goods[building.id] ? (
                  <div className="good-card">
                    商品あり
                  </div>
                ) : (
                  <div className="empty-slot">
                    空きスロット
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 都市施設 */}
      <div className="buildings-section">
        <h5>都市施設 ({cityBuildings.length}個)</h5>
        <ul className="card-list">
          {cityBuildings.map(building => (
            <li key={building.id} className="card city-building">
              <h5>{building.name}</h5>
              <p>コスト: {building.cost}</p>
              <p>勝利点: {renderVP(building)}</p>
              {building.effectDescription && (
                <p className="effect">効果: {building.effectDescription}</p>
              )}
              {building.monumentType && (
                <p className="monument-type">記念施設</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayerBuildings;