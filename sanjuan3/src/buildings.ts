export type Building = {
  name: string;
  type: "生産施設" | "都市施設" | "記念施設";
  cost: number;
  basePoint: number;
  effect?: string;
  count?: number;
};

export const buildings: Building[] = [
  // 生産施設
  { name: "インディゴ染料工場", type: "生産施設", cost: 1, basePoint: 1, effect: "インディゴを生産", count: 10 },
  { name: "サトウ精製所", type: "生産施設", cost: 2, basePoint: 1, effect: "サトウを生産", count: 8 },
  { name: "タバコ保存所", type: "生産施設", cost: 3, basePoint: 2, effect: "タバコを生産", count: 8 },
  { name: "コーヒー焙煎場", type: "生産施設", cost: 4, basePoint: 2, effect: "コーヒーを生産", count: 8 },
  { name: "シルバー精錬所", type: "生産施設", cost: 5, basePoint: 3, effect: "シルバーを生産", count: 8 },

  // テスト用追加
  { name: "製糖所", type: "生産施設", cost: 2, basePoint: 1, effect: "サトウを生産", count: 8 },
  { name: "製材所", type: "生産施設", cost: 2, basePoint: 1, effect: "木材を生産", count: 8 },
  { name: "市場", type: "都市施設", cost: 2, basePoint: 1, effect: "売却時に追加で1枚引く", count: 3 },
  { name: "市役所", type: "都市施設", cost: 4, basePoint: 2, effect: "建設時に追加点", count: 3 },
  // 都市施設（一部抜粋、続きは必要に応じて追加）
  { name: "鍛冶屋", type: "都市施設", cost: 1, basePoint: 1, effect: "生産施設建設コスト-1", count: 3 },
  { name: "金鉱", type: "都市施設", cost: 1, basePoint: 1, effect: "金鉱掘り時に4枚めくり重複なければ1枚入手", count: 3 },
  { name: "資料館", type: "都市施設", cost: 1, basePoint: 1, effect: "参事会議員で捨てるカードを手札からも選べる", count: 3 },
  { name: "井戸", type: "都市施設", cost: 2, basePoint: 1, effect: "2枚以上生産物を置いたとき1枚引く", count: 3 },
  { name: "屋台", type: "都市施設", cost: 2, basePoint: 1, effect: "2枚以上生産物を売却したとき追加で1枚引く", count: 3 },
  { name: "闇市", type: "都市施設", cost: 2, basePoint: 1, effect: "建設時に生産物を2枚まで1コスト分として使える", count: 3 },
  { name: "クレーン", type: "都市施設", cost: 2, basePoint: 1, effect: "建設時に既存建物を建て替えできる", count: 3 },
  { name: "交易所", type: "都市施設", cost: 2, basePoint: 1, effect: "売却時に1枚追加で生産物を売れる", count: 3 },
  { name: "救貧院", type: "都市施設", cost: 2, basePoint: 1, effect: "建設後手札が1枚以下なら1枚引く", count: 3 },
  { name: "家具製作所", type: "都市施設", cost: 3, basePoint: 2, effect: "都市建物を建設したとき1枚引く", count: 3 },
  { name: "知事官舎", type: "都市施設", cost: 3, basePoint: 2, effect: "参事会議員で手札に残すカードを1枚増やす", count: 3 },
  { name: "水道橋", type: "都市施設", cost: 3, basePoint: 2, effect: "生産時に生産物を1つ追加で置ける", count: 3 },
  { name: "塔", type: "都市施設", cost: 3, basePoint: 2, effect: "手札上限が12枚になる", count: 3 },
  { name: "礼拝堂", type: "都市施設", cost: 3, basePoint: 2, effect: "ターンエンドにカード1枚を1点として埋められる", count: 3 },
  { name: "マーケット", type: "都市施設", cost: 4, basePoint: 2, effect: "生産物を売却したとき追加で1枚引く", count: 3 },
  { name: "石切場", type: "都市施設", cost: 4, basePoint: 2, effect: "都市施設の建設コスト-1", count: 3 },
  { name: "図書館", type: "都市施設", cost: 5, basePoint: 3, effect: "特権の効果を倍にする", count: 3 },

  // 記念施設（一部抜粋）
  { name: "彫像", type: "記念施設", cost: 3, basePoint: 3, count: 1 },
  { name: "勝利記念塔", type: "記念施設", cost: 4, basePoint: 4, count: 1 },
  { name: "騎士像", type: "記念施設", cost: 5, basePoint: 5, count: 1 },
];