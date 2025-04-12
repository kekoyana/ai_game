import React from 'react';
import { type GameState } from '../types/game';

type MerchantPanelProps = {
  gameState: GameState;
  onSell: (goodType: string) => void;
  onClose: () => void;
};

export const MerchantPanel: React.FC<MerchantPanelProps> = ({
  gameState,
  onSell,
  onClose
}) => {
  const currentPlayer = gameState.players[gameState.currentPlayer];
  const isPrivileged = gameState.selectedRole === "商人";

  const goodPrices = {
    corn: 0,
    indigo: 1,
    sugar: 2,
    tobacco: 3,
    coffee: 4
  };

  const canSellGood = (goodType: string): boolean => {
    if (!currentPlayer) return false;
    
    const goods = currentPlayer.goods as Record<string, number>;
    // 商品を持っていない場合は売れない
    if (!goods[goodType]) return false;
    
    // すでに商船に積まれている商品と同じものは売れない
    if (gameState.tradeShip.cargo === goodType) return false;
    
    return true;
  };

  return (
    <div className="merchant-panel">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>商品の取引</h3>
        <button
          onClick={onClose}
          style={{
            padding: '5px 10px',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#ff4444',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          閉じる
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '10px',
        padding: '10px'
      }}>
        {Object.entries(goodPrices).map(([goodType, basePrice]) => {
          const price = basePrice + (isPrivileged ? 1 : 0);
          const sellable = canSellGood(goodType);
          const amount = currentPlayer?.goods[goodType as keyof typeof currentPlayer.goods] || 0;

          return (
            <div
              key={goodType}
              onClick={() => sellable && onSell(goodType)}
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                backgroundColor: sellable ? '#fff' : '#eee',
                cursor: sellable ? 'pointer' : 'not-allowed',
                opacity: sellable ? 1 : 0.5
              }}
            >
              <div style={{ textTransform: 'capitalize' }}>{goodType}</div>
              <div>価格: {price} ドブロン</div>
              <div>所持数: {amount}</div>
              {gameState.tradeShip.cargo === goodType && (
                <div style={{ color: 'red' }}>取引済み</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '5px'
      }}>
        <p>
          {isPrivileged ? "商人の特権: 売値+1ドブロン" : ""}
        </p>
      </div>
    </div>
  );
};

export default MerchantPanel;