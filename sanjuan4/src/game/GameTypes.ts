// プレイヤー種別
export type PlayerType = 'human' | 'cpu';

// 役割
export type Role =
  | 'builder'      // 建築士
  | 'producer'     // 監督
  | 'trader'       // 商人
  | 'councillor'   // 参事会議員
  | 'prospector';  // 金鉱掘り

export const RoleNames: Record<Role, string> = {
  builder: '建築士',
  producer: '監督',
  trader: '商人',
  councillor: '参事会議員',
  prospector: '金鉱掘り',
};

// 建物カテゴリ
export type BuildingCategory = 'production' | 'city' | 'monument';

// 建物カード
export interface BuildingCard {
  id: string;
  name: string;
  cost: number;
  basePoint: number;
  category: BuildingCategory;
  effect?: string;
}

// プレイヤー
export interface Player {
  id: number;
  name: string;
  type: PlayerType;
  hand: string[]; // カードID
  buildings: string[]; // 建物カードID
  products: { [buildingId: string]: string | null }; // 生産施設ごとの商品
  isGovernor: boolean;
}

// ゲーム状態
export interface GameState {
  round: number;
  players: Player[];
  deck: string[]; // 山札（カードID）
  discard: string[]; // 捨て札
  availableRoles: Role[];
  currentRole: Role | null;
  currentPlayerIndex: number;
  log: string[];
  marketTiles: number[][];
}