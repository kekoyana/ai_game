// ドロップの種類を定義
export type OrbType = 'fire' | 'water' | 'wood' | 'light' | 'dark' | 'heal';

// ドロップの位置情報
export interface Position {
  row: number;
  col: number;
}

// ドロップの状態
export interface Orb {
  type: OrbType;
  id: string;
  isMoving?: boolean;
}

// ゲームの状態
export interface GameState {
  board: Orb[][];
  selectedOrb: Position | null;
  isMoving: boolean;
  combo: number;
  time: number;
}