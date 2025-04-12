import React from 'react';
import { type GameState } from '../types/game';

type StoragePanelProps = {
  gameState: GameState;
  onDiscard: (goodType: string) => void;
  onConfirm: () => void;
};

export const StoragePanel: React.FC<StoragePanelProps> = ({
  gameState,
  onDiscard,
  onConfirm
}) => {
  const currentPlayer = gameState.players[gameState.currentPlayer];
  if (!currentPlayer) return null;

  const hasSmallWarehouse = currentPlayer.buildings.some(b => b.type === "smallWarehouse" && b.colonists > 0);
  const hasLargeWarehouse = currentPlayer.buildings.some(b => b.type === "largeWarehouse" && b.colonists > 0);

  const getMaxStorableGoods = (): number => {
    return 1 + // 基本1種類
      (hasSmallWarehouse ? 1 : 0) + // 倉庫(小)で+1種類
      (hasLargeWarehouse ? 2 : 0); // 倉庫(大)で+2種類
  };

  const goodsCount = Object.values(currentPlayer.goods).reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0);
  const mustDiscardCount = Math.max(0, goodsCount - getMaxStorableGoods());

  return (
    <div className="storage-panel">
      <h3>商品の保管</h3>
      
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <p>保管可能な商品の種類: {getMaxStorableGoods()}</p>
        {hasSmallWarehouse && <p>倉庫(小)の効果: +1種類</p>}
        {hasLargeWarehouse && <p>倉庫(大)の効果: +2種類</p>}
        <p style={{ color: mustDiscardCount > 0 ? 'red' : 'green' }}>
          {mustDiscardCount > 0 
            ? `あと${mustDiscardCount}種類の商品を廃棄する必要があります`
            : '十分な保管容量があります'}
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {Object.entries(currentPlayer.goods).map(([goodType, amount]) => {
          if (amount === 0) return null;
          return (
            <div
              key={goodType}
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: amount > 0 ? 'pointer' : 'default',
                backgroundColor: amount > 0 ? '#fff' : '#eee'
              }}
              onClick={() => amount > 0 && onDiscard(goodType)}
            >
              <div style={{ textTransform: 'capitalize' }}>{goodType}</div>
              <div>所持数: {amount}</div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onConfirm}
        disabled={mustDiscardCount > 0}
        style={{
          padding: '10px 20px',
          backgroundColor: mustDiscardCount > 0 ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: mustDiscardCount > 0 ? 'not-allowed' : 'pointer'
        }}
      >
        確定
      </button>
    </div>
  );
};

export default StoragePanel;