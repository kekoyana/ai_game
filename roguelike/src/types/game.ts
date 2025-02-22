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

export type GameMap = Cell[][];

export type GameState = {
  player: Position;
  map: GameMap;
  rooms: Room[];
  currentFloor: number;
  isGameOver: boolean;
  isGameClear: boolean;
};

export type Direction = 'up' | 'down' | 'left' | 'right';