import { Card } from "../types";

/**
 * 山札をシャッフルする関数（フィッシャー・イェーツ法）
 * @param cards シャッフルするカードの配列
 * @returns シャッフルされたカードの配列
 */
export const shuffleDeck = (cards: Card[]): Card[] => {
  // 配列のコピーを作成して、元の配列を変更しないようにする
  const shuffledCards = [...cards];
  
  // フィッシャー・イェーツのシャッフルアルゴリズムを実装
  for (let i = shuffledCards.length - 1; i > 0; i--) {
    // 0からiまでのランダムなインデックスを生成
    const j = Math.floor(Math.random() * (i + 1));
    // shuffledCards[i]とshuffledCards[j]を交換
    [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
  }
  
  return shuffledCards;
};

/**
 * 初期手札を配る関数
 * @param deck シャッフルされた山札
 * @param playerCount プレイヤー数
 * @param initialHandSize 初期手札の枚数（デフォルト: 4）
 * @returns 各プレイヤーの初期手札と残りの山札の配列
 */
export const dealInitialHands = (
  deck: Card[], 
  playerCount: number, 
  initialHandSize: number = 4
): { hands: Card[][], remainingDeck: Card[] } => {
  // 各プレイヤーの手札を初期化
  const hands: Card[][] = Array(playerCount).fill(null).map(() => []);
  
  // 山札のコピーを作成
  let remainingDeck = [...deck];
  
  // 各プレイヤーに1枚ずつカードを配る
  for (let i = 0; i < initialHandSize; i++) {
    for (let p = 0; p < playerCount; p++) {
      if (remainingDeck.length > 0) {
        // 山札の先頭からカードを1枚引く
        const card = remainingDeck[0];
        // プレイヤーの手札に追加
        hands[p].push(card);
        // 山札から取り除く
        remainingDeck = remainingDeck.slice(1);
      }
    }
  }
  
  return { hands, remainingDeck };
};

/**
 * 山札からカードを引く関数
 * @param deck 現在の山札
 * @param count 引く枚数
 * @param discardPile 現在の捨て札
 * @returns 引いたカードと残りの山札
 */
export const drawCards = (
  deck: Card[], 
  count: number, 
  discardPile: Card[]
): { drawnCards: Card[], newDeck: Card[], newDiscardPile: Card[] } => {
  // 結果を格納する変数
  let drawnCards: Card[] = [];
  let newDeck = [...deck];
  let newDiscardPile = [...discardPile];
  
  // 必要な枚数だけカードを引く
  for (let i = 0; i < count; i++) {
    // 山札が空の場合
    if (newDeck.length === 0) {
      // 捨て札が空でなければ
      if (newDiscardPile.length > 0) {
        // 捨て札をシャッフルして新しい山札にする
        newDeck = shuffleDeck(newDiscardPile);
        // 捨て札を空にする
        newDiscardPile = [];
        console.log("山札が空になったため、捨て札をシャッフルして新しい山札としました");
      } else {
        // 捨て札も空の場合はこれ以上引けない
        console.warn("山札と捨て札が両方空になりました。これ以上カードを引けません。");
        break;
      }
    }
    
    // 山札から1枚引く
    const card = newDeck[0];
    drawnCards.push(card);
    newDeck = newDeck.slice(1);
  }
  
  return { drawnCards, newDeck, newDiscardPile };
};

/**
 * カードを捨て札に置く関数
 * @param discardPile 現在の捨て札
 * @param cards 捨てるカードの配列
 * @returns 更新された捨て札
 */
export const discardCards = (discardPile: Card[], cards: Card[]): Card[] => {
  // 現在の捨て札に新しいカードを追加
  return [...discardPile, ...cards];
};

/**
 * ゲーム開始時の山札を作成する関数
 * @param allCards 全てのカード
 * @returns シャッフルされた山札
 */
export const createInitialDeck = (allCards: Card[]): Card[] => {
  // 全てのカードをシャッフル
  return shuffleDeck(allCards);
};

/**
 * プレイヤーが手札からカードを捨てる関数
 * @param hand プレイヤーの手札
 * @param cardIndices 捨てるカードのインデックス配列
 * @param discardPile 現在の捨て札
 * @returns 更新された手札と捨て札
 */
export const discardFromHand = (
  hand: Card[], 
  cardIndices: number[], 
  discardPile: Card[]
): { newHand: Card[], newDiscardPile: Card[] } => {
  // 捨てるカードを集める
  const cardsToDiscard: Card[] = [];
  const newHand = [...hand];
  
  // インデックスは大きい順にソートして、削除時にインデックスがずれないようにする
  const sortedIndices = [...cardIndices].sort((a, b) => b - a);
  
  // 手札から該当するカードを取り出す
  for (const index of sortedIndices) {
    if (index >= 0 && index < newHand.length) {
      const [removedCard] = newHand.splice(index, 1);
      cardsToDiscard.push(removedCard);
    }
  }
  
  // 捨て札に追加
  const newDiscardPile = discardCards(discardPile, cardsToDiscard);
  
  return { newHand, newDiscardPile };
}; 