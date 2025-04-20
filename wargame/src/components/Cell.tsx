import React from 'react';
import { Cell as CellType, Unit } from '../types/game';
import { useGameContext } from '../context/GameContext';
import { isUnitAttackable } from '../utils/gameUtils';

interface CellProps {
  cell: CellType;
}

export const Cell: React.FC<CellProps> = ({ cell }) => {
  const { gameState, selectUnit, moveUnit, attackUnit } = useGameContext();
  const { selectedUnit, currentPlayer } = gameState;
  
  // 地形によって背景色を変更
  const getBackgroundColor = (): string => {
    switch (cell.terrain) {
      case 'PLAIN': return '#90EE90'; // 明るい緑
      case 'FOREST': return '#228B22'; // 森林緑
      case 'MOUNTAIN': return '#A9A9A9'; // 灰色
      case 'WATER': return '#87CEFA'; // 明るい青
      default: return '#FFFFFF'; // 白
    }
  };

  // ユニット選択/移動/攻撃のハンドラ
  const handleCellClick = () => {
    // セルにユニットがある場合
    if (cell.unit) {
      // 自分のユニットを選択
      if (cell.unit.player === currentPlayer) {
        selectUnit(cell.unit);
      } 
      // 敵のユニットを攻撃
      else if (
        selectedUnit && 
        isUnitAttackable(selectedUnit, cell.unit)
      ) {
        attackUnit(cell.unit);
      }
    } 
    // 空のセルの場合、選択中のユニットを移動
    else if (
      selectedUnit && 
      selectedUnit.player === currentPlayer && 
      selectedUnit.movementLeft > 0
    ) {
      moveUnit(cell.x, cell.y);
    }
  };

  // 選択可能なセルかどうかを判定
  const isSelectable = (): boolean => {
    if (!cell.unit) return false;
    return cell.unit.player === currentPlayer;
  };

  // 移動可能なセルかどうかを判定
  const isMovable = (): boolean => {
    if (cell.unit || !selectedUnit || selectedUnit.movementLeft <= 0) return false;
    
    const distance = Math.abs(selectedUnit.x - cell.x) + Math.abs(selectedUnit.y - cell.y);
    return distance <= selectedUnit.movementLeft && cell.terrain !== 'WATER';
  };

  // 攻撃可能なセルかどうかを判定
  const isAttackable = (): boolean => {
    if (!cell.unit || !selectedUnit) return false;
    return isUnitAttackable(selectedUnit, cell.unit);
  };

  // ユニット情報の表示
  const renderUnit = (unit: Unit) => {
    // ユニットタイプによって色を変える
    const getUnitColor = (): string => {
      if (unit.player === 'PLAYER') {
        return '#0000FF'; // 青 (プレイヤー)
      } else {
        return '#FF0000'; // 赤 (コンピュータ)
      }
    };

    // ユニットタイプによって表示するアイコンやテキストを変える
    const getUnitSymbol = (): string => {
      switch (unit.type) {
        case 'INFANTRY': return '👤';
        case 'TANK': return '🔥';
        case 'ARTILLERY': return '💣';
        default: return '?';
      }
    };

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: getUnitColor(),
          fontSize: '1.5rem',
          fontWeight: 'bold'
        }}
      >
        <div>{getUnitSymbol()}</div>
        <div style={{ fontSize: '0.8rem' }}>{unit.health}</div>
      </div>
    );
  };

  // セルの状態によってスタイルを変更
  const getBorderStyle = (): string => {
    if (
      selectedUnit && 
      selectedUnit.x === cell.x && 
      selectedUnit.y === cell.y
    ) {
      return '3px solid yellow'; // 選択中のユニット
    } else if (isMovable()) {
      return '2px dashed green'; // 移動可能
    } else if (isAttackable()) {
      return '2px solid red'; // 攻撃可能
    } else if (isSelectable()) {
      return '2px solid blue'; // 選択可能
    }
    return '1px solid #ccc'; // デフォルト
  };

  return (
    <div
      onClick={handleCellClick}
      style={{
        width: '60px',
        height: '60px',
        backgroundColor: getBackgroundColor(),
        border: getBorderStyle(),
        cursor: isSelectable() || isMovable() || isAttackable() ? 'pointer' : 'default',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {cell.unit && renderUnit(cell.unit)}
    </div>
  );
};