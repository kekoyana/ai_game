// src/components/dialogs/CouncilorActionDialog.tsx
import React, { useState } from 'react';
import { useGame, useGameActions } from '../../store/GameContext';
import { BuildingCard } from '../../data/cards';

interface CouncilorActionDialogProps {
  drawnCards: BuildingCard[];
  onClose: () => void;
}

const CouncilorActionDialog: React.FC<CouncilorActionDialogProps> = ({ 
  drawnCards,
  onClose 
}) => {
  const { state } = useGame();
  const actions = useGameActions();
  const humanPlayer = state.players.find(p => p.isHuman);

  // 選択状態の管理
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  if (!humanPlayer) return null;

  // 特権による追加の保持枚数
  const hasPrivilege = state.currentPlayerId === humanPlayer.id;
  const hasPrefecture = humanPlayer.buildings.some(b => b.cardDefId === 'prefecture');
  
  // 保持できる枚数を計算
  const baseKeepCount = 1; // 基本は1枚
  const extraKeepCount = (hasPrefecture ? 1 : 0); // 知事官舎による追加
  const maxKeepCount = baseKeepCount + extraKeepCount;

  // カード選択の切り替え
  const toggleCardSelection = (cardId: string) => {
    if (selectedCardIds.includes(cardId)) {
      setSelectedCardIds(prev => prev.filter(id => id !== cardId));
    } else if (selectedCardIds.length < maxKeepCount) {
      setSelectedCardIds(prev => [...prev, cardId]);
    }
  };

  // 選択を確定
  const handleConfirm = () => {
    if (!humanPlayer) return;

    // 選択されなかったカードは捨て札へ
    const discardCardIds = drawnCards
      .map(card => card.id)
      .filter(id => !selectedCardIds.includes(id));

    actions.keepCouncilCards(
      humanPlayer.id,
      selectedCardIds,
      discardCardIds
    );
    onClose();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog councilor-action-dialog">
        <h3>
          参事会議員のアクション
          {hasPrivilege && <span className="privilege">特権あり</span>}
        </h3>

        <div className="drawn-cards">
          <h4>
            カードを選択 
            ({selectedCardIds.length}/{maxKeepCount}枚を手札に加える)
          </h4>
          <div className="card-list">
            {drawnCards.map(card => (
              <div
                key={card.id}
                className={`card ${selectedCardIds.includes(card.id) ? 'selected' : ''}`}
                onClick={() => toggleCardSelection(card.id)}
              >
                <h5>{card.name}</h5>
                <p>コスト: {card.cost}</p>
                <p>種類: {card.type === 'production' ? '生産施設' : '都市施設'}</p>
                {card.type === 'production' && (
                  <p>生産: {card.produces}</p>
                )}
                {card.type === 'city' && card.effectDescription && (
                  <p className="effect">効果: {card.effectDescription}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="dialog-actions">
          <button 
            className="cancel-button"
            onClick={onClose}
          >
            キャンセル
          </button>
          <button
            className="action-button"
            disabled={selectedCardIds.length !== maxKeepCount}
            onClick={handleConfirm}
          >
            確定
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouncilorActionDialog;