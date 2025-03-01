export type Gender = 'male' | 'female';
export type Grade = 1 | 2 | 3;
export type Class = 'A' | 'B' | 'C' | 'D';

export type Interest = 'high' | 'normal' | 'none';

export interface Interests {
  study: Interest;
  sports: Interest;
  video: Interest;
  games: Interest;
  fashion: Interest;
  sns: Interest;
  music: Interest;
  love: Interest;
}

export type Trait = 
  | 'glasses'      // メガネ
  | 'science'      // 理系
  | 'literature'   // 文系
  | 'athletic'     // 運動系
  | 'artistic'     // 芸術系
  | 'leadership'   // リーダー気質
  | 'diligent'     // 真面目
  | 'rebellious'   // 反抗的
  | 'cheerful'     // 明るい
  | 'quiet';       // 静か

export type Faction = 'status_quo' | 'sports' | 'academic';

export interface FactionSupport {
  status_quo: number; // 現状維持派
  sports: number;     // スポーツ派
  academic: number;   // 進学派
}

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  grade: Grade;
  class: Class;
  reputation: number;     // 評判 (0-60000)
  intelligence: number;   // 知力 (0-200)
  strength: number;      // 武力 (0-200)
  charisma: number;      // 魅力 (0-200)
  traits: Trait[];       // 属性（複数可）
  interests: Interests;  // 好み
  support: FactionSupport; // 支持率
  isLeader?: boolean;    // ボスかどうか
  faction?: Faction;     // 所属派閥（ボスの場合）
}