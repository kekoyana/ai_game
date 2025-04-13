// src/components/dialogs/TraderActionDialog.tsx
import React, { useState } from 'react';
import { useGame, useGameActions } from '../../store/GameContext';
import { useMessage } from '../../store/messageContext';

interface TraderActionDialogProps {
  onClose: () => void;
}

// 商品名を日本語に変換
const productNames: Record<string, string> = {
  indigo: 'インディゴ',
  sugar: '砂糖',
  tobacco: 'タバコ',
  coffee: 'コーヒー',
  silver: 'シルバー'
};

const TraderActionDialog: React.FC<TraderActionDialogProps> = ({ onClose }) => {
  const { state } = useGame();
  const actions = useGameActions();
  const { addMessage } = useMessage();
  const humanPlayer = state.players.find(p => p.isHuman);

  // 選択された建物のID（商品を売却する建物）
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<string[]>([]);

  if (!humanPlayer || !state.currentTradingHouseTile) return null;

  // 特権による追加の売却数
  const hasPrivilege = state.currentPlayerId === humanPlayer.id;
  const hasTradingPost = humanPlayer.buildings.some(b => b.cardDefId === 'trading_post');
  
  // 売却可能な最大数を計算
  const baseTradeCount = 1; // 基本は1つ
  const extraTradeCount = (hasTradingPost ? 1 : 0); // 交易所による追加
  const maxTradeCount = baseTradeCount + extraTradeCount;

  // 売却可能な建物を取得（商品が置かれている生産施設）
  const availableBuildings = humanPlayer.buildings.filter(building => 
    building.type === 'production' && humanPlayer.goods[building.id]
  );

  // 現在の選択で得られるカードの総数を計算
  const totalCards = selectedBuildingIds.reduce((sum, buildingId) => {
    const building = availableBuildings.find(b => b.id === buildingId);
    if (building?.type === 'production') {
      return sum + (state.currentTradingHouseTile?.prices[building.produces] || 0);
    }
    return sum;
  }, 0);

  // 建物の選択を切り替え
  const toggleBuildingSelection = (buildingId: string) => {
    if (selectedBuildingIds.includes(buildingId)) {
      setSelectedBuildingIds(prev => prev.filter(id => id !== buildingId));
    } else if (selectedBuildingIds.length < maxTradeCount) {
      setSelectedBuildingIds(prev => [...prev, buildingId]);
    }
  };

  // 売却を実行
  const handleTrade = () => {
    if (!humanPlayer) return;

    // 売却する商品の情報を収集
    const soldGoods = selectedBuildingIds.map(buildingId => {
      const building = availableBuildings.find(b => b.id === buildingId);
      if (building?.type === 'production') {
        return {
          name: productNames[building.produces],
          price: state.currentTradingHouseTile!.prices[building.produces]
        };
      }
      return null;
    }).filter(Boolean);

    actions.tradeGoods(
      humanPlayer.id,
      selectedBuildingIds
    );

    // メッセージを生成
    const messageLines = [
      `あなたは以下の商品を売却しました：`,
      ...soldGoods.map(good =>
        `・${good!.name}（${good!.price}枚）`
      ),
      `合計${totalCards}枚のカードを獲得しました`
    ];

    addMessage({
      text: messageLines.join('\n'),
      type: 'action'
    });

    onClose();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog trader-action-dialog">
        <h3>
          商人のアクション
          {hasPrivilege && <span className="privilege">特権あり</span>}
        </h3>

        {/* 現在の商館タイル価格表 */}
        <div className="trading-house-prices">
          <h4>現在の価格表</h4>
          <div className="price-list">
            {Object.entries(state.currentTradingHouseTile.prices).map(([product, price]) => (
              <div key={product} className="price-item">
                <span className="product-name">{productNames[product]}</span>
                <span className="price-value">{price}枚</span>
              </div>
            ))}
          </div>
        </div>

        {/* 売却可能な商品リスト */}
        <div className="available-goods">
          <h4>
            売却する商品を選択
            ({selectedBuildingIds.length}/{maxTradeCount}商品を売却)
          </h4>
          
          {availableBuildings.length === 0 ? (
            <p className="no-goods">売却可能な商品がありません</p>
          ) : (
            <div className="building-list">
              {availableBuildings.map(building => (
                building.type === 'production' && (
                  <div
                    key={building.id}
                    className={`building-card ${selectedBuildingIds.includes(building.id) ? 'selected' : ''}`}
                    onClick={() => toggleBuildingSelection(building.id)}
                  >
                    <h5>{building.name}</h5>
                    <p>商品: {productNames[building.produces]}</p>
                    <p className="price">
                      価格: {state.currentTradingHouseTile!.prices[building.produces]}枚
                    </p>
                    <div className="goods-slot filled">
                      商品あり
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* 獲得カード数の表示 */}
        {selectedBuildingIds.length > 0 && (
          <div className="trade-summary">
            <p>売却後に獲得するカード: {totalCards}枚</p>
          </div>
        )}

        <div className="dialog-actions">
          <button 
            className="cancel-button"
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            className="action-button"
            disabled={selectedBuildingIds.length === 0}
            onClick={handleTrade}
          >
            売却
          </button>
        </div>
      </div>
    </div>
  );
};

export default TraderActionDialog;