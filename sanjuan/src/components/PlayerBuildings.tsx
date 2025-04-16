// src/components/PlayerBuildings.tsx
import React from 'react';
import { useGame } from '../store/GameContext';
import { BuildingCard } from '../data/cards';

const PlayerBuildings: React.FC = () => {
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

  // 生産施設と都市施設を分類
  const productionBuildings = humanPlayer.buildings.filter(b => b.type === 'production');
  const cityBuildings = humanPlayer.buildings.filter(b => b.type === 'city');

  return (
    <div className="player-buildings">
      <h4>建設済み建物 ({humanPlayer.buildings.length})</h4>
      
      {/* 生産施設 */}
      <div className="buildings-section">
        <ul className="card-list">
          {productionBuildings.map(building => (
            <li key={building.id} className="card production-building">
              <h5>{building.name}</h5>
              <p>コスト: {building.cost}</p>
              <p>勝利点: {renderVP(building.baseVP)}</p>
              <p>生産: {getProductType(building.produces)}</p>
              <div className="goods-slot">
                {humanPlayer.goods[building.id] ? (
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
        <ul className="card-list">
          {cityBuildings.map(building => (
            <li key={building.id} className="card city-building">
              <h5>{building.name}</h5>
              <p>コスト: {building.cost}</p>
              <p>勝利点: {renderVP(building.baseVP)}</p>
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
