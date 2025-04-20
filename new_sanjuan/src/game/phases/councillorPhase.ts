import { Card, GameState, PlayerState, RoleType } from "../../types";
import { drawCards, discardCards } from "../cardActions";

/**
 * カードの選択方法の種類（将来的なAI実装のための準備）
 */
export enum CardSelectionStrategy {
  RANDOM = "random",      // ランダム選択
  HIGHEST_COST = "cost",  // 最も建設コストが高いカードを選択
  HIGHEST_VP = "vp",      // 最も勝利点が高いカードを選択
  CUSTOM = "custom"       // カスタム選択ロジック
}

/**
 * 手札からランダムに1枚のカードを選択する関数
 * @param cards 選択対象のカード配列
 * @returns 選択されたカードのインデックス
 */
export const selectCardRandomly = (cards: Card[]): number => {
  if (cards.length === 0) return -1;
  return Math.floor(Math.random() * cards.length);
};

/**
 * 手札から最もコストが高いカードを選択する関数
 * @param cards 選択対象のカード配列
 * @returns 選択されたカードのインデックス
 */
export const selectHighestCostCard = (cards: Card[]): number => {
  if (cards.length === 0) return -1;
  
  let highestCostIndex = 0;
  let highestCost = cards[0].cost;
  
  for (let i = 1; i < cards.length; i++) {
    if (cards[i].cost > highestCost) {
      highestCost = cards[i].cost;
      highestCostIndex = i;
    }
  }
  
  return highestCostIndex;
};

/**
 * 指定された戦略に基づいてカードを選択する関数
 * @param cards 選択対象のカード配列
 * @param strategy 選択戦略
 * @returns 選択されたカードのインデックス
 */
export const selectCard = (
  cards: Card[], 
  strategy: CardSelectionStrategy = CardSelectionStrategy.RANDOM
): number => {
  switch (strategy) {
    case CardSelectionStrategy.HIGHEST_COST:
      return selectHighestCostCard(cards);
    case CardSelectionStrategy.RANDOM:
    default:
      return selectCardRandomly(cards);
  }
};

/**
 * プレイヤーの手札からカードを選び、残りを捨てる関数
 * @param player プレイヤー状態
 * @param drawnCards 新たに引いたカード
 * @param discardPile 捨て札
 * @param keepCount 残すカード枚数（デフォルト: 1）
 * @param strategy カード選択戦略
 * @returns 更新されたプレイヤー状態と捨て札
 */
export const selectAndDiscardCards = (
  player: PlayerState,
  drawnCards: Card[],
  discardPile: Card[],
  keepCount: number = 1,
  strategy: CardSelectionStrategy = CardSelectionStrategy.RANDOM
): { updatedPlayer: PlayerState, updatedDiscardPile: Card[] } => {
  // 引いたカードと現在の手札を合わせる
  const combinedHand = [...player.hand, ...drawnCards];
  
  // 残すカードのインデックスを選択する
  const indicesSet = new Set<number>();
  
  // keepCount枚のカードを選ぶ
  for (let i = 0; i < keepCount && i < combinedHand.length; i++) {
    // まだ選ばれていないカードから1枚選択
    let availableCards = combinedHand.filter((_, idx) => !indicesSet.has(idx));
    if (availableCards.length === 0) break;
    
    const selectedIndex = selectCard(availableCards, strategy);
    if (selectedIndex === -1) break;
    
    // 選択されたカードの元の配列でのインデックスを取得
    const originalIndex = combinedHand.findIndex(
      (card) => card === availableCards[selectedIndex]
    );
    indicesSet.add(originalIndex);
  }
  
  // 残すカードのインデックス配列
  const keepIndices = Array.from(indicesSet);
  
  // 捨てるカードのインデックス配列（残すカード以外の全て）
  const discardIndices = combinedHand
    .map((_, idx) => idx)
    .filter(idx => !keepIndices.includes(idx));
  
  // 新しい手札（選択したカードのみ）
  const newHand = keepIndices.map(idx => combinedHand[idx]);
  
  // 捨てるカード
  const cardsToDiscard = discardIndices.map(idx => combinedHand[idx]);
  
  // 捨て札に追加
  const updatedDiscardPile = discardCards(discardPile, cardsToDiscard);
  
  // 更新されたプレイヤー状態
  const updatedPlayer: PlayerState = {
    ...player,
    hand: newHand
  };
  
  return { updatedPlayer, updatedDiscardPile };
};

/**
 * 参事フェーズの処理を行う関数
 * @param gameState 現在のゲーム状態
 * @param councillorPlayerIndex 参事を選んだプレイヤーのインデックス
 * @param cardSelectionStrategy カード選択戦略
 * @returns 更新されたゲーム状態
 */
export const handleCouncillorPhase = (
  gameState: GameState,
  councillorPlayerIndex: number,
  cardSelectionStrategy: CardSelectionStrategy = CardSelectionStrategy.RANDOM
): GameState => {
  console.log("参事フェーズを開始します");
  
  // ゲーム状態のコピーを作成
  let newGameState: GameState = { ...gameState };
  let { drawPile, discardPile, players } = newGameState;
  
  // 1. 総督プレイヤーの処理: 山札から5枚引く
  console.log(`${players[councillorPlayerIndex].name}が参事役を選びました。5枚のカードを引きます。`);
  
  const governorResult = drawCards(drawPile, 5, discardPile);
  drawPile = governorResult.newDeck;
  discardPile = governorResult.newDiscardPile;
  const governorDrawnCards = governorResult.drawnCards;
  
  console.log(`引いたカード: ${governorDrawnCards.map(card => card.name).join(', ')}`);
  
  // 2. 総督プレイヤーは引いた5枚と手札から1枚を選び、残りを捨てる
  const governorResult2 = selectAndDiscardCards(
    players[councillorPlayerIndex],
    governorDrawnCards,
    discardPile,
    1,
    cardSelectionStrategy
  );
  
  players[councillorPlayerIndex] = governorResult2.updatedPlayer;
  discardPile = governorResult2.updatedDiscardPile;
  
  console.log(`${players[councillorPlayerIndex].name}は1枚を選んで、残りを捨てました。手札は${players[councillorPlayerIndex].hand.length}枚になりました。`);
  
  // 3. 他のプレイヤーの処理: 山札から2枚引く
  for (let i = 0; i < players.length; i++) {
    // 総督プレイヤー以外を処理
    if (i !== councillorPlayerIndex) {
      console.log(`${players[i].name}は2枚のカードを引きます。`);
      
      const otherResult = drawCards(drawPile, 2, discardPile);
      drawPile = otherResult.newDeck;
      discardPile = otherResult.newDiscardPile;
      const otherDrawnCards = otherResult.drawnCards;
      
      console.log(`引いたカード: ${otherDrawnCards.map(card => card.name).join(', ')}`);
      
      // 4. 他のプレイヤーは引いた2枚と手札から1枚を選び、残りを捨てる
      const otherResult2 = selectAndDiscardCards(
        players[i],
        otherDrawnCards,
        discardPile,
        1,
        cardSelectionStrategy
      );
      
      players[i] = otherResult2.updatedPlayer;
      discardPile = otherResult2.updatedDiscardPile;
      
      console.log(`${players[i].name}は1枚を選んで、残りを捨てました。手札は${players[i].hand.length}枚になりました。`);
    }
  }
  
  // 更新されたゲーム状態を返す
  return {
    ...newGameState,
    drawPile,
    discardPile,
    players,
    selectedRole: RoleType.COUNCILLOR,  // 選択された役割を参事に設定
    currentPhase: "参事フェーズ完了"     // フェーズを更新
  };
}; 