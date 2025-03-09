export interface NationStatus {
  id: string;
  provinceId: string;
  gold: number;        // 金
  food: number;        // 兵糧
  population: number;  // 人口
  loyalty: number;     // 民忠 (0-100)
  commerce: number;    // 商業 (0-100)
  agriculture: number; // 土地 (0-100)
  military: number;    // 兵力
  arms: number;        // 武装 (0-100)
  training: number;    // 訓練 (0-100)
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
        gold: 1000,
        food: 10000,
        population: 100000,
        loyalty: 80,
        commerce: 60,
        agriculture: 60,
        military: 5000,
        arms: 70,
        training: 70,
      }
    : {
        gold: 500,
        food: 5000,
        population: 80000,
        loyalty: 70,
        commerce: 50,
        agriculture: 50,
        military: 3000,
        arms: 60,
        training: 60,
      };

  return {
    id,
    provinceId,
    ...baseValues,
  };
};

// ステータスの表示用ラベル
export const statusLabels = {
  gold: "金",
  food: "兵糧",
  population: "人口",
  loyalty: "民忠",
  commerce: "商業",
  agriculture: "土地",
  military: "兵力",
  arms: "武装",
  training: "訓練"
} as const;

// 月収の計算
export const calculateMonthlyIncome = (nation: NationStatus, month: number): { gold: number; food: number } => {
  // 商業による金収入（毎月）
  const goldIncome = Math.floor(nation.commerce * 10 * (nation.loyalty / 100));

  // 土地による兵糧収入（7月のみ）
  const foodIncome = month === 7
    ? Math.floor(nation.agriculture * 100 * (nation.loyalty / 100))
    : 0;

  return {
    gold: goldIncome,
    food: foodIncome
  };
};