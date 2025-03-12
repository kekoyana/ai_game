// 君主の定義
export interface Lord {
  id: string;        // 君主の一意のID
  name: string;      // 君主の名前
  active: boolean;   // アクティブな君主かどうか
}

// 君主のデータ
export const lords: { [key: string]: Lord } = {
  gongsunzan: {
    id: "gongsunzan",
    name: "公孫瓚",
    active: true
  },
  liubei: {
    id: "liubei",
    name: "劉備",
    active: true
  },
  yuanshao: {
    id: "yuanshao",
    name: "袁紹",
    active: true
  },
  kongrong: {
    id: "kongrong",
    name: "孔融",
    active: true
  },
  dongzhuo: {
    id: "dongzhuo",
    name: "董卓",
    active: true
  },
  caocao: {
    id: "caocao",
    name: "曹操",
    active: true
  },
  yuanshu: {
    id: "yuanshu",
    name: "袁術",
    active: true
  },
  taoqian: {
    id: "taoqian",
    name: "陶謙",
    active: true
  },
  sunjian: {
    id: "sunjian",
    name: "孫堅",
    active: true
  },
  mateng: {
    id: "mateng",
    name: "馬騰",
    active: true
  },
  liuyan: {
    id: "liuyan",
    name: "劉焉",
    active: true
  },
  liubiao: {
    id: "liubiao",
    name: "劉表",
    active: true
  }
};