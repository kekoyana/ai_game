export interface PlayerStats {
  academic: number;    // 学力（0-1000）
  physical: number;    // 体力（0-1000）
  social: number;      // 社交性（0-1000）
  stress: number;      // ストレス（0-100）
  energy: number;      // 体力（0-100）
}

export interface Relationships {
  [key: string]: number;  // 各キャラクターとの関係値
}

export interface PlayerState {
  name: string;
  stats: PlayerStats;
  relationships: Relationships;
  money: number;
  day: number;
  time: 'morning' | 'afternoon' | 'evening';
  isWeekend: boolean;
}