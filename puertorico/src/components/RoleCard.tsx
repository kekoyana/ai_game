import React from 'react';
import { type Role } from '../types/game';

type RoleCardProps = {
  role: Role;
  money: number;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
};

const roleColors = {
  "開拓者": "#228B22",  // 緑
  "市長": "#4169E1",    // 青
  "建築家": "#8B4513",  // 茶
  "監督": "#9370DB",    // 紫
  "商人": "#DAA520",    // 金
  "船長": "#B22222",    // 赤
  "金鉱掘り": "#FFD700" // 黄
};

const roleDescriptions = {
  "開拓者": "プランテーションタイルを1つ選択できます",
  "市長": "入植者を配置できます",
  "建築家": "建物を1つ建設できます",
  "監督": "商品を生産します",
  "商人": "商品を売却できます",
  "船長": "商品を出荷できます",
  "金鉱掘り": "1ドブロンを得ます"
};

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  money,
  isSelected,
  onSelect,
  disabled
}) => {
  return (
    <div
      className="role-card"
      style={{
        backgroundColor: roleColors[role],
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: '#FFF',
        padding: '10px',
        borderRadius: '5px',
        border: isSelected ? '3px solid #FFD700' : '1px solid #000',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px'
      }}
      onClick={() => !disabled && onSelect()}
    >
      <div style={{ fontWeight: 'bold' }}>{role}</div>
      <div style={{ fontSize: '12px' }}>{roleDescriptions[role]}</div>
      {money > 0 && (
        <div style={{ 
          alignSelf: 'flex-end',
          backgroundColor: '#FFD700',
          color: '#000',
          padding: '2px 5px',
          borderRadius: '10px',
          fontSize: '12px'
        }}>
          +{money}
        </div>
      )}
    </div>
  );
};

export default RoleCard;