export interface PlayerStats {
  academic: number;     // 学力（0-1000）
  physical: number;     // 体力（0-1000）
  social: number;       // 社交性（0-1000）
  artistic: number;     // 芸術性（0-1000）
  intelligence: number; // 知性（0-1000）
  charisma: number;     // カリスマ性（0-1000）
  athletic: number;     // 運動神経（0-1000）
  stress: number;       // ストレス（0-100）
  energy: number;       // 体力（0-100）
}

export interface Relationships {
  [key: string]: number;  // 各キャラクターとの関係値（0-100）
}

// 部活動の種類
export type ClubType = 'none' | 'sports' | 'cultural' | 'student_council';

export interface PlayerState {
  name: string;
  stats: PlayerStats;
  relationships: Relationships;
  money: number;
  day: number;
  time: 'morning' | 'afternoon' | 'evening';
  isWeekend: boolean;
  club: ClubType; // 所属している部活
}