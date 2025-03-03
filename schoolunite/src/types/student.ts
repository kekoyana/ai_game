import { ClubId } from './club';

export type Gender = 0 | 1; // 0: 男性, 1: 女性
export type Grade = 1 | 2 | 3;
export type Class = 'A' | 'B' | 'C' | 'D';

// 興味関心レベル: 0: なし, 1: 普通, 2: 高い
export type InterestLevel = 0 | 1 | 2;

// 好みレベル: 0: 嫌い, 1: 普通, 2: 好き
export type PreferenceLevel = 0 | 1 | 2;

export interface Interests {
  study: InterestLevel;
  athletic: InterestLevel;  // 運動への興味
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

// 属性に対する好みを保持する型
export interface TraitPreferences {
  glasses: PreferenceLevel;    // メガネ
  science: PreferenceLevel;    // 理系
  literature: PreferenceLevel; // 文系
  athletic: PreferenceLevel;   // 運動系
  artistic: PreferenceLevel;   // 芸術系
  leadership: PreferenceLevel; // リーダー気質
  diligent: PreferenceLevel;   // 真面目
  rebellious: PreferenceLevel; // 反抗的
  cheerful: PreferenceLevel;   // 明るい
  quiet: PreferenceLevel;      // 静か
}

export type Faction = 'status_quo' | 'militar' | 'academic';

// 派閥の表示名を定義
export const FACTION_NAMES: Record<Faction, string> = {
  'status_quo': '穏健派',
  'militar': '体育派',
  'academic': '進学派',
};

export interface FactionSupport {
  status_quo: number; // 穏健派
  militar: number;   // 体育派
  academic: number;  // 進学派
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
  traitPreferences: TraitPreferences; // 属性に対する好み
  interests: Interests;   // 好み（数値で保持）
  support: FactionSupport; // 支持率
  faction: Faction;       // 所属派閥（最も支持率が高い派閥）
  isLeader: boolean;     // ボスかどうか
  clubId: ClubId;        // 所属部活動
  currentHp: number;     // 現在のHP
  maxHp: number;         // 最大HP
  friendship: number;    // 親密度（0-100）
}

// 好みレベルの文字列と数値の変換
export const PreferenceLevelMap = {
  dislike: 0, // 嫌い
  normal: 1,  // 普通
  like: 2,    // 好き
} as const;

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