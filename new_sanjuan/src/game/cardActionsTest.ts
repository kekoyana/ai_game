import { Card, CardType, GoodType } from "../types";
import { shuffleDeck, dealInitialHands, drawCards, discardCards, discardFromHand } from "./cardActions";

/**
 * カード操作関数のテスト用関数
 * このファイルは実際のアプリケーションでは使用せず、
 * コンソールでの動作確認用です。
 */
export const testCardActions = (): void => {
  console.log("カード操作関数のテスト開始");
  
  // テスト用のカードデッキを作成
  const testDeck: Card[] = Array(20).fill(null).map((_, i) => ({
    id: `card-${i}`,
    name: `テストカード ${i}`,
    type: i % 3 === 0 ? CardType.BUILDING : 
          i % 3 === 1 ? CardType.PRODUCTION : CardType.VIOLET,
    victoryPoints: Math.floor(i / 5) + 1,
    cost: (i % 5) + 1,
    description: `テストカード ${i} の説明`
  }));
  
  console.log("テスト用デッキ作成:", testDeck.length, "枚");
  
  // 1. シャッフルのテスト
  const shuffledDeck = shuffleDeck(testDeck);
  console.log("シャッフル後のデッキ（最初の5枚）:", shuffledDeck.slice(0, 5).map(card => card.id));
  
  // 2. 初期手札を配るテスト
  const playerCount = 3;
  const { hands, remainingDeck } = dealInitialHands(shuffledDeck, playerCount);
  
  console.log("各プレイヤーの初期手札:");
  hands.forEach((hand, i) => {
    console.log(`プレイヤー${i + 1}:`, hand.map(card => card.id));
  });
  console.log("残りの山札:", remainingDeck.length, "枚");
  
  // 3. カードを引くテスト
  const discardPile: Card[] = [];
  const { drawnCards, newDeck, newDiscardPile } = drawCards(remainingDeck, 3, discardPile);
  
  console.log("引いたカード:", drawnCards.map(card => card.id));
  console.log("引いた後の山札:", newDeck.length, "枚");
  
  // 4. カードを捨てるテスト
  const updatedDiscardPile = discardCards(newDiscardPile, drawnCards);
  console.log("捨て札:", updatedDiscardPile.length, "枚");
  
  // 5. 手札からカードを捨てるテスト
  const playerHand = hands[0];
  const { newHand, newDiscardPile: finalDiscardPile } = discardFromHand(
    playerHand, 
    [0, 2], 
    updatedDiscardPile
  );
  
  console.log("カードを捨てた後の手札:", newHand.map(card => card.id));
  console.log("最終的な捨て札:", finalDiscardPile.length, "枚");
  
  // 6. 山札が空になった場合のテスト
  const smallDeck: Card[] = newDeck.slice(0, 2);
  const largeDiscardPile = finalDiscardPile;
  
  console.log("小さな山札:", smallDeck.length, "枚");
  console.log("大きな捨て札:", largeDiscardPile.length, "枚");
  
  const { drawnCards: moreDrawnCards, newDeck: finalDeck } = 
    drawCards(smallDeck, 5, largeDiscardPile);
  
  console.log("山札が空になった後に引いたカード:", moreDrawnCards.length, "枚");
  console.log("最終的な山札:", finalDeck.length, "枚");
  
  console.log("カード操作関数のテスト完了");
};

// テストの実行（コメントアウトすることで実行を防ぐ）
// testCardActions(); 