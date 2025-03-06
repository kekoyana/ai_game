import { Faction } from './student';

export interface ClassRepresentative {
  studentId: number;
  role: 'representative' | 'viceRepresentative';
}

export interface ClassData {
  grade: number;
  name: string;  // A, B, C, D
  faction: Faction;
  representatives: ClassRepresentative[];
  studentIds: number[];
}

export interface ClassFactionInfluence {
  leadershipBonus: number;  // LEADERSHIPを持つ代表の影響力ボーナス
  quietPenalty: number;     // QUIETを持つ代表の影響力ペナルティ
  viceRepWeight: number;    // 副代表の影響力の重み
  memberWeight: number;     // 一般メンバーの影響力の重み
}

// 派閥の影響力の設定
export const FACTION_INFLUENCE: ClassFactionInfluence = {
  leadershipBonus: 2.0,    // LEADERSHIPを持つ代表は2倍の影響力
  quietPenalty: 0.5,       // QUIETを持つ代表は0.5倍の影響力
  viceRepWeight: 0.5,      // 副代表は0.5倍の影響力
  memberWeight: 0.2,       // 一般メンバーは0.2倍の影響力
};