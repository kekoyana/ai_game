// src/data/cards.ts

// 商品の種類
export type GoodType = 'indigo' | 'sugar' | 'tobacco' | 'coffee' | 'silver';

// 建物の種類
export type BuildingType = 'production' | 'city';

// 都市施設の効果種別 (仮。必要に応じて詳細化)
export type CityBuildingEffectType =
  | 'production_cost_reduction' // 鍛冶屋
  | 'city_cost_reduction' // 石切場
  | 'produce_bonus' // 井戸、水道橋
  | 'trade_bonus' // 屋台、交易所、マーケット
  | 'council_draw_bonus' // 資料館 (捨てるカード選択)
  | 'council_keep_bonus' // 知事官舎
  | 'prospector_bonus' // 金鉱
  | 'build_action_bonus' // 家具製作所
  | 'trade_action_bonus' // 屋台 (追加ドロー)
  | 'hand_limit_increase' // 塔
  | 'end_turn_vp' // 礼拝堂
  | 'special_build_condition' // 闇市、クレーン
  | 'hand_refill' // 救貧院
  | 'privilege_doubling' // 図書館
  | 'vp_bonus'; // ギルドホール、市役所、宮殿、凱旋門

// 記念施設フラグ
export type MonumentType = 'monument';

// カードの基本インターフェース
interface CardBase {
  id: string; // 各カードインスタンスに付与される一意なID (デッキ生成時に付与)
  cardDefId: string; // カード定義固有のID
  name: string;
  cost: number;
  baseVP: number | ((playerState: any, gameState: any) => number); // 基本勝利点 or 計算関数 (型は仮)
}

// 生産施設カード
export interface ProductionBuildingCard extends CardBase {
  type: 'production';
  produces: GoodType; // 生産する商品の種類
  count: number; // デッキ内の枚数 (定義用)
}

// 都市施設カード
export interface CityBuildingCard extends CardBase {
  type: 'city';
  effectType?: CityBuildingEffectType | CityBuildingEffectType[]; // 効果の種類
  monumentType?: MonumentType; // 記念施設か？
  effectDescription: string; // 効果の説明（表示用）
  count: number; // デッキ内の枚数 (定義用)
}

// 建物カードの型ユニオン
export type BuildingCard = ProductionBuildingCard | CityBuildingCard;

// --- カード定義データ (IDは cardDefId とする) ---
// count はデッキ生成時に参照

// 生産施設
export const indigoPlantDef: Omit<ProductionBuildingCard, 'id'> = {
  cardDefId: 'indigo_plant', name: 'インディゴ染料工場', cost: 1, baseVP: 1, type: 'production', produces: 'indigo', count: 10
};
export const sugarMillDef: Omit<ProductionBuildingCard, 'id'> = {
  cardDefId: 'sugar_mill', name: 'サトウ精製所', cost: 2, baseVP: 1, type: 'production', produces: 'sugar', count: 8
};
export const tobaccoStorageDef: Omit<ProductionBuildingCard, 'id'> = {
  cardDefId: 'tobacco_storage', name: 'タバコ保存所', cost: 3, baseVP: 2, type: 'production', produces: 'tobacco', count: 8
};
export const coffeeRoasterDef: Omit<ProductionBuildingCard, 'id'> = {
  cardDefId: 'coffee_roaster', name: 'コーヒー焙煎場', cost: 4, baseVP: 2, type: 'production', produces: 'coffee', count: 8
};
export const silverSmelterDef: Omit<ProductionBuildingCard, 'id'> = {
  cardDefId: 'silver_smelter', name: 'シルバー精錬所', cost: 5, baseVP: 3, type: 'production', produces: 'silver', count: 8
};

// 都市施設 (TODO: rule.mdに基づいて全ての都市施設を追加する)
export const smithyDef: Omit<CityBuildingCard, 'id'> = {
  cardDefId: 'smithy', name: '鍛冶屋', cost: 1, baseVP: 1, type: 'city', effectType: 'production_cost_reduction', effectDescription: '生産施設建設コスト-1', count: 3
};
export const goldMineDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'gold_mine', name: '金鉱', cost: 1, baseVP: 1, type: 'city', effectType: 'prospector_bonus', effectDescription: '金鉱掘りが選択されたときに4枚めくりコストの重複がなければ1枚入手', count: 3
};
export const archiveDef: Omit<CityBuildingCard, 'id'> = { // 資料館 -> Archive
    cardDefId: 'archive', name: '資料館', cost: 1, baseVP: 1, type: 'city', effectType: 'council_draw_bonus', effectDescription: '参事会議員で捨てるカードを手札からも選べる', count: 3
};
export const wellDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'well', name: '井戸', cost: 2, baseVP: 1, type: 'city', effectType: 'produce_bonus', effectDescription: '2枚以上生産物を置いたときに1枚引く', count: 3
};
export const marketStandDef: Omit<CityBuildingCard, 'id'> = { // 屋台 -> Market Stand
    cardDefId: 'market_stand', name: '屋台', cost: 2, baseVP: 1, type: 'city', effectType: 'trade_action_bonus', effectDescription: '2枚以上生産物を売却したときに追加でカードを1枚引く', count: 3
};
export const blackMarketDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'black_market', name: '闇市', cost: 2, baseVP: 1, type: 'city', effectType: 'special_build_condition', effectDescription: '建設時に生産物を2枚まで1コスト分として使える', count: 3
};
export const craneDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'crane', name: 'クレーン', cost: 2, baseVP: 1, type: 'city', effectType: 'special_build_condition', effectDescription: '建設時に既存建物を建て替えできる。', count: 3
};
export const tradingPostDef: Omit<CityBuildingCard, 'id'> = { // 交易所 -> Trading Post
    cardDefId: 'trading_post', name: '交易所', cost: 2, baseVP: 1, type: 'city', effectType: 'trade_bonus', effectDescription: '売却時に1枚追加で生産物を売れる', count: 3
};
export const poorHouseDef: Omit<CityBuildingCard, 'id'> = { // 救貧院 -> Poor House
    cardDefId: 'poor_house', name: '救貧院', cost: 2, baseVP: 1, type: 'city', effectType: 'hand_refill', effectDescription: '建設後手札が1枚以下なら1枚引く', count: 3
};
export const carpenterDef: Omit<CityBuildingCard, 'id'> = { // 家具製作所 -> Carpenter
    cardDefId: 'carpenter', name: '家具製作所', cost: 3, baseVP: 2, type: 'city', effectType: 'build_action_bonus', effectDescription: '都市建物を建設したとき、1枚引く', count: 3
};
export const prefectureDef: Omit<CityBuildingCard, 'id'> = { // 知事官舎 -> Prefecture
    cardDefId: 'prefecture', name: '知事官舎', cost: 3, baseVP: 2, type: 'city', effectType: 'council_keep_bonus', effectDescription: '参事会議員で手札に残すカードを1枚増やす', count: 3
};
export const aqueductDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'aqueduct', name: '水道橋', cost: 3, baseVP: 2, type: 'city', effectType: 'produce_bonus', effectDescription: '生産時に生産物を1つ追加で置ける', count: 3
};
export const towerDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'tower', name: '塔', cost: 3, baseVP: 2, type: 'city', effectType: 'hand_limit_increase', effectDescription: '手札上限が12枚になる', count: 3
};
export const chapelDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'chapel', name: '礼拝堂', cost: 3, baseVP: 2, type: 'city', effectType: 'end_turn_vp', effectDescription: 'ターンエンドにカード1枚を1点として埋められる', count: 3
};
export const marketHallDef: Omit<CityBuildingCard, 'id'> = { // マーケット -> Market Hall
    cardDefId: 'market_hall', name: 'マーケット', cost: 4, baseVP: 2, type: 'city', effectType: 'trade_bonus', effectDescription: '生産物を売却したとき、追加で1枚引く', count: 3 // 屋台と効果が似ている？ rule.md確認 -> 効果は同じだがコストとVPが違う
};
export const quarryDef: Omit<CityBuildingCard, 'id'> = { // 石切場 -> Quarry
    cardDefId: 'quarry', name: '石切場', cost: 4, baseVP: 2, type: 'city', effectType: 'city_cost_reduction', effectDescription: '都市施設の建設コストを-1する', count: 3
};
export const libraryDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'library', name: '図書館', cost: 5, baseVP: 3, type: 'city', effectType: 'privilege_doubling', effectDescription: '特権の効果を倍にする', count: 3
};
export const statueDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'statue', name: '彫像', cost: 3, baseVP: 3, type: 'city', monumentType: 'monument', effectDescription: '記念施設', count: 3
};
export const victoryColumnDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'victory_column', name: '勝利記念塔', cost: 4, baseVP: 4, type: 'city', monumentType: 'monument', effectDescription: '記念施設', count: 3
};
export const heroStatueDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'hero_statue', name: '騎士像', cost: 5, baseVP: 5, type: 'city', monumentType: 'monument', effectDescription: '記念施設', count: 3
};
// --- コスト6の建物 ---
export const guildHallDef: Omit<CityBuildingCard, 'id'> = {
  cardDefId: 'guild_hall', name: 'ギルドホール', cost: 6, baseVP: 0, // VPは計算で求める
  type: 'city', effectType: 'vp_bonus', effectDescription: '生産施設×2点', count: 2
};
export const cityHallDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'city_hall', name: '市役所', cost: 6, baseVP: 0, type: 'city', effectType: 'vp_bonus', effectDescription: '都市施設×1点', count: 2
};
export const palaceDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'palace', name: '宮殿', cost: 6, baseVP: 0, type: 'city', effectType: 'vp_bonus', effectDescription: '総得点4点につき1点', count: 2
};
export const triumphalArchDef: Omit<CityBuildingCard, 'id'> = {
    cardDefId: 'triumphal_arch', name: '凱旋門', cost: 6, baseVP: 0, type: 'city', effectType: 'vp_bonus', monumentType: 'monument', effectDescription: '記念施設の数が1つなら4点、2つなら6点、3つなら8点', count: 2
};


// 全カード定義リスト (初期山札生成用)
export const allBuildingCardDefs: (Omit<ProductionBuildingCard, 'id'> | Omit<CityBuildingCard, 'id'>)[] = [
  indigoPlantDef, sugarMillDef, tobaccoStorageDef, coffeeRoasterDef, silverSmelterDef,
  smithyDef, goldMineDef, archiveDef, wellDef, marketStandDef, blackMarketDef, craneDef, tradingPostDef, poorHouseDef,
  carpenterDef, prefectureDef, aqueductDef, towerDef, chapelDef, marketHallDef, quarryDef, libraryDef,
  statueDef, victoryColumnDef, heroStatueDef,
  guildHallDef, cityHallDef, palaceDef, triumphalArchDef
];

// 商館タイルの型
export interface TradingHouseTile {
  id: string;
  prices: Record<GoodType, number>; // 商品ごとの売却価格（引けるカード枚数）
}

// 商館タイルデータ
export const tradingHouseTilesData: TradingHouseTile[] = [
  { id: 'tile1', prices: { indigo: 1, sugar: 1, tobacco: 1, coffee: 2, silver: 2 } },
  { id: 'tile2', prices: { indigo: 1, sugar: 1, tobacco: 2, coffee: 2, silver: 2 } },
  { id: 'tile3', prices: { indigo: 1, sugar: 1, tobacco: 2, coffee: 2, silver: 3 } },
  { id: 'tile4', prices: { indigo: 1, sugar: 2, tobacco: 2, coffee: 2, silver: 3 } },
  { id: 'tile5', prices: { indigo: 1, sugar: 2, tobacco: 2, coffee: 3, silver: 3 } },
];

// --- Helper Functions ---

// 配列をシャッフルする関数 (Fisher-Yates shuffle)
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}


// 初期山札を生成する関数
export function createInitialDeck(): BuildingCard[] {
  const deck: BuildingCard[] = [];
  let cardInstanceId = 0; // カードインスタンス固有のID用カウンター
  allBuildingCardDefs.forEach(cardDef => {
    for (let i = 0; i < cardDef.count; i++) {
      // 新しいオブジェクトとして追加し、参照を独立させ、ユニークIDを付与
      deck.push({
          ...cardDef,
          id: `card_${cardInstanceId++}`, // インスタンス固有ID
      } as BuildingCard); // 型アサーション
    }
  });
  return shuffleArray(deck);
}

// 商館タイルをシャッフルする関数
export function shuffleTradingHouseTiles(): TradingHouseTile[] {
    return shuffleArray(tradingHouseTilesData);
}