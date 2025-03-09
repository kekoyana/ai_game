// 施設の種類
export interface Facilities {
  castle: number;      // 城壁レベル（防御力に影響）
  market: number;      // 市場レベル（民力に影響）
  farm: number;        // 農場レベル（食料生産に影響）
  barracks: number;    // 兵舎レベル（兵力の上限に影響）
  blacksmith: number;  // 鍛冶屋レベル（軍事力に影響）
}

// 資源の種類
export interface Resources {
  gold: number;     // 金
  food: number;     // 食料
  weapons: number;  // 武器
  horses: number;   // 馬
}

// 国の状態
export interface NationStatus {
  id: string;
  provinceId: string;        // 所属する州のID
  civilPower: number;        // 民力 (0-100)
  militaryPower: number;     // 兵力 (0-10000)
  civilLoyalty: number;      // 民忠 (0-100)
  population: number;        // 人口
  facilities: Facilities;    // 施設レベル
  resources: Resources;      // 資源量
  income: {                  // 1ターンあたりの収入
    gold: number;
    food: number;
  };
}

// 初期状態の生成関数
export const createInitialNationStatus = (
  id: string,
  provinceId: string,
  isPlayerNation: boolean = false
): NationStatus => {
  // プレイヤーの初期国は若干有利に
  const baseValues = isPlayerNation
    ? {
        civilPower: 70,
        militaryPower: 5000,
        civilLoyalty: 80,
        population: 100000,
      }
    : {
        civilPower: 60,
        militaryPower: 3000,
        civilLoyalty: 70,
        population: 80000,
      };

  return {
    id,
    provinceId,
    ...baseValues,
    facilities: {
      castle: isPlayerNation ? 2 : 1,
      market: isPlayerNation ? 2 : 1,
      farm: isPlayerNation ? 2 : 1,
      barracks: isPlayerNation ? 2 : 1,
      blacksmith: isPlayerNation ? 2 : 1,
    },
    resources: {
      gold: isPlayerNation ? 1000 : 500,
      food: isPlayerNation ? 10000 : 5000,
      weapons: isPlayerNation ? 1000 : 500,
      horses: isPlayerNation ? 100 : 50,
    },
    income: {
      gold: isPlayerNation ? 100 : 50,
      food: isPlayerNation ? 1000 : 500,
    },
  };
};

// ステータスの表示用ラベル
export const statusLabels = {
  civilPower: "民力",
  militaryPower: "兵力",
  civilLoyalty: "民忠",
  population: "人口",
  facilities: {
    castle: "城壁",
    market: "市場",
    farm: "農場",
    barracks: "兵舎",
    blacksmith: "鍛冶屋"
  },
  resources: {
    gold: "金",
    food: "食料",
    weapons: "武器",
    horses: "馬"
  }
};