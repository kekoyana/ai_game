export type Floor = 1 | 2 | 3 | "ground";

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
  | 'schoolgate';    // 正門（校庭から校内への入口）

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  floor: Floor;
  x: number;
  y: number;
  width: number;
  height: number;
  targetFloor?: Floor; // 階段を使用した時の移動先フロア
}