import { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { Cell, GameState, Player, Unit, UnitType } from '../types/game';
import { initializeGame } from '../utils/gameUtils';

interface GameContextType {
  gameState: GameState;
  selectUnit: (unit: Unit) => void;
  moveUnit: (x: number, y: number) => void;
  attackUnit: (targetUnit: Unit) => void;
  endTurn: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps) => {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  // AI用のタイマー
  useEffect(() => {
    if (gameState.currentPlayer === 'COMPUTER' && !gameState.gameOver) {
      const timer = setTimeout(() => {
        handleComputerTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, gameState.gameOver]);

  // ユニットの選択
  const selectUnit = useCallback((unit: Unit) => {
    if (gameState.gameOver || gameState.currentPlayer !== unit.player) return;
    
    setGameState(prev => ({
      ...prev,
      selectedUnit: unit,
      message: `${unit.type}を選択しました`
    }));
  }, [gameState.gameOver, gameState.currentPlayer]);

  // ユニットの移動
  const moveUnit = useCallback((x: number, y: number) => {
    if (!gameState.selectedUnit || gameState.gameOver) return;

    const { selectedUnit, board } = gameState;
    const targetCell = board[y][x];

    // 移動できるかチェック
    if (!canMoveToCell(selectedUnit, targetCell, board)) return;

    // 移動処理
    const updatedBoard = [...board];
    updatedBoard[selectedUnit.y][selectedUnit.x].unit = null;
    
    const updatedUnit = {
      ...selectedUnit,
      x,
      y,
      movementLeft: selectedUnit.movementLeft - calculateMovementCost(targetCell),
    };
    
    updatedBoard[y][x].unit = updatedUnit;

    // ユニットのリストを更新
    const updatedPlayerUnits = gameState.playerUnits.map(unit => 
      unit.id === updatedUnit.id ? updatedUnit : unit
    );
    
    const updatedComputerUnits = gameState.computerUnits.map(unit => 
      unit.id === updatedUnit.id ? updatedUnit : unit
    );

    setGameState(prev => ({
      ...prev,
      board: updatedBoard,
      selectedUnit: updatedUnit,
      playerUnits: updatedPlayerUnits,
      computerUnits: updatedComputerUnits,
      message: `ユニットを(${x}, ${y})に移動しました`
    }));
  }, [gameState]);

  // 攻撃処理
  const attackUnit = useCallback((targetUnit: Unit) => {
    if (!gameState.selectedUnit || gameState.gameOver) return;
    
    const { selectedUnit, board } = gameState;
    
    // 攻撃可能かチェック
    if (
      selectedUnit.hasAttacked ||
      targetUnit.player === selectedUnit.player ||
      !isInRange(selectedUnit, targetUnit)
    ) {
      return;
    }

    // ダメージ計算
    const damage = calculateDamage(selectedUnit, targetUnit);
    const updatedTargetUnit = {
      ...targetUnit,
      health: Math.max(0, targetUnit.health - damage)
    };

    // 攻撃したユニットを更新
    const updatedAttacker = {
      ...selectedUnit,
      hasAttacked: true
    };

    // ボード更新
    const updatedBoard = [...board];
    
    if (updatedTargetUnit.health <= 0) {
      // ユニットが倒された場合、セルから削除
      updatedBoard[targetUnit.y][targetUnit.x].unit = null;
    } else {
      // ダメージを受けたユニットを更新
      updatedBoard[targetUnit.y][targetUnit.x].unit = updatedTargetUnit;
    }
    
    updatedBoard[selectedUnit.y][selectedUnit.x].unit = updatedAttacker;

    // ユニットリストを更新
    let updatedPlayerUnits = [...gameState.playerUnits];
    let updatedComputerUnits = [...gameState.computerUnits];

    if (targetUnit.player === 'PLAYER') {
      updatedPlayerUnits = updatedTargetUnit.health <= 0
        ? updatedPlayerUnits.filter(u => u.id !== targetUnit.id)
        : updatedPlayerUnits.map(u => u.id === targetUnit.id ? updatedTargetUnit : u);
      updatedComputerUnits = updatedComputerUnits.map(u => u.id === updatedAttacker.id ? updatedAttacker : u);
    } else {
      updatedComputerUnits = updatedTargetUnit.health <= 0
        ? updatedComputerUnits.filter(u => u.id !== targetUnit.id)
        : updatedComputerUnits.map(u => u.id === targetUnit.id ? updatedTargetUnit : u);
      updatedPlayerUnits = updatedPlayerUnits.map(u => u.id === updatedAttacker.id ? updatedAttacker : u);
    }

    // ゲーム終了チェック
    const isGameOver = updatedPlayerUnits.length === 0 || updatedComputerUnits.length === 0;
    const winner = updatedPlayerUnits.length === 0 ? 'COMPUTER' : 
                   updatedComputerUnits.length === 0 ? 'PLAYER' : null;
    
    setGameState(prev => ({
      ...prev,
      board: updatedBoard,
      selectedUnit: updatedAttacker,
      playerUnits: updatedPlayerUnits,
      computerUnits: updatedComputerUnits,
      message: `${damage}のダメージを与えました${updatedTargetUnit.health <= 0 ? '。ユニットを撃破しました！' : ''}`,
      gameOver: isGameOver,
      winner
    }));
  }, [gameState]);

  // ターン終了
  const endTurn = useCallback(() => {
    if (gameState.gameOver) return;

    const nextPlayer = gameState.currentPlayer === 'PLAYER' ? 'COMPUTER' : 'PLAYER';
    
    // ユニットのリセット（移動力と攻撃フラグ）
    const resetUnits = (units: Unit[]): Unit[] => {
      return units.map(unit => ({
        ...unit,
        movementLeft: unit.movement,
        hasAttacked: false
      }));
    };

    const updatedPlayerUnits = resetUnits(gameState.playerUnits);
    const updatedComputerUnits = resetUnits(gameState.computerUnits);

    // ボード上のユニットも更新
    const updatedBoard = gameState.board.map(row => 
      row.map(cell => {
        if (!cell.unit) return cell;
        
        const updatedUnit = {
          ...cell.unit,
          movementLeft: cell.unit.movement,
          hasAttacked: false
        };
        
        return { ...cell, unit: updatedUnit };
      })
    );

    setGameState(prev => ({
      ...prev,
      board: updatedBoard,
      currentPlayer: nextPlayer,
      selectedUnit: null,
      playerUnits: updatedPlayerUnits,
      computerUnits: updatedComputerUnits,
      message: `${nextPlayer === 'PLAYER' ? 'あなた' : 'コンピュータ'}のターンです`
    }));
  }, [gameState]);

  // ゲームリセット
  const resetGame = useCallback(() => {
    setGameState(initializeGame());
  }, []);

  // コンピューターのターン処理
  const handleComputerTurn = useCallback(() => {
    if (gameState.gameOver) return;

    const { computerUnits, playerUnits, board } = gameState;
    
    // 簡単なAIロジック：各ユニットが最も近い敵を攻撃する
    for (const unit of computerUnits) {
      // まだ行動していないユニットを選択
      if (unit.hasAttacked) continue;

      // 最も近い敵を探す
      let closestEnemy = findClosestEnemy(unit, playerUnits);
      
      if (closestEnemy) {
        // 攻撃範囲内に敵がいる場合は攻撃
        if (isInRange(unit, closestEnemy)) {
          // 攻撃処理を行う
          setGameState(prev => {
            const updatedBoard = [...prev.board];
            const attackingUnit = { ...unit, hasAttacked: true };
            updatedBoard[unit.y][unit.x].unit = attackingUnit;

            // ダメージ計算
            const damage = calculateDamage(unit, closestEnemy);
            const updatedTarget = {
              ...closestEnemy,
              health: Math.max(0, closestEnemy.health - damage)
            };

            // 攻撃後の処理
            if (updatedTarget.health <= 0) {
              // ターゲット削除
              updatedBoard[closestEnemy.y][closestEnemy.x].unit = null;
              const updatedPlayerUnits = prev.playerUnits.filter(u => u.id !== closestEnemy.id);
              
              // ゲーム終了チェック
              const isGameOver = updatedPlayerUnits.length === 0;
              
              return {
                ...prev,
                board: updatedBoard,
                playerUnits: updatedPlayerUnits,
                computerUnits: prev.computerUnits.map(u => u.id === unit.id ? attackingUnit : u),
                message: `コンピュータが攻撃して、${closestEnemy.type}を撃破しました！`,
                gameOver: isGameOver,
                winner: isGameOver ? 'COMPUTER' : null
              };
            } else {
              // ダメージのみ
              updatedBoard[closestEnemy.y][closestEnemy.x].unit = updatedTarget;
              
              return {
                ...prev,
                board: updatedBoard,
                playerUnits: prev.playerUnits.map(u => u.id === closestEnemy.id ? updatedTarget : u),
                computerUnits: prev.computerUnits.map(u => u.id === unit.id ? attackingUnit : u),
                message: `コンピュータが${closestEnemy.type}に${damage}のダメージを与えました`
              };
            }
          });
          continue; // 次のユニットへ
        }
        
        // 攻撃範囲外の場合、敵に近づく
        const path = findPathToTarget(unit, closestEnemy, board);
        if (path.length > 0 && unit.movementLeft > 0) {
          // 移動可能な最適な位置を見つける
          let moveIdx = Math.min(path.length - 1, unit.movementLeft);
          while (moveIdx > 0) {
            const targetPos = path[moveIdx];
            const targetCell = board[targetPos.y][targetPos.x];
            
            // 目的地のセルが空いていて、移動コスト以内であれば移動
            if (!targetCell.unit && moveIdx <= unit.movementLeft) {
              setGameState(prev => {
                const updatedBoard = [...prev.board];
                updatedBoard[unit.y][unit.x].unit = null;
                
                const updatedUnit = {
                  ...unit,
                  x: targetPos.x,
                  y: targetPos.y,
                  movementLeft: unit.movementLeft - moveIdx
                };
                
                updatedBoard[targetPos.y][targetPos.x].unit = updatedUnit;
                
                return {
                  ...prev,
                  board: updatedBoard,
                  computerUnits: prev.computerUnits.map(u => u.id === unit.id ? updatedUnit : u),
                  message: `コンピュータのユニットが(${targetPos.x}, ${targetPos.y})に移動しました`
                };
              });
              break;
            }
            moveIdx--;
          }
        }
      }
    }

    // すべてのユニットの行動後、ターン終了
    setTimeout(() => {
      endTurn();
    }, 1000);
  }, [gameState, endTurn]);

  const value = {
    gameState,
    selectUnit,
    moveUnit,
    attackUnit,
    endTurn,
    resetGame
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// ヘルパー関数
function canMoveToCell(unit: Unit, targetCell: Cell, board: Cell[][]): boolean {
  // 移動先に他のユニットがいないか確認
  if (targetCell.unit) return false;
  
  // 水地形には移動できない
  if (targetCell.terrain === 'WATER') return false;
  
  // 移動範囲内かチェック
  const distance = Math.abs(unit.x - targetCell.x) + Math.abs(unit.y - targetCell.y);
  return distance <= unit.movementLeft;
}

function calculateMovementCost(cell: Cell): number {
  // 地形によるコスト
  switch (cell.terrain) {
    case 'FOREST': return 2;
    case 'MOUNTAIN': return 3;
    default: return 1; // PLAIN
  }
}

function isInRange(attacker: Unit, target: Unit): boolean {
  const distance = Math.abs(attacker.x - target.x) + Math.abs(attacker.y - target.y);
  return distance <= attacker.attackRange;
}

function calculateDamage(attacker: Unit, defender: Unit): number {
  // 基本ダメージ
  let damage = attacker.attackPower;
  
  // ユニットタイプによる相性
  if (attacker.type === 'TANK' && defender.type === 'INFANTRY') {
    damage *= 1.5;
  } else if (attacker.type === 'ARTILLERY' && defender.type === 'TANK') {
    damage *= 1.5;
  } else if (attacker.type === 'INFANTRY' && defender.type === 'ARTILLERY') {
    damage *= 1.5;
  }
  
  // 地形による防御ボーナス
  const defenderCell = { x: defender.x, y: defender.y, terrain: 'PLAIN', unit: defender }; // 仮のセル
  
  return Math.floor(damage);
}

function findClosestEnemy(unit: Unit, enemies: Unit[]): Unit | null {
  if (enemies.length === 0) return null;
  
  let closestEnemy = enemies[0];
  let minDistance = calculateDistance(unit, enemies[0]);
  
  for (let i = 1; i < enemies.length; i++) {
    const distance = calculateDistance(unit, enemies[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestEnemy = enemies[i];
    }
  }
  
  return closestEnemy;
}

function calculateDistance(unitA: Unit, unitB: Unit): number {
  return Math.abs(unitA.x - unitB.x) + Math.abs(unitA.y - unitB.y);
}

function findPathToTarget(unit: Unit, target: Unit, board: Cell[][]): { x: number, y: number }[] {
  // シンプルなA*アルゴリズムでパスを見つける（実装は簡略化）
  const start = { x: unit.x, y: unit.y };
  const end = { x: target.x, y: target.y };
  
  // 簡易版：直線パスを返す
  const path: { x: number, y: number }[] = [];
  
  // 水平移動
  const dx = end.x - start.x;
  const stepX = Math.sign(dx);
  for (let i = 1; i <= Math.abs(dx); i++) {
    path.push({ x: start.x + stepX * i, y: start.y });
  }
  
  // 垂直移動
  const lastX = path.length > 0 ? path[path.length - 1].x : start.x;
  const dy = end.y - start.y;
  const stepY = Math.sign(dy);
  for (let i = 1; i <= Math.abs(dy); i++) {
    path.push({ x: lastX, y: start.y + stepY * i });
  }
  
  return path;
}