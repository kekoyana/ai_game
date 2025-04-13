// src/components/Actions.tsx
import React, { useState } from 'react';
import { useGame, useGameActions } from '../store/GameContext';
import { Role } from '../store/gameStore';
import { BuildingCard } from '../data/cards';
import BuildingActionDialog from './dialogs/BuildingActionDialog';
import CouncilorActionDialog from './dialogs/CouncilorActionDialog';
import ProducerActionDialog from './dialogs/ProducerActionDialog';
import TraderActionDialog from './dialogs/TraderActionDialog';

// 役割名を日本語に変換
const roleNames: Record<Role, string> = {
  builder: '建築士',
  producer: '監督',
  trader: '商人',
  councilor: '参事会議員',
  prospector: '金鉱掘り'
};

// 役割の説明
const roleDescriptions: Record<Role, string> = {
  builder: '建物を1つ建設できます（特権: コスト-1）',
  producer: '商品を1つ生産できます（特権: +1商品）',
  trader: '商品を1つ売却できます（特権: +1商品）',
  councilor: 'カードを2枚引き1枚を選びます（特権: +3枚引く）',
  prospector: '山札から1枚引きます（特権のみ）'
};

const Actions: React.FC = () => {
  const { state } = useGame();
  const actions = useGameActions();
  
  // ダイアログの表示状態
  // ダイアログの表示状態
  const [showBuildingDialog, setShowBuildingDialog] = useState(false);
  const [showProducerDialog, setShowProducerDialog] = useState(false);
  const [showTraderDialog, setShowTraderDialog] = useState(false);
  const [drawnCouncilorCards, setDrawnCouncilorCards] = useState<BuildingCard[]>([]);
  const {
    gamePhase,
    currentPlayerId,
    selectedRole,
    currentRoundRoles
  } = state;
  
  const humanPlayer = state.players.find(p => p.isHuman);
  const isHumanTurn = currentPlayerId === humanPlayer?.id;
  
  const availableRoles: Role[] = ['builder', 'producer', 'trader', 'councilor', 'prospector'];
  const selectableRoles = availableRoles.filter(role => !currentRoundRoles.includes(role));
  
  const renderRoleSelection = () => {
    if (!isHumanTurn || gamePhase !== 'role_selection') return null;

    return (
      <div className="role-selection">
        <h5>役割を選択してください</h5>
        <div className="role-buttons">
          {selectableRoles.map(role => (
            <button
              key={role}
              className="role-button"
              onClick={() => actions.selectRole(role)}
            >
              <span className="role-name">{roleNames[role]}</span>
              <span className="role-description">{roleDescriptions[role]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderActionExecution = () => {
    if (!isHumanTurn || gamePhase !== 'action' || !selectedRole) return null;

    // 特権を持っているかどうか
    const hasPrivilege = currentPlayerId === humanPlayer?.id;

    return (
      <div className="action-execution">
        <h5>
          {roleNames[selectedRole]}のアクション
          {hasPrivilege && <span className="privilege">特権あり</span>}
        </h5>
        <p className="action-description">{roleDescriptions[selectedRole]}</p>
        
        <div className="action-controls">
          {/* 特権がない場合はパス可能 */}
          {!hasPrivilege && humanPlayer && (
            <button
              className="pass-button"
              onClick={() => actions.pass(humanPlayer.id)}
            >
              パス
            </button>
          )}

          <button
            className="action-button"
            onClick={() => {
              if (!humanPlayer) return;

              switch (selectedRole) {
                case 'builder':
                  setShowBuildingDialog(true);
                  return;
                case 'producer':
                  setShowProducerDialog(true);
                  return;
                case 'trader':
                  setShowTraderDialog(true);
                  return;
                case 'prospector':
                  actions.prospectorDraw(humanPlayer.id);
                  actions.endAction();
                  break;
                case 'councilor':
                  actions.drawCouncilCards(humanPlayer.id);
                  setDrawnCouncilorCards(humanPlayer.hand.slice(-5)); // 最後に引いた5枚
                  break;
                // 他のアクションは選択UIが必要なため、
                // 別のコンポーネントで処理
              }
            }}
          >
            実行
          </button>
        </div>
      </div>
    );
  };

  // ラウンド終了フェーズのUI
  const renderEndRound = () => {
    if (gamePhase !== 'end_round') return null;

    return (
      <div className="end-round">
        <h5>ラウンド終了</h5>
        <button
          className="action-button"
          onClick={() => actions.endRound()}
        >
          次のラウンドへ
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="actions-area">
        <h4>アクション</h4>
        {renderRoleSelection()}
        {renderActionExecution()}
        {renderEndRound()}
      </div>

      {/* 建物建設ダイアログ */}
      {showBuildingDialog && (
        <BuildingActionDialog
          onClose={() => setShowBuildingDialog(false)}
        />
      )}

      {/* 商品売却ダイアログ */}
      {showTraderDialog && (
        <TraderActionDialog
          onClose={() => {
            setShowTraderDialog(false);
            actions.endAction();
          }}
        />
      )}

      {/* 参事会議員のカード選択ダイアログ */}
      {drawnCouncilorCards.length > 0 && (
        <CouncilorActionDialog
          drawnCards={drawnCouncilorCards}
          onClose={() => {
            setDrawnCouncilorCards([]);
            actions.endAction();
          }}
        />
      )}

      {/* 生産施設選択ダイアログ */}
      {showProducerDialog && (
        <ProducerActionDialog
          onClose={() => {
            setShowProducerDialog(false);
            actions.endAction();
          }}
        />
      )}
    </>
  );
};

export default Actions;