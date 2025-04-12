// src/__mocks__/cardMocks.ts
import { BuildingCard } from '../data/cards';

export const mockCards: Record<string, BuildingCard> = {
  indigo_plant: {
    id: 'indigo_plant',
    cardDefId: 'indigo_plant',
    name: 'インディゴ工場',
    cost: 1,
    baseVP: 1,
    type: 'production',
    produces: 'indigo',
    count: 8
  },
  sugar_mill: {
    id: 'sugar_mill',
    cardDefId: 'sugar_mill',
    name: '砂糖精製所',
    cost: 2,
    baseVP: 1,
    type: 'production',
    produces: 'sugar',
    count: 8
  },
  tobacco_storage: {
    id: 'tobacco_storage',
    cardDefId: 'tobacco_storage',
    name: 'タバコ貯蔵庫',
    cost: 3,
    baseVP: 2,
    type: 'production',
    produces: 'tobacco',
    count: 8
  },
  coffee_roaster: {
    id: 'coffee_roaster',
    cardDefId: 'coffee_roaster',
    name: 'コーヒー焙煎所',
    cost: 4,
    baseVP: 2,
    type: 'production',
    produces: 'coffee',
    count: 8
  },
  silver_smelter: {
    id: 'silver_smelter',
    cardDefId: 'silver_smelter',
    name: '銀精錬所',
    cost: 5,
    baseVP: 3,
    type: 'production',
    produces: 'silver',
    count: 8
  },
  prefecture: {
    id: 'prefecture',
    cardDefId: 'prefecture',
    name: '知事官舎',
    cost: 3,
    baseVP: 2,
    type: 'city',
    effectDescription: 'カード選択時+1枚保持可能',
    count: 2
  },
  smithy: {
    id: 'smithy',
    cardDefId: 'smithy',
    name: '鍛冶屋',
    cost: 1,
    baseVP: 1,
    type: 'city',
    effectDescription: '生産施設建設コスト-1',
    count: 2
  },
  crane: {
    id: 'crane',
    cardDefId: 'crane',
    name: 'クレーン',
    cost: 2,
    baseVP: 1,
    type: 'city',
    effectDescription: '建物を建て替え可能',
    count: 2
  }
};