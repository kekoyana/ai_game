export type Player = 'PLAYER' | 'COMPUTER';

export type UnitType = 'INFANTRY' | 'TANK' | 'ARTILLERY';

export interface Unit {
  id: string;
  type: UnitType;
  player: Player;
  x: number;
  y: number;
  health: number;
  movement: number;
  movementLeft: number;
  attackRange: number;
  attackPower: number;
  hasAttacked: boolean;
}

export interface Cell {
  x: number;
  y: number;
  terrain: TerrainType;
  unit: Unit | null;
}

export type TerrainType = 'PLAIN' | 'FOREST' | 'MOUNTAIN' | 'WATER';

export interface GameState {
  board: Cell[][];
  currentPlayer: Player;
  selectedUnit: Unit | null;
  gameOver: boolean;
  winner: Player | null;
  playerUnits: Unit[];
  computerUnits: Unit[];
  message: string;
}