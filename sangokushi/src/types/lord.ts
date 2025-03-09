// 君主の定義
export interface Lord {
  id: string;        // 君主の一意のID
  name: string;      // 君主の名前
  strength: number;  // 軍事力（後の実装のために追加）
  active: boolean;   // アクティブな君主かどうか
}

// 君主のデータ
export const lords: { [key: string]: Lord } = {
  gongsunzan: {
    id: "gongsunzan",
    name: "公孫瓚",
    strength: 70,
    active: true
  },
  liubei: {
    id: "liubei",
    name: "劉備",
    strength: 85,
    active: true
  },
  yuanshao: {
    id: "yuanshao",
    name: "袁紹",
    strength: 90,
    active: true
  },
  kongrong: {
    id: "kongrong",
    name: "孔融",
    strength: 65,
    active: true
  },
  dongzhuo: {
    id: "dongzhuo",
    name: "董卓",
    strength: 95,
    active: true
  },
  caocao: {
    id: "caocao",
    name: "曹操",
    strength: 95,
    active: true
  },
  yuanshu: {
    id: "yuanshu",
    name: "袁術",
    strength: 75,
    active: true
  },
  taoqian: {
    id: "taoqian",
    name: "陶謙",
    strength: 65,
    active: true
  },
  sunjian: {
    id: "sunjian",
    name: "孫堅",
    strength: 85,
    active: true
  },
  mateng: {
    id: "mateng",
    name: "馬騰",
    strength: 75,
    active: true
  },
  liuyan: {
    id: "liuyan",
    name: "劉焉",
    strength: 70,
    active: true
  },
  liubiao: {
    id: "liubiao",
    name: "劉表",
    strength: 75,
    active: true
  }
};