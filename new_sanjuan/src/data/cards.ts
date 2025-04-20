import { BuildingCard, BuildingEffectType, CardType, GoodType, ProductionCard, VioletCard } from "../types";

/**
 * 生産建物カードのサンプルデータ
 */
export const productionCards: ProductionCard[] = [
  {
    id: "indigo-plant",
    name: "インディゴ農園",
    type: CardType.PRODUCTION,
    victoryPoints: 1,
    cost: 1,
    description: "インディゴを生産します",
    goodType: GoodType.INDIGO
  },
  {
    id: "sugar-mill",
    name: "砂糖農園",
    type: CardType.PRODUCTION,
    victoryPoints: 1,
    cost: 2,
    description: "砂糖を生産します",
    goodType: GoodType.SUGAR
  },
  {
    id: "tobacco-storage",
    name: "タバコ貯蔵庫",
    type: CardType.PRODUCTION,
    victoryPoints: 2,
    cost: 3,
    description: "タバコを生産します",
    goodType: GoodType.TOBACCO
  },
  {
    id: "coffee-roaster",
    name: "コーヒー焙煎所",
    type: CardType.PRODUCTION,
    victoryPoints: 2,
    cost: 4,
    description: "コーヒーを生産します",
    goodType: GoodType.COFFEE
  },
  {
    id: "silver-smelter",
    name: "銀精錬所",
    type: CardType.PRODUCTION,
    victoryPoints: 3,
    cost: 5,
    description: "銀を生産します",
    goodType: GoodType.SILVER
  }
];

/**
 * 一般建物カードのサンプルデータ
 */
export const buildingCards: BuildingCard[] = [
  {
    id: "quarry",
    name: "採石場",
    type: CardType.BUILDING,
    victoryPoints: 1,
    cost: 4,
    description: "建築フェーズ中、建物のコストが1減少します",
    effect: BuildingEffectType.QUARRY
  },
  {
    id: "small-market",
    name: "小さな市場",
    type: CardType.BUILDING,
    victoryPoints: 1,
    cost: 1,
    description: "商人フェーズ中、取引で追加1ドルを得ます",
    effect: BuildingEffectType.MARKET
  },
  {
    id: "small-warehouse",
    name: "小さな倉庫",
    type: CardType.BUILDING,
    victoryPoints: 1,
    cost: 2,
    description: "船長フェーズの終了時に、1種類の商品を保管できます",
    effect: BuildingEffectType.WAREHOUSE
  }
];

/**
 * 紫色の特殊建物カードのサンプルデータ
 */
export const violetCards: VioletCard[] = [
  {
    id: "guild-hall",
    name: "ギルドホール",
    type: CardType.VIOLET,
    victoryPoints: 4,
    cost: 10,
    description: "ゲーム終了時、各生産建物に対して追加勝利点を得ます",
    effect: BuildingEffectType.GUILD_HALL
  },
  {
    id: "city-hall",
    name: "市庁舎",
    type: CardType.VIOLET,
    victoryPoints: 4,
    cost: 10,
    description: "ゲーム終了時、各紫色の建物に対して追加勝利点を得ます",
    effect: BuildingEffectType.CITY_HALL
  },
  {
    id: "residence",
    name: "邸宅",
    type: CardType.VIOLET,
    victoryPoints: 4,
    cost: 10,
    description: "ゲーム終了時、建物の種類数に応じて追加勝利点を得ます",
    effect: BuildingEffectType.RESIDENCE
  },
  {
    id: "fortress",
    name: "砦",
    type: CardType.VIOLET,
    victoryPoints: 4,
    cost: 10,
    description: "ゲーム終了時、建物の数に応じて追加勝利点を得ます",
    effect: BuildingEffectType.FORTRESS
  },
  {
    id: "customs-house",
    name: "税関",
    type: CardType.VIOLET,
    victoryPoints: 4,
    cost: 10,
    description: "ゲーム終了時、勝利点チップ4枚ごとに追加勝利点を得ます",
    effect: BuildingEffectType.CUSTOMS_HOUSE
  },
  {
    id: "city-hall",
    name: "市庁舎",
    type: CardType.VIOLET,
    victoryPoints: 4,
    cost: 10,
    description: "ゲーム終了時、各紫色の建物に対して追加勝利点を得ます",
    effect: BuildingEffectType.CITY_HALL
  },
  {
    id: "tower",
    name: "塔",
    type: CardType.VIOLET,
    victoryPoints: 3,
    cost: 8,
    description: "手札の上限が12枚になります",
    effect: BuildingEffectType.TOWER
  },
  {
    id: "chapel",
    name: "礼拝堂",
    type: CardType.VIOLET,
    victoryPoints: 3,
    cost: 8,
    description: "ゲーム終了時、追加で2勝利点を得ます",
    effect: BuildingEffectType.CHAPEL
  }
];

// すべてのカードを結合
export const allCards = [
  ...productionCards,
  ...buildingCards,
  ...violetCards
]; 