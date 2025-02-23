export type Position = {
  x: number;
  y: number;
};

export type Room = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CellType = 'wall' | 'floor' | 'stairs';

export type Cell = {
  type: CellType;
  isVisible: boolean;
};

export type Status = {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  level: number;
};

export type Monster = {
  position: Position;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  exp: number;
  isVisible: boolean;
  symbol: string;
  name: string;
};

export type ItemType = 'potion' | 'weapon' | 'armor';

export type Item = {
  position: Position | null; // nullの場合はインベントリ内
  type: ItemType;
  name: string;
  symbol: string;
  power: number;
  isVisible: boolean;
  isEquipped: boolean;
};

export type InventoryType = {
  items: Item[];
  maxSize: number;
};

export type EquipmentType = {
  weapon: Item | null;
  armor: Item | null;
};

export type GameMap = Cell[][];

export type BattleLog = {
  message: string;
  timestamp: number;
};

export type GameState = {
  player: Position;
  playerStatus: Status;
  map: GameMap;
  rooms: Room[];
  monsters: Monster[];
  items: Item[];
  inventory: InventoryType;
  equipment: EquipmentType;
  battleLogs: BattleLog[];
  currentFloor: number;
  isGameOver: boolean;
  isGameClear: boolean;
};

export type Direction = 
  | 'up' 
  | 'down' 
  | 'left' 
  | 'right'
  | 'upleft'
  | 'upright'
  | 'downleft'
  | 'downright';