export type Floor = "roof" | 3 | 2 | 1 | "ground";

export type RoomType =
  | 'classroom'      // 教室
  | 'staffroom'      // 職員室
  | 'sciencelab'     // 理科室
  | 'gymnasium'      // 体育館
  | 'library'        // 図書室
  | 'infirmary'      // 保健室
  | 'musicroom'      // 音楽室
  | 'techlab'        // 技術室
  | 'computerlab'    // コンピューター室
  | 'homeeclab'      // 家庭科室
  | 'avroom'         // 視聴覚室
  | 'pool'           // プール
  | 'dojo'           // 武道場
  | 'broadcastroom'  // 放送室
  | 'principalroom'  // 校長室
  | 'emptyroom'      // 空き教室
  | 'upstairs'       // 上り階段
  | 'downstairs'     // 下り階段
  | 'corridor'       // 廊下
  | 'entrance'       // 昇降口
  | 'ground'         // グラウンド
  | 'tenniscourt'    // テニスコート
  | 'schoolgate'     // 正門
  | 'roof'           // 屋上
  | 'artroom'        // 美術室
  | 'behind_gym'     // 体育館裏
  | 'baseball_field' // 野球場
  | 'student_council' // 生徒会室
  | 'guidance_room'; // 生徒指導室

// 部屋への立ち入り制限レベル
export enum AccessLevel {
  FREE = 0,          // プレイヤー入室可能、生徒も移動可能
  RESTRICTED = 1,    // プレイヤー入室可能、生徒は移動不可（職員室、保健室など）
  FORBIDDEN = 2      // プレイヤー入室不可、生徒も移動不可（校長室）
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  floor: Floor;
  x: number;
  y: number;
  width: number;
  height: number;
  targetFloor?: Floor;     // 階段を使用した時の移動先フロア
  accessLevel: AccessLevel; // 立ち入り制限レベル
  requiredFromCorridor?: boolean; // 廊下からのみアクセス可能
}