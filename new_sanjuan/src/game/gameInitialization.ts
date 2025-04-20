import { GameState, PlayerState, RoleType, RoleCard } from "../types";
import { allCards } from "../data/cards";
import { createInitialDeck, dealInitialHands } from "./cardActions";
import { initializeRoleCards } from "./roleSelection";

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
      coins: 0, // 初期コイン（役割ボーナス用）
      isGovernor: index === 0, // 最初のプレイヤーが総督
      currentRole: null,
      hasPassed: false // 初期状態ではパスしていない
    };
  });
  
  // 場に出す建物カード
  const buildingsToDisplay = 4 + playerCount; // プレイヤー数 + 4枚
  const availableBuildings = remainingDeck.slice(0, buildingsToDisplay);
  const updatedDeck = remainingDeck.slice(buildingsToDisplay);
  
  // 役割カードの初期化
  const roleCards = initializeRoleCards();
  
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
    currentTurnPlayerIndex: 0, // 最初は最初のプレイヤーの手番
    currentPhase: "ラウンド開始",
    availableRoles: [
      RoleType.BUILDER,
      RoleType.PRODUCER,
      RoleType.TRADER,
      RoleType.COUNCILLOR,
      RoleType.PROSPECTOR,
      RoleType.CAPTAIN,
      RoleType.MAYOR
    ],
    roleCards, // 役割カードとその状態
    selectedRole: null,
    currentRolePlayerIndex: -1, // 初期状態では役割を選んだプレイヤーはいない
    round: 1,
    isGameOver: false
  };
  
  return initialGameState;
}; 