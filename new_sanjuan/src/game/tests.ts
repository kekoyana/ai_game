import { testCardActions } from "./cardActionsTest";
import { testCouncillorPhase } from "./phases/councillorPhaseTest";
import { testBuilderPhase } from "./phases/builderPhaseTest";

/**
 * 全テストを実行する関数
 */
export const runAllTests = (): void => {
  console.log("===== サンファンゲーム テスト開始 =====");
  
  // カード操作関数のテスト
  console.log("\n----- カード操作関数のテスト -----");
  testCardActions();
  
  // 参事フェーズのテスト
  console.log("\n----- 参事フェーズのテスト -----");
  testCouncillorPhase();
  
  // 建築家フェーズのテスト
  console.log("\n----- 建築家フェーズのテスト -----");
  testBuilderPhase();
  
  console.log("\n===== サンファンゲーム テスト終了 =====");
};

/**
 * カード操作関数のみテスト
 */
export const runCardActionsTest = (): void => {
  console.log("カード操作関数のテスト開始");
  testCardActions();
  console.log("カード操作関数のテスト終了");
};

/**
 * 参事フェーズのみテスト
 */
export const runCouncillorPhaseTest = (): void => {
  console.log("参事フェーズのテスト開始");
  testCouncillorPhase();
  console.log("参事フェーズのテスト終了");
};

/**
 * 建築家フェーズのみテスト
 */
export const runBuilderPhaseTest = (): void => {
  console.log("建築家フェーズのテスト開始");
  testBuilderPhase();
  console.log("建築家フェーズのテスト終了");
};

// テストの実行（必要なテストのコメントを外して実行）
// runAllTests();
// runCardActionsTest();
// runCouncillorPhaseTest();
// runBuilderPhaseTest(); 