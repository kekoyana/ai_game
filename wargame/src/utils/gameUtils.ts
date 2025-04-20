import { Cell, GameState, TerrainType, Unit, UnitType } from '../types/game';
import { v4 as uuidv4 } from 'uuid';

// ゲームボードのサイズ
export const BOARD_SIZE = 10;

// ゲームの初期化関数
export function initializeGame(): GameState {
  const board = createEmptyBoard();
  const { playerUnits, computerUnits } = placeInitialUnits(board);
  
  return {
    board,
    currentPlayer: 'PLAYER',
    selectedUnit: null,
    gameOver: false,
    winner: null,
    playerUnits,
    computerUnits,
    message: 'ゲームスタート！あなたのターンです'
  };
}

// 空のボードの作成
function createEmptyBoard(): Cell[][] {
  const board: Cell[][] = [];
  
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      row.push({
        x,
        y,
        terrain: getRandomTerrain(),
        unit: null
      });
    }
    board.push(row);
  }
  
  return board;
}

// ランダムな地形の生成
function getRandomTerrain(): TerrainType {
  const terrains: TerrainType[] = ['PLAIN', 'FOREST', 'MOUNTAIN', 'WATER'];
  const weights = [0.7, 0.15, 0.1, 0.05]; // 出現率を調整

  const rand = Math.random();
  let sum = 0;
  
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (rand <= sum) {
      return terrains[i];
    }
  }
  
  return 'PLAIN';
}

// 初期ユニットの配置
function placeInitialUnits(board: Cell[][]): { playerUnits: Unit[], computerUnits: Unit[] } {
  const playerUnits: Unit[] = [];
  const computerUnits: Unit[] = [];
  
  // プレイヤーのユニット配置（下側）
  placeUnitsForPlayer('PLAYER', playerUnits, board, 0, 3, 7, BOARD_SIZE - 1);
  
  // コンピュータのユニット配置（上側）
  placeUnitsForPlayer('COMPUTER', computerUnits, board, 0, 3, 0, 2);
  
  return { playerUnits, computerUnits };
}

// プレイヤーごとのユニット配置
function placeUnitsForPlayer(
  player: 'PLAYER' | 'COMPUTER',
  unitsList: Unit[],
  board: Cell[][],
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
) {
  // ユニットタイプとその初期情報
  const unitTypes: Record<UnitType, { health: number, movement: number, attackRange: number, attackPower: number }> = {
    'INFANTRY': { health: 100, movement: 3, attackRange: 1, attackPower: 30 },
    'TANK': { health: 150, movement: 5, attackRange: 1, attackPower: 50 },
    'ARTILLERY': { health: 80, movement: 2, attackRange: 3, attackPower: 40 }
  };

  // 各タイプのユニットを配置
  const typesToPlace: UnitType[] = ['INFANTRY', 'INFANTRY', 'TANK', 'ARTILLERY'];
  
  for (const unitType of typesToPlace) {
    let placed = false;
    const maxAttempts = 20;
    let attempts = 0;
    
    while (!placed && attempts < maxAttempts) {
      const x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
      
      // セルが空いているか、水地形でないか確認
      if (!board[y][x].unit && board[y][x].terrain !== 'WATER') {
        const unitInfo = unitTypes[unitType];
        
        const unit: Unit = {
          id: uuidv4(),
          type: unitType,
          player,
          x,
          y,
          health: unitInfo.health,
          movement: unitInfo.movement,
          movementLeft: unitInfo.movement,
          attackRange: unitInfo.attackRange,
          attackPower: unitInfo.attackPower,
          hasAttacked: false
        };
        
        // ユニットをボードに配置
        board[y][x].unit = unit;
        
        // ユニットリストに追加
        unitsList.push(unit);
        
        placed = true;
      }
      
      attempts++;
    }
  }
}

// ゲームボード上のセルが移動可能かどうかを判定
export function isCellMovable(
  unit: Unit | null,
  targetX: number,
  targetY: number,
  board: Cell[][]
): boolean {
  if (!unit) return false;
  
  // ボード範囲外チェック
  if (targetX < 0 || targetX >= BOARD_SIZE || targetY < 0 || targetY >= BOARD_SIZE) {
    return false;
  }
  
  const targetCell = board[targetY][targetX];
  
  // ユニットがすでに存在するセルには移動できない
  if (targetCell.unit) return false;
  
  // 水の地形には移動できない
  if (targetCell.terrain === 'WATER') return false;
  
  // 移動範囲内かチェック
  const distance = Math.abs(unit.x - targetX) + Math.abs(unit.y - targetY);
  return distance <= unit.movementLeft;
}

// ユニットが攻撃可能な対象かどうかを判定
export function isUnitAttackable(
  attacker: Unit | null,
  target: Unit | null
): boolean {
  if (!attacker || !target) return false;
  
  // 自分のユニットは攻撃できない
  if (attacker.player === target.player) return false;
  
  // すでに攻撃済みのユニットは攻撃できない
  if (attacker.hasAttacked) return false;
  
  // 距離をチェック
  const distance = Math.abs(attacker.x - target.x) + Math.abs(attacker.y - target.y);
  return distance <= attacker.attackRange;
}