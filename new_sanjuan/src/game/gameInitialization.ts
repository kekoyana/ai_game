import { GameState, PlayerState, RoleType } from "../types";
import { allCards } from "../data/cards";
import { createInitialDeck, dealInitialHands } from "./cardActions";

/**
 * ゲームを初期化する関数
 * @param playerNames プレイヤー名の配列
 * @returns 初期化されたゲーム状態
 */
export const initializeGame = (playerNames: string[]): GameState => {
  const playerCount = playerNames.length;
  
  // 全カードから初期山札を作成（シャッフル済み）
  const initialDeck = createInitialDeck(allCards);
  
  // 初期手札を配る
  const { hands, remainingDeck } = dealInitialHands(initialDeck, playerCount);
  
  // 各プレイヤーの初期状態を作成
  const players: PlayerState[] = playerNames.map((name, index) => {
    return {
      id: `player-${index}`,
      name,
      hand: hands[index],
      buildings: [],
      goods: [],
      victoryPoints: 0,
      quarryCount: 0,
      tradeBonuses: {},
      money: 2, // 初期資金
      isGovernor: index === 0, // 最初のプレイヤーが総督
      currentRole: null
    };
  });
  
  // 場に出す建物カード
  const buildingsToDisplay = 4 + playerCount; // プレイヤー数 + 4枚
  const availableBuildings = remainingDeck.slice(0, buildingsToDisplay);
  const updatedDeck = remainingDeck.slice(buildingsToDisplay);
  
  // 初期ゲーム状態を作成
  const initialGameState: GameState = {
    players,
    drawPile: updatedDeck,
    discardPile: [],
    availableBuildings,
    marketPrices: {
      indigo: 1,
      sugar: 2,
      tobacco: 3,
      coffee: 4,
      silver: 5
    },
    currentGovernor: 0,
    currentPlayerIndex: 0,
    currentPhase: "役割選択フェーズ",
    availableRoles: [
      RoleType.BUILDER,
      RoleType.PRODUCER,
      RoleType.TRADER,
      RoleType.COUNCILLOR,
      RoleType.PROSPECTOR,
      RoleType.CAPTAIN,
      RoleType.MAYOR
    ],
    selectedRole: null,
    round: 1,
    isGameOver: false
  };
  
  return initialGameState;
}; 