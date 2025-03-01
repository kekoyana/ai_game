export type Gender = 0 | 1; // 0: 男性, 1: 女性
export type Grade = 1 | 2 | 3;
export type Class = 'A' | 'B' | 'C' | 'D';

// 興味関心レベル: 0: なし, 1: 普通, 2: 高い
export type InterestLevel = 0 | 1 | 2;

export interface Interests {
  study: InterestLevel;
  sports: InterestLevel;
  video: InterestLevel;
  games: InterestLevel;
  fashion: InterestLevel;
  sns: InterestLevel;
  music: InterestLevel;
  love: InterestLevel;
}

// 属性の数値定義
export enum TraitId {
  GLASSES = 1,    // メガネ
  SCIENCE = 2,    // 理系
  LITERATURE = 3, // 文系
  ATHLETIC = 4,   // 運動系
  ARTISTIC = 5,   // 芸術系
  LEADERSHIP = 6, // リーダー気質
  DILIGENT = 7,   // 真面目
  REBELLIOUS = 8, // 反抗的
  CHEERFUL = 9,   // 明るい
  QUIET = 10      // 静か
}

export type Faction = 'status_quo' | 'sports' | 'academic';

export interface FactionSupport {
  status_quo: number; // 現状維持派
  sports: number;     // スポーツ派
  academic: number;   // 進学派
}

export interface Student {
  id: number;
  lastName: string;   // 姓
  firstName: string;  // 名
  gender: Gender;
  grade: Grade;
  class: Class;
  reputation: number;      // 評判 (0-60000)
  intelligence: number;    // 知力 (0-200)
  strength: number;       // 武力 (0-200)
  charisma: number;       // 魅力 (0-200)
  traitIds: number[];     // 属性ID配列
  interests: Interests;   // 好み（数値で保持）
  support: FactionSupport; // 支持率
  faction: Faction;       // 所属派閥（最も支持率が高い派閥）
  isLeader: boolean;     // ボスかどうか
}

// 興味関心の文字列と数値の変換
export const InterestLevelMap = {
  none: 0,
  normal: 1,
  high: 2,
} as const;

// 属性名と数値の変換マップ
export const TraitNameMap: { [key: string]: number } = {
  glasses: TraitId.GLASSES,
  science: TraitId.SCIENCE,
  literature: TraitId.LITERATURE,
  athletic: TraitId.ATHLETIC,
  artistic: TraitId.ARTISTIC,
  leadership: TraitId.LEADERSHIP,
  diligent: TraitId.DILIGENT,
  rebellious: TraitId.REBELLIOUS,
  cheerful: TraitId.CHEERFUL,
  quiet: TraitId.QUIET,
};