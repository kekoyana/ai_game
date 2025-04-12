// src/components/Actions.tsx
import React from 'react';
import { GameState, Role } from '../store/gameStore';

interface ActionsProps {
  gameState: GameState;
  // TODO: これらのコールバックは後で実装します
  onSelectRole?: (role: Role) => void;
  onExecuteAction?: (actionType: Role, params?: {
    buildingId?: string;     // 建設する建物のID
    targetBuildingId?: string; // 対象の建物のID（生産/売却時）
    selectedCards?: string[];  // 選択されたカードのID（参事会議員）
    discardCards?: string[];   // 捨てるカードのID
  }) => void;
  onPass?: () => void;
}

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

const Actions: React.FC<ActionsProps> = ({ gameState, onSelectRole, onExecuteAction, onPass }) => {
  const { gamePhase, currentPlayerId, selectedRole, currentRoundRoles } = gameState;
  const humanPlayer = gameState.players.find(p => p.isHuman);

  // 現在のプレイヤーが人間プレイヤーか？
  const isHumanTurn = currentPlayerId === humanPlayer?.id;

  // 選択可能な役割を取得
  const availableRoles: Role[] = ['builder', 'producer', 'trader', 'councilor', 'prospector'];
  const selectableRoles = availableRoles.filter(role => !currentRoundRoles.includes(role));

  // 特権を持っているかどうか
  const hasPrivilege = selectedRole && currentPlayerId === gameState.players.find(p => p.isHuman)?.id;

  // 役割選択フェーズのUI
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
              onClick={() => onSelectRole?.(role)}
            >
              <span className="role-name">{roleNames[role]}</span>
              <span className="role-description">{roleDescriptions[role]}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // アクション実行フェーズのUI
  const renderActionExecution = () => {
    if (gamePhase !== 'action' || !selectedRole) return null;

    // プレイヤーの手番でない場合は、現在のアクションの情報のみ表示
    if (!isHumanTurn) {
      return (
        <div className="action-info">
          <p>{roleNames[selectedRole]}のアクションが実行中です</p>
          <p>プレイヤー {currentPlayerId} の手番です</p>
        </div>
      );
    }

    // アクション実行UI
    return (
      <div className="action-execution">
        <h5>{roleNames[selectedRole]}のアクション {hasPrivilege && <span className="privilege">(特権あり)</span>}</h5>
        <p className="action-description">{roleDescriptions[selectedRole]}</p>
        
        {/* アクション固有のUI（後で実装） */}
        <div className="action-controls">
          <button 
            className="action-button"
            onClick={() => onExecuteAction?.(selectedRole)}
          >
            アクションを実行
          </button>
          {!hasPrivilege && (
            <button 
              className="pass-button"
              onClick={onPass}
            >
              パス
            </button>
          )}
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
        <p>総督が次のプレイヤーに移動します</p>
        {/* TODO: 手札制限チェックなどの処理UI */}
      </div>
    );
  };

  return (
    <div className="actions-area">
      <h4>アクション</h4>
      {renderRoleSelection()}
      {renderActionExecution()}
      {renderEndRound()}
    </div>
  );
};

export default Actions;