import { Building, GameState, Good, GoodType, PlayerState, RoleType } from "../types";
import { allCards, buildingCards, productionCards, violetCards } from "./cards";

// サンプル建物
const sampleBuildings: Building[] = [
  {
    card: productionCards[0], // インディゴ農園
    isOccupied: false,
    goods: []
  },
  {
    card: buildingCards[0], // 採石場
    isOccupied: false,
    goods: []
  }
];

// サンプル生産物
const sampleGoods: Good[] = [
  { type: GoodType.INDIGO },
  { type: GoodType.SUGAR }
];

// サンプルプレイヤー
const player1: PlayerState = {
  id: "p1",
  name: "プレイヤー1",
  hand: [productionCards[1], violetCards[0]], // 砂糖農園とギルドホール
  buildings: [sampleBuildings[0]], // インディゴ農園
  goods: [sampleGoods[0]], // インディゴ
  victoryPoints: 1,
  quarryCount: 0,
  tradeBonuses: {},
  money: 3,
  isGovernor: true,
  currentRole: RoleType.BUILDER
};

const player2: PlayerState = {
  id: "p2",
  name: "プレイヤー2",
  hand: [buildingCards[1], productionCards[2]], // 小さな市場とタバコ貯蔵庫
  buildings: [sampleBuildings[1]], // 採石場
  goods: [sampleGoods[1]], // 砂糖
  victoryPoints: 1,
  quarryCount: 1,
  tradeBonuses: {},
  money: 2,
  isGovernor: false,
  currentRole: null
};

// サンプルゲーム状態
export const sampleGame: GameState = {
  players: [player1, player2],
  drawPile: [...allCards.slice(5, 15)], // サンプル山札
  discardPile: [],
  availableBuildings: [...allCards.slice(15, 20)], // 場に出ている建物
  marketPrices: {
    [GoodType.INDIGO]: 1,
    [GoodType.SUGAR]: 2,
    [GoodType.TOBACCO]: 3, 
    [GoodType.COFFEE]: 4,
    [GoodType.SILVER]: 5
  },
  currentGovernor: 0, // player1が総督
  currentPlayerIndex: 0,
  currentPhase: "役割選択フェーズ",
  availableRoles: [
    RoleType.PRODUCER,
    RoleType.TRADER,
    RoleType.COUNCILLOR,
    RoleType.PROSPECTOR,
    RoleType.CAPTAIN,
    RoleType.MAYOR
  ],
  selectedRole: RoleType.BUILDER,
  round: 1,
  isGameOver: false
}; 