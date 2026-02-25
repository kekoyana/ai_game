export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  power: number;
  fireRate: number;
  fireCooldown: number;
}

export interface Bullet {
  x: number;
  y: number;
  speed: number;
  damage: number;
}

export interface Enemy {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  speed: number;
  isBoss: boolean;
}

export type GateOperation = '+' | '-' | 'x' | '÷';

export interface GateChoice {
  op: GateOperation;
  value: number;
}

export interface Gate {
  y: number;
  left: GateChoice;
  right: GateChoice;
  passed: boolean;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  side: 'left' | 'right';
  gateIndex: number;
}

export interface StageData {
  enemies: { x: number; y: number; hp: number; isBoss?: boolean }[];
  gates: { y: number; left: GateChoice; right: GateChoice }[];
  obstacles: { x: number; y: number; hp: number; side: 'left' | 'right'; gateIndex: number }[];
  length: number;
}

export type GameScene = 'title' | 'playing' | 'gameover' | 'clear';

export interface GameState {
  scene: GameScene;
  player: Player;
  bullets: Bullet[];
  enemies: Enemy[];
  gates: Gate[];
  obstacles: Obstacle[];
  scrollY: number;
  stageLength: number;
  score: number;
  stage: number;
  canvasWidth: number;
  canvasHeight: number;
  effects: Effect[];
}

export interface Effect {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  color: string;
}
