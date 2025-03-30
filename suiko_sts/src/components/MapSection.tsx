import React from 'react';
import Map from './Map';
import { Shop } from './Shop';

interface MapSectionProps {
  // 現在のノード情報（敵、ショップ、休憩所など）
  currentNode: any;
  // 勝利演出中かどうか
  isShowingVictorySequence: boolean;
  // 現在のノードが既に使用済みかどうか
  isCurrentNodeConsumed: boolean;
  // 戦闘開始用のハンドラー
  handleStartBattle: () => void;
  // 休憩時のハンドラー
  handleRest: () => void;
  // カード報酬表示のためのフラグ更新用ハンドラー
  setShowCardReward: (value: boolean) => void;
  // お宝報酬表示のためのフラグ更新用ハンドラー
  setShowRelicReward: (value: boolean) => void;
  // カード強化表示のためのフラグ更新用ハンドラー
  setShowCardUpgrade: (value: boolean) => void;
  // 現在のノードのID
  currentNodeId: string;
}

const MapSection: React.FC<MapSectionProps> = ({
  currentNode,
  isShowingVictorySequence,
  isCurrentNodeConsumed,
  handleStartBattle,
  handleRest,
  setShowCardReward,
  setShowRelicReward,
  setShowCardUpgrade,
  currentNodeId
}) => {
  return (
    <div className="map-container">
      {/* 地図コンポーネントを表示 */}
      <Map />
      {currentNode && !isShowingVictorySequence && !isCurrentNodeConsumed && (
        <>
          {currentNode.type === 'shop' ? (
            // ショップの場合
            <div className="game-overlay">
              <Shop />
            </div>
          ) : currentNode.type === 'item' ? (
            // 宝箱の場合
            <div className="game-overlay">
              <div className="event-node">
                <h3 className="event-title">神秘の宝箱</h3>
                <p className="event-description">
                  カードかお宝を獲得できます
                </p>
                <div className="flex gap-4 justify-center mt-4">
                  <button
                    onClick={() => setShowCardReward(true)}
                    className="battle-button action-button"
                  >
                    カードを見る
                    <span className="block text-sm text-yellow-300">
                      新しいカードを獲得
                    </span>
                  </button>
                  <button
                    onClick={() => setShowRelicReward(true)}
                    className="battle-button action-button"
                  >
                    お宝を見る
                    <span className="block text-sm text-yellow-300">
                      パワーアップアイテム
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : currentNode.type === 'rest' ? (
            // 休憩所の場合
            <div className="game-overlay">
              <div className="event-node">
                <h3 className="event-title">休憩所</h3>
                <p className="event-description">
                  休憩して回復するか、カードを強化できます
                </p>
                <div className="flex gap-4 justify-center mt-4">
                  <button
                    onClick={handleRest}
                    className="battle-button action-button"
                  >
                    回復する
                    <span className="block text-sm text-yellow-300">
                      HP +30%
                    </span>
                  </button>
                  <button
                    onClick={() => setShowCardUpgrade(true)}
                    className="battle-button action-button"
                  >
                    カードを強化
                    <span className="block text-sm text-yellow-300">
                      1枚選んで強化
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (currentNode.type === 'enemy' ||
                   currentNode.type === 'elite' ||
                   currentNode.type === 'boss') ? (
            // 敵・エリート・ボスの場合は戦闘開始ボタンを表示
            <div className="game-overlay">
              <button
                onClick={handleStartBattle}
                className="battle-button action-button-large"
              >
                戦闘開始
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default MapSection;
