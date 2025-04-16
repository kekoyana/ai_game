// src/components/Actions.tsx
import React, { useState } from 'react';
import { useGame, useGameActions } from '../store/GameContext';
import { Role } from '../store/gameStore';
import { useMessage } from '../store/messageContext';
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
  const { addMessage } = useMessage();
  
  // ダイアログの表示状態
  // ダイアログの表示状態
  const [showBuildingDialog, setShowBuildingDialog] = useState(false);
  const [showProducerDialog, setShowProducerDialog] = useState(false);
  const [showTraderDialog, setShowTraderDialog] = useState(false);
  const [drawnCouncilorCards, setDrawnCouncilorCards] = useState<BuildingCard[]>([]);
  const {
    gamePhase,
    currentPlayerId,
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
              onClick={() => {
                actions.selectRole(role);
                addMessage({
                  text: `あなたは${roleNames[role]}を選択しました`,
                  type: 'action'
                });

                if (!humanPlayer) return;

                // 各役割のアクションを即座に実行
                switch (role) {
                  case 'builder':
                    setShowBuildingDialog(true);
                    addMessage({
                      text: `建築士を選択: 建物を建設できます`,
                      type: 'action'
                    });
                    break;
                  case 'producer':
                    setShowProducerDialog(true);
                    addMessage({
                      text: `監督を選択: 商品を生産できます`,
                      type: 'action'
                    });
                    break;
                  case 'trader':
                    setShowTraderDialog(true);
                    addMessage({
                      text: `商人を選択: 商品を売却できます`,
                      type: 'action'
                    });
                    break;
                  case 'councilor':
                    actions.drawCouncilCards(humanPlayer.id);
                    setDrawnCouncilorCards(humanPlayer.hand.slice(-5));
                    addMessage({
                      text: `参事会議員を選択: カードを引きます`,
                      type: 'action'
                    });
                    break;
                  case 'prospector':
                    actions.prospectorDraw(humanPlayer.id);
                    addMessage({
                      text: `金鉱掘りを選択: カードを1枚引きました`,
                      type: 'action'
                    });
                    actions.endAction();
                    break;
                }

              }}
            >
              <span className="role-name">{roleNames[role]}</span>
              <span className="role-description">{roleDescriptions[role]}</span>
            </button>
          ))}
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
          onClick={() => {
            actions.endRound();
            addMessage({
              text: `ラウンドが終了し、次のラウンドが開始されました`,
              type: 'system'
            });
          }}
        >
          次のラウンドへ
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="actions-area">
        {renderRoleSelection()}
        {renderEndRound()}
      </div>

      {/* 建物建設ダイアログ */}
      {showBuildingDialog && (
        <BuildingActionDialog
          onClose={() => {
            setShowBuildingDialog(false);
            addMessage({
              text: `建築士の行動を終了しました`,
              type: 'action'
            });
          }}
        />
      )}

      {/* 商品売却ダイアログ */}
      {showTraderDialog && (
        <TraderActionDialog
          onClose={() => {
            setShowTraderDialog(false);
            addMessage({
              text: `商人の行動を終了しました`,
              type: 'action'
            });
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
            addMessage({
              text: `参事会議員の行動を終了しました`,
              type: 'action'
            });
            actions.endAction();
          }}
        />
      )}

      {/* 生産施設選択ダイアログ */}
      {showProducerDialog && (
        <ProducerActionDialog
          onClose={() => {
            setShowProducerDialog(false);
            addMessage({
              text: `監督の行動を終了しました`,
              type: 'action'
            });
            actions.endAction();
          }}
        />
      )}
    </>
  );
};

export default Actions;
