// src/store/gameActions.ts
import { BuildingCard } from '../data/cards';
import { Role } from './gameStore';

// アクションごとのパラメータ型を定義
// アクションの種類を定義
export type GameActionType = 
  | 'SELECT_ROLE'        // 役割の選択
  | 'BUILD'              // 建物の建設
  | 'PRODUCE'            // 商品の生産
  | 'TRADE'             // 商品の売却
  | 'COUNCIL_DRAW'      // 参事会議員のカードドロー
  | 'COUNCIL_KEEP'      // 参事会議員のカード選択
  | 'PROSPECTOR_DRAW'   // 金鉱掘りのカードドロー
  | 'PASS'              // アクションのパス
  | 'END_ACTION'        // アクションの終了
  | 'END_ROUND'         // ラウンドの終了
  | 'END_GAME';         // ゲームの終了

// アクションのパラメータ型を定義
export type GameActionParams = {
  SELECT_ROLE: {
    role: Role;
  };
  BUILD: {
    playerId: string;
    buildingCard: BuildingCard;
    paymentCardIds: string[];  // 支払いに使用するカードのID
    targetBuildingId?: string; // クレーン使用時の建て替え対象
  };
  PRODUCE: {
    playerId: string;
    productionBuildingIds: string[]; // 生産を行う建物のID
  };
  TRADE: {
    playerId: string;
    goodsBuildingIds: string[]; // 売却する商品が置かれている建物のID
  };
  COUNCIL_DRAW: {
    playerId: string;
  };
  COUNCIL_KEEP: {
    playerId: string;
    keepCardIds: string[]; // 手札に加えるカードのID
    discardCardIds: string[]; // 捨てるカードのID
  };
  PROSPECTOR_DRAW: {
    playerId: string;
  };
  PASS: {
    playerId: string;
  };
  END_ACTION: Record<string, never>;
  END_ROUND: Record<string, never>;
  END_GAME: Record<string, never>;
};

// アクションの型定義
export type GameAction =
  | { type: 'SELECT_ROLE'; params: GameActionParams['SELECT_ROLE'] }
  | { type: 'BUILD'; params: GameActionParams['BUILD'] }
  | { type: 'PRODUCE'; params: GameActionParams['PRODUCE'] }
  | { type: 'TRADE'; params: GameActionParams['TRADE'] }
  | { type: 'COUNCIL_DRAW'; params: GameActionParams['COUNCIL_DRAW'] }
  | { type: 'COUNCIL_KEEP'; params: GameActionParams['COUNCIL_KEEP'] }
  | { type: 'PROSPECTOR_DRAW'; params: GameActionParams['PROSPECTOR_DRAW'] }
  | { type: 'PASS'; params: GameActionParams['PASS'] }
  | { type: 'END_ACTION'; params: Record<string, never> }
  | { type: 'END_ROUND'; params: Record<string, never> }
  | { type: 'END_GAME'; params: Record<string, never> };

// アクション作成関数
export const gameActions = {
  selectRole: (role: Role): GameAction => ({
    type: 'SELECT_ROLE',
    params: { role }
  }),

  build: (
    playerId: string,
    buildingCard: BuildingCard,
    paymentCardIds: string[],
    targetBuildingId?: string
  ): GameAction => ({
    type: 'BUILD',
    params: { playerId, buildingCard, paymentCardIds, targetBuildingId }
  }),

  produce: (
    playerId: string,
    productionBuildingIds: string[]
  ): GameAction => ({
    type: 'PRODUCE',
    params: { playerId, productionBuildingIds }
  }),

  trade: (
    playerId: string,
    goodsBuildingIds: string[]
  ): GameAction => ({
    type: 'TRADE',
    params: { playerId, goodsBuildingIds }
  }),

  councilDraw: (playerId: string): GameAction => ({
    type: 'COUNCIL_DRAW',
    params: { playerId }
  }),

  councilKeep: (
    playerId: string,
    keepCardIds: string[],
    discardCardIds: string[]
  ): GameAction => ({
    type: 'COUNCIL_KEEP',
    params: { playerId, keepCardIds, discardCardIds }
  }),

  prospectorDraw: (playerId: string): GameAction => ({
    type: 'PROSPECTOR_DRAW',
    params: { playerId }
  }),

  pass: (playerId: string): GameAction => ({
    type: 'PASS',
    params: { playerId }
  }),

  endAction: (): GameAction => ({
    type: 'END_ACTION',
    params: {}
  }),

  endRound: (): GameAction => ({
    type: 'END_ROUND',
    params: {}
  }),

  endGame: (): GameAction => ({
    type: 'END_GAME',
    params: {}
  })
};