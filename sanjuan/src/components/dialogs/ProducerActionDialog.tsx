// src/components/dialogs/ProducerActionDialog.tsx
import React, { useState } from 'react';
import { useGame, useGameActions } from '../../store/GameContext';

interface ProducerActionDialogProps {
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

const ProducerActionDialog: React.FC<ProducerActionDialogProps> = ({ onClose }) => {
  const { state } = useGame();
  const actions = useGameActions();
  const humanPlayer = state.players.find(p => p.isHuman);

  // 選択された生産施設のID
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<string[]>([]);

  if (!humanPlayer) return null;

  // 特権による追加の生産数
  const hasPrivilege = state.currentPlayerId === humanPlayer.id;
  const hasAqueduct = humanPlayer.buildings.some(b => b.cardDefId === 'aqueduct');
  
  // 生産可能な最大数を計算
  const baseProductionCount = 1; // 基本は1つ
  const extraProductionCount = (hasAqueduct ? 1 : 0); // 水道による追加
  const maxProductionCount = baseProductionCount + extraProductionCount;

  // 生産可能な施設を取得（商品が置かれていない生産施設）
  const availableBuildings = humanPlayer.buildings.filter(building => 
    building.type === 'production' && !humanPlayer.goods[building.id]
  );

  // 施設の選択を切り替え
  const toggleBuildingSelection = (buildingId: string) => {
    if (selectedBuildingIds.includes(buildingId)) {
      setSelectedBuildingIds(prev => prev.filter(id => id !== buildingId));
    } else if (selectedBuildingIds.length < maxProductionCount) {
      setSelectedBuildingIds(prev => [...prev, buildingId]);
    }
  };

  // 生産を実行
  const handleProduce = () => {
    if (!humanPlayer) return;

    actions.produceGoods(
      humanPlayer.id,
      selectedBuildingIds
    );
    onClose();
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog producer-action-dialog">
        <h3>
          監督のアクション
          {hasPrivilege && <span className="privilege">特権あり</span>}
        </h3>

        <div className="production-buildings">
          <h4>
            生産する施設を選択 
            ({selectedBuildingIds.length}/{maxProductionCount}施設で生産)
          </h4>
          
          {availableBuildings.length === 0 ? (
            <p className="no-buildings">生産可能な施設がありません</p>
          ) : (
            <div className="building-list">
              {availableBuildings.map(building => (
                <div
                  key={building.id}
                  className={`building-card ${selectedBuildingIds.includes(building.id) ? 'selected' : ''}`}
                  onClick={() => toggleBuildingSelection(building.id)}
                >
                  <h5>{building.name}</h5>
                  {building.type === 'production' && (
                    <p>生産: {productNames[building.produces]}</p>
                  )}
                  <div className="goods-slot empty">
                    空きスロット
                  </div>
                </div>
              ))}
            </div>
          )}
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
            disabled={selectedBuildingIds.length === 0}
            onClick={handleProduce}
          >
            生産
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProducerActionDialog;