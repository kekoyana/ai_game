// 武将の能力値
export interface GeneralStats {
  war: number;     // 武力
  int: number;     // 知力
  lead: number;    // 統率力
  pol: number;     // 政治力
}

// 武将の定義
export interface General {
  id: string;
  name: string;
  stats: GeneralStats;
  loyalty: number;      // 忠誠度
  lordId: string | null; // 所属する君主のID
}

// 武将データ
export const generals: General[] = [
  // 公孫瓚配下
  {
    id: "zhaoyun",
    name: "趙雲",
    stats: { war: 95, int: 85, lead: 90, pol: 75 },
    loyalty: 90,
    lordId: "gongsunzan"
  },

  // 劉備配下
  {
    id: "guanyu",
    name: "関羽",
    stats: { war: 98, int: 80, lead: 95, pol: 70 },
    loyalty: 100,
    lordId: "liubei"
  },
  {
    id: "zhangfei",
    name: "張飛",
    stats: { war: 97, int: 70, lead: 90, pol: 65 },
    loyalty: 100,
    lordId: "liubei"
  },

  // 袁紹配下
  {
    id: "yanliang",
    name: "顔良",
    stats: { war: 90, int: 65, lead: 85, pol: 60 },
    loyalty: 95,
    lordId: "yuanshao"
  },
  {
    id: "wenchou",
    name: "文醜",
    stats: { war: 90, int: 65, lead: 85, pol: 60 },
    loyalty: 95,
    lordId: "yuanshao"
  },

  // 董卓配下
  {
    id: "lubu",
    name: "呂布",
    stats: { war: 100, int: 70, lead: 95, pol: 65 },
    loyalty: 25,
    lordId: "dongzhuo"
  },
  {
    id: "libu",
    name: "李儒",
    stats: { war: 60, int: 95, lead: 75, pol: 90 },
    loyalty: 95,
    lordId: "dongzhuo"
  },

  // 曹操配下
  {
    id: "xiahouyuan",
    name: "夏侯淵",
    stats: { war: 90, int: 75, lead: 85, pol: 70 },
    loyalty: 95,
    lordId: "caocao"
  },
  {
    id: "xiaohudun",
    name: "夏侯惇",
    stats: { war: 95, int: 75, lead: 90, pol: 70 },
    loyalty: 95,
    lordId: "caocao"
  },

  // 孫堅配下
  {
    id: "huangfujin",
    name: "皇甫嵩",
    stats: { war: 85, int: 80, lead: 85, pol: 75 },
    loyalty: 90,
    lordId: "sunjian"
  },
  {
    id: "zhuran",
    name: "朱然",
    stats: { war: 85, int: 75, lead: 80, pol: 70 },
    loyalty: 90,
    lordId: "sunjian"
  },

  // 劉表配下
  {
    id: "huangzhong",
    name: "黄忠",
    stats: { war: 95, int: 75, lead: 85, pol: 70 },
    loyalty: 85,
    lordId: "liubiao"
  },
  {
    id: "weiyan",
    name: "魏延",
    stats: { war: 90, int: 75, lead: 85, pol: 65 },
    loyalty: 75,
    lordId: "liubiao"
  },

  // その他の有力武将
  {
    id: "taishici",
    name: "太史慈",
    stats: { war: 95, int: 80, lead: 85, pol: 70 },
    loyalty: 85,
    lordId: null
  },
  {
    id: "gongsunxu",
    name: "公孫続",
    stats: { war: 75, int: 85, lead: 80, pol: 85 },
    loyalty: 90,
    lordId: null
  }
];

// 君主IDから配下の武将リストを取得
export const getGeneralsByLordId = (lordId: string | null): General[] => {
  return generals.filter(general => general.lordId === lordId);
};