/**
 * サンファンゲームの基本データ型定義
 */

// カードの種類
export enum CardType {
  BUILDING = "building",      // 建物カード
  PRODUCTION = "production",  // 生産建物カード
  VIOLET = "violet"           // 紫色の建物カード（特殊効果）
}

// 生産物の種類
export enum GoodType {
  INDIGO = "indigo",   // インディゴ
  SUGAR = "sugar",     // 砂糖
  TOBACCO = "tobacco", // タバコ
  COFFEE = "coffee",   // コーヒー
  SILVER = "silver"    // 銀
}

// 建物の効果タイプ
export enum BuildingEffectType {
  NONE = "none",             // 効果なし
  QUARRY = "quarry",         // 採石場
  PRODUCTION = "production", // 生産
  TRADE = "trade",           // 取引
  PRIVILEGE = "privilege",   // 特権
  CHAPEL = "chapel",         // 礼拝堂
  CITY_HALL = "city_hall",   // 市庁舎
  GUILD_HALL = "guild_hall", // ギルドホール
  RESIDENCE = "residence",   // 邸宅
  FORTRESS = "fortress",     // 砦
  CUSTOMS_HOUSE = "customs_house", // 税関
  TOWER = "tower",           // 塔
  LIBRARY = "library",       // 図書館
  PREFECTURE = "prefecture", // 県庁
  STATUE = "statue",         // 銅像
  HERO = "hero",             // 英雄
  GARDEN = "garden",         // 庭園
  OFFICE = "office",         // 事務所
  MARKET = "market",         // 市場
  WAREHOUSE = "warehouse",   // 倉庫
  UNIVERSITY = "university", // 大学
  FACTORY = "factory",       // 工場
  HARBOR = "harbor",         // 港
  WHARF = "wharf"            // 船着場
}

// 役割カード
export enum RoleType {
  BUILDER = "builder",       // 建築家
  PRODUCER = "producer",     // 生産者
  TRADER = "trader",         // 商人
  COUNCILLOR = "councillor", // 参謀
  PROSPECTOR = "prospector", // 金鉱掘り
  CAPTAIN = "captain",       // 船長
  MAYOR = "mayor"            // 市長
}

// カードの基本インターフェース
export interface Card {
  id: string;                // カードID
  name: string;              // カード名
  type: CardType;            // カードの種類
  victoryPoints: number;     // 勝利点
  cost: number;              // 建設コスト
  description: string;       // 説明テキスト
}

// 建物カード（標準的な建物）
export interface BuildingCard extends Card {
  type: CardType.BUILDING;
  effect: BuildingEffectType; // 建物の効果
}

// 生産建物カード
export interface ProductionCard extends Card {
  type: CardType.PRODUCTION;
  goodType: GoodType;         // 生産物の種類
}

// 紫色の特殊建物カード
export interface VioletCard extends Card {
  type: CardType.VIOLET;
  effect: BuildingEffectType; // 特殊効果
}

// ゲーム中に建設された建物
export interface Building {
  card: BuildingCard | ProductionCard | VioletCard; // 対応するカード
  isOccupied: boolean;        // 生産フェーズで使用済みかどうか
  goods: GoodType[];          // 置かれている商品（生産建物の場合）
}

// 生産物
export interface Good {
  type: GoodType;             // 生産物の種類
}

// プレイヤーの状態
export interface PlayerState {
  id: string;                 // プレイヤーID
  name: string;               // プレイヤー名
  hand: Card[];               // 手札
  buildings: Building[];      // 建設済みの建物
  goods: Good[];              // 所持している生産物
  victoryPoints: number;      // 勝利点
  quarryCount: number;        // 採石場の数
  tradeBonuses: {             // 取引ボーナス
    [key in GoodType]?: number;
  };
  money: number;              // 所持金
  isGovernor: boolean;        // 総督かどうか
  currentRole: RoleType | null; // 選択した役割
}

// ゲーム全体の状態
export interface GameState {
  players: PlayerState[];     // プレイヤーリスト
  drawPile: Card[];           // 山札
  discardPile: Card[];        // 捨て札
  availableBuildings: Card[]; // 場に出ている建物カード
  marketPrices: {             // 市場価格
    [key in GoodType]: number;
  };
  currentGovernor: number;    // 現在の総督（プレイヤーインデックス）
  currentPlayerIndex: number; // 現在のプレイヤーインデックス
  currentPhase: string;       // 現在のゲームフェーズ
  availableRoles: RoleType[]; // 残っている役割カード
  selectedRole: RoleType | null; // 選ばれた役割
  round: number;              // 現在のラウンド
  isGameOver: boolean;        // ゲーム終了フラグ
} 