export type Position = {
  x: number;
  y: number;
};

export type Cell = {
  type: 'wall' | 'floor';
  isVisible: boolean;
};

export type GameMap = Cell[][];

export type GameState = {
  player: Position;
  map: GameMap;
  isGameOver: boolean;
};

export type Direction = 'up' | 'down' | 'left' | 'right';