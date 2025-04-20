import { GameState } from "../../types";
import { initializeGame } from "../gameInitialization";
import { handleCouncillorPhase, CardSelectionStrategy } from "./councillorPhase";

/**
 * 参事フェーズのテスト関数
 * 初期化されたゲーム状態を作成し、参事フェーズを実行してその結果を確認します。
 */
export const testCouncillorPhase = (): void => {
  console.log("参事フェーズのテスト開始");
  
  // テスト用のプレイヤー名
  const playerNames = ["プレイヤー1", "プレイヤー2", "プレイヤー3"];
  
  // 初期ゲーム状態を作成
  const initialGameState = initializeGame(playerNames);
  
  // 各プレイヤーの初期手札サイズを記録
  console.log("初期手札:");
  initialGameState.players.forEach(player => {
    console.log(`${player.name}: ${player.hand.length}枚 - ${player.hand.map(card => card.name).join(', ')}`);
  });
  
  // プレイヤー1（インデックス0）が参事を選んだと仮定
  const councillorPlayerIndex = 0;
  
  // 参事フェーズを実行
  const updatedGameState = handleCouncillorPhase(
    initialGameState,
    councillorPlayerIndex,
    CardSelectionStrategy.HIGHEST_COST // 最もコストが高いカードを選ぶ戦略
  );
  
  // 結果の確認
  console.log("\n参事フェーズ後:");
  updatedGameState.players.forEach(player => {
    console.log(`${player.name}: ${player.hand.length}枚 - ${player.hand.map(card => card.name).join(', ')}`);
  });
  
  console.log(`山札の残り: ${updatedGameState.drawPile.length}枚`);
  console.log(`捨て札: ${updatedGameState.discardPile.length}枚`);
  
  // 参事フェーズの結果検証
  const isValid = validateCouncillorPhaseResult(initialGameState, updatedGameState, councillorPlayerIndex);
  console.log(`テスト結果: ${isValid ? '成功' : '失敗'}`);
  
  console.log("参事フェーズのテスト終了");
};

/**
 * 参事フェーズの結果を検証する関数
 * @param initialState 初期ゲーム状態
 * @param updatedState 更新後のゲーム状態
 * @param councillorPlayerIndex 参事を選んだプレイヤーのインデックス
 * @returns 検証結果（true: 正常, false: 異常）
 */
const validateCouncillorPhaseResult = (
  initialState: GameState,
  updatedState: GameState,
  councillorPlayerIndex: number
): boolean => {
  let isValid = true;
  
  // 1. 総督プレイヤーは1枚のカードを手札に持っているか
  const councillorPlayer = updatedState.players[councillorPlayerIndex];
  if (councillorPlayer.hand.length !== 1) {
    console.error(`総督プレイヤーの手札が1枚ではありません: ${councillorPlayer.hand.length}枚`);
    isValid = false;
  }
  
  // 2. 他のプレイヤーも1枚のカードを手札に持っているか
  for (let i = 0; i < updatedState.players.length; i++) {
    if (i !== councillorPlayerIndex) {
      const otherPlayer = updatedState.players[i];
      if (otherPlayer.hand.length !== 1) {
        console.error(`プレイヤー${i+1}の手札が1枚ではありません: ${otherPlayer.hand.length}枚`);
        isValid = false;
      }
    }
  }
  
  // 3. 捨て札が適切に増えているか
  // 総督プレイヤー: 初期手札 + 5枚引いた - 1枚残した = 初期手札 + 4枚捨てた
  // 他のプレイヤー: 初期手札 + 2枚引いた - 1枚残した = 初期手札 + 1枚捨てた
  // 合計で捨てた枚数 = 総督の4枚 + (他プレイヤー数 * 1枚)
  const expectedDiscardCount = 4 + (initialState.players.length - 1);
  if (updatedState.discardPile.length !== expectedDiscardCount) {
    console.error(`捨て札の枚数が想定と異なります。期待: ${expectedDiscardCount}枚, 実際: ${updatedState.discardPile.length}枚`);
    isValid = false;
  }
  
  // 4. 山札が適切に減っているか
  // 引いたカードの合計: 総督の5枚 + (他プレイヤー数 * 2枚)
  const expectedDrawCount = 5 + ((initialState.players.length - 1) * 2);
  const expectedRemainingDeck = initialState.drawPile.length - expectedDrawCount;
  if (updatedState.drawPile.length !== expectedRemainingDeck) {
    console.error(`山札の残りが想定と異なります。期待: ${expectedRemainingDeck}枚, 実際: ${updatedState.drawPile.length}枚`);
    isValid = false;
  }
  
  return isValid;
};

// テストの実行（コメントアウトすることで実行を防ぐ）
// testCouncillorPhase(); 