import React from 'react';
import { type GameState } from '../types/game';

type ShippingPanelProps = {
  gameState: GameState;
  onShip: (goodType: string, shipIndex: number) => void;
  onClose: () => void;
};

export const ShippingPanel: React.FC<ShippingPanelProps> = ({
  gameState,
  onShip,
  onClose
}) => {
  const currentPlayer = gameState.players[gameState.currentPlayer];
  const isPrivileged = gameState.selectedRole === "船長";

  const canShipGood = (goodType: string, shipIndex: number): boolean => {
    if (!currentPlayer) return false;
    
    const ship = gameState.ships[shipIndex];
    if (!ship) return false;

    const goods = currentPlayer.goods as Record<string, number>;
    // 商品を持っていない場合は出荷できない
    if (!goods[goodType]) return false;
    
    // 船が満杯の場合は出荷できない
    if (ship.filled >= ship.capacity) return false;

    // 空の船か、同じ商品が積まれている船にのみ出荷可能
    if (ship.cargo !== "" && ship.cargo !== goodType) return false;
    
    return true;
  };

  return (
    <div className="shipping-panel">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3>商品の出荷</h3>
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
        gridTemplateColumns: '1fr',
        gap: '20px',
        padding: '10px'
      }}>
        {gameState.ships.map((ship, shipIndex) => (
          <div
            key={shipIndex}
            style={{
              padding: '15px',
              border: '2px solid #8b4513',
              borderRadius: '8px',
              backgroundColor: '#f5deb3'
            }}
          >
            <h4>船{shipIndex + 1} (容量: {ship.capacity})</h4>
            <div>積載量: {ship.filled}</div>
            <div>積載商品: {ship.cargo || "なし"}</div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '10px',
              marginTop: '10px'
            }}>
              {Object.entries(currentPlayer?.goods || {}).map(([goodType, amount]) => {
                const shippable = canShipGood(goodType, shipIndex);
                return (
                  <div
                    key={goodType}
                    onClick={() => shippable && onShip(goodType, shipIndex)}
                    style={{
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      backgroundColor: shippable ? '#fff' : '#eee',
                      cursor: shippable ? 'pointer' : 'not-allowed',
                      opacity: shippable ? 1 : 0.5
                    }}
                  >
                    <div style={{ textTransform: 'capitalize' }}>{goodType}</div>
                    <div>所持数: {amount}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {isPrivileged && (
        <div style={{
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px'
        }}>
          <p>船長の特権: 最初の出荷で追加1勝利点</p>
        </div>
      )}
    </div>
  );
};

export default ShippingPanel;