export interface Soldier {
  id: number;
  x: number;
  y: number;
  team: 'A' | 'B';
  hp: number;
  canMove: boolean;
}

export interface Formation {
  name: string;
  positions: { x: number; y: number }[];
}

export type AttackType = 'normal' | 'surround' | 'breakthrough';

export interface AttackStrategy {
  name: string;
  type: AttackType;
  description: string;
}

export const attackStrategies: AttackStrategy[] = [
  {
    name: '通常攻撃',
    type: 'normal',
    description: '通常の攻撃パターン'
  },
  {
    name: '包囲攻撃',
    type: 'surround',
    description: '両端の兵が敵を包囲'
  },
  {
    name: '突破攻撃',
    type: 'breakthrough',
    description: '敵陣を突破して分断'
  }
];