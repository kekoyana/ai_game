// src/components/dialogs/BuildingActionDialog.tsx
import React, { useState } from 'react';
import { useGame, useGameActions } from '../../store/GameContext';
import { BuildingCard } from '../../data/cards';

interface BuildingActionDialogProps {
  onClose: () => void;
}

const BuildingActionDialog: React.FC<BuildingActionDialogProps> = ({ onClose }) => {
  const { state } = useGame();
  const actions = useGameActions();
  const humanPlayer = state.players.find(p => p.isHuman);

  // 選択状態の管理
  const [selectedBuildingCard, setSelectedBuildingCard] = useState<BuildingCard | null>(null);
  const [selectedPaymentCards, setSelectedPaymentCards] = useState<string[]>([]);
  const [selectedReplaceTarget, setSelectedReplaceTarget] = useState<string | null>(null);

  if (!humanPlayer) return null;

  // 特権による建設コスト削減を計算
  const hasBuilderPrivilege = state.currentPlayerId === humanPlayer.id;
  const hasSmithy = humanPlayer.buildings.some(b => b.cardDefId === 'smithy');
  const hasQuarry = humanPlayer.buildings.some(b => b.cardDefId === 'quarry');

  // 建設コストを計算する関数
  const calculateBuildingCost = (card: BuildingCard): number => {
    let cost = card.cost;
    // 建築士の特権による削減
    if (hasBuilderPrivilege) cost--;
    // 鍛冶屋による生産施設コスト削減
    if (hasSmithy && card.type === 'production') cost--;
    // 石切場による都市施設コスト削減
    if (hasQuarry && card.type === 'city') cost--;
    return Math.max(0, cost); // コストが0未満にならないようにする
  };

  // クレーンを所持しているか確認
  const hasCrane = humanPlayer.buildings.some(b => b.cardDefId === 'crane');

  // 建設実行
  const handleBuild = () => {
    if (!selectedBuildingCard || !humanPlayer) return;

    actions.buildBuilding(
      humanPlayer.id,
      selectedBuildingCard,
      selectedPaymentCards,
      selectedReplaceTarget || undefined
    );
    onClose();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog building-action-dialog">
        <h3>建物の建設</h3>

        {/* 建設する建物の選択 */}
        <div className="building-selection">
          <h4>建設する建物を選択</h4>
          <div className="card-list">
            {humanPlayer.hand.map(card => (
              <div
                key={card.id}
                className={`card ${selectedBuildingCard?.id === card.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedBuildingCard(card);
                  setSelectedPaymentCards([]); // 支払いカードの選択をリセット
                }}
              >
                <h5>{card.name}</h5>
                <p>コスト: {calculateBuildingCost(card)}</p>
                <p>種類: {card.type === 'production' ? '生産施設' : '都市施設'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 支払いに使用するカードの選択 */}
        {selectedBuildingCard && (
          <div className="payment-selection">
            <h4>
              支払いカードを選択 
              ({selectedPaymentCards.length}/{calculateBuildingCost(selectedBuildingCard)}枚)
            </h4>
            <div className="card-list">
              {humanPlayer.hand
                .filter(card => card.id !== selectedBuildingCard.id)
                .map(card => (
                  <div
                    key={card.id}
                    className={`card ${selectedPaymentCards.includes(card.id) ? 'selected' : ''}`}
                    onClick={() => {
                      const cost = calculateBuildingCost(selectedBuildingCard);
                      if (selectedPaymentCards.includes(card.id)) {
                        setSelectedPaymentCards(prev => prev.filter(id => id !== card.id));
                      } else if (selectedPaymentCards.length < cost) {
                        setSelectedPaymentCards(prev => [...prev, card.id]);
                      }
                    }}
                  >
                    <h5>{card.name}</h5>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* クレーンによる建て替え対象の選択 */}
        {selectedBuildingCard && hasCrane && (
          <div className="replace-selection">
            <h4>建て替える建物を選択（オプション）</h4>
            <div className="card-list">
              {humanPlayer.buildings.map(building => (
                <div
                  key={building.id}
                  className={`card ${selectedReplaceTarget === building.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedReplaceTarget(
                      selectedReplaceTarget === building.id ? null : building.id
                    );
                  }}
                >
                  <h5>{building.name}</h5>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="dialog-actions">
          <button 
            className="cancel-button"
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            className="action-button"
            disabled={
              !selectedBuildingCard ||
              selectedPaymentCards.length !== calculateBuildingCost(selectedBuildingCard)
            }
            onClick={handleBuild}
          >
            建設
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuildingActionDialog;