import { GameState } from "../../types";
import { initializeGame } from "../gameInitialization";
import { BuildingSelection, handleBuilderPhase } from "./builderPhase";

/**
 * 建築家フェーズのテスト関数
 * 初期化されたゲーム状態を作成し、建築家フェーズを実行してその結果を確認します。
 */
export const testBuilderPhase = (): void => {
  console.log("建築家フェーズのテスト開始");
  
  // テスト用のプレイヤー名
  const playerNames = ["プレイヤー1", "プレイヤー2", "プレイヤー3"];
  
  // 初期ゲーム状態を作成
  const initialGameState = initializeGame(playerNames);
  
  // 各プレイヤーの初期状態を確認
  console.log("\n初期状態:");
  console.log("場に出ている建物:");
  initialGameState.availableBuildings.forEach((card, idx) => {
    console.log(`${idx}: ${card.name} (コスト: ${card.cost}, タイプ: ${card.type})`);
  });
  
  initialGameState.players.forEach(player => {
    console.log(`\n${player.name} (採石場: ${player.quarryCount}基)`);
    console.log("手札:");
    player.hand.forEach((card, idx) => {
      console.log(`${idx}: ${card.name} (コスト: ${card.cost}, タイプ: ${card.type})`);
    });
    console.log("建設済み建物:");
    player.buildings.forEach(building => {
      console.log(`- ${building.card.name}`);
    });
  });
  
  // プレイヤー1（インデックス0）が建築家を選んだと仮定
  const builderPlayerIndex = 0;
  
  // テスト用の建設選択を作成
  // （実際のゲームでは、UIやAIから選択情報が提供される）
  const buildingSelections: (BuildingSelection | null)[] = createTestBuildingSelections(initialGameState);
  
  // 建築家フェーズを実行
  const { newGameState, buildingResults } = handleBuilderPhase(
    initialGameState,
    builderPlayerIndex,
    buildingSelections
  );
  
  // 結果を表示
  console.log("\n建築家フェーズの結果:");
  buildingResults.forEach((result, idx) => {
    console.log(`${idx+1}. ${result}`);
  });
  
  // 更新後の状態を確認
  console.log("\n更新後の状態:");
  console.log("場に出ている建物:");
  newGameState.availableBuildings.forEach((card, idx) => {
    console.log(`${idx}: ${card.name} (コスト: ${card.cost}, タイプ: ${card.type})`);
  });
  
  newGameState.players.forEach(player => {
    console.log(`\n${player.name} (採石場: ${player.quarryCount}基)`);
    console.log("手札:");
    player.hand.forEach((card, idx) => {
      console.log(`${idx}: ${card.name} (コスト: ${card.cost}, タイプ: ${card.type})`);
    });
    console.log("建設済み建物:");
    player.buildings.forEach(building => {
      console.log(`- ${building.card.name}`);
    });
  });
  
  console.log(`\n山札の残り: ${newGameState.drawPile.length}枚`);
  console.log(`捨て札: ${newGameState.discardPile.length}枚`);
  
  console.log("\n建築家フェーズのテスト終了");
};

/**
 * テスト用の建設選択を作成する関数
 * @param gameState ゲーム状態
 * @returns 各プレイヤーの建設選択情報
 */
const createTestBuildingSelections = (gameState: GameState): (BuildingSelection | null)[] => {
  const selections: (BuildingSelection | null)[] = [];
  
  // 各プレイヤーの建設選択を決定
  for (let i = 0; i < gameState.players.length; i++) {
    const player = gameState.players[i];
    const isBuilderRole = i === 0; // プレイヤー1が建築家役
    
    // 建設可能なカードを探す
    let selection: BuildingSelection | null = null;
    
    // 手札に建物カードがあるか確認
    const buildingCard = player.hand.find(card => 
      card.type === "building" || card.type === "production" || card.type === "violet"
    );
    
    if (buildingCard) {
      // 支払いに使うカードのインデックスを選択（最も低コストのカードを除いて支払いに使用）
      const sortedHandIndices = player.hand
        .map((card, idx) => ({ card, idx }))
        .sort((a, b) => b.card.cost - a.card.cost) // コスト降順でソート
        .slice(1) // 最もコストが高いカード（建設するカード）を除外
        .map(item => item.idx);
      
      // 建物の実質コスト分だけのインデックスを選択
      const buildingCardIndex = player.hand.findIndex(card => card.id === buildingCard.id);
      const paymentNeeded = isBuilderRole ? buildingCard.cost : Math.max(0, buildingCard.cost - 1);
      const paymentIndices = sortedHandIndices.slice(0, paymentNeeded);
      
      selection = {
        cardId: buildingCard.id,
        paymentCardIndices: paymentIndices,
        fromProvinceRow: false // 手札から建設
      };
    } else if (isBuilderRole && gameState.availableBuildings.length > 0) {
      // 建築家役の場合、場から建物を建設する選択肢もある
      const provinceCard = gameState.availableBuildings[0];
      
      // 支払いに使うカードのインデックスを選択
      const paymentIndices = Array.from(
        { length: Math.min(provinceCard.cost, player.hand.length) },
        (_, idx) => idx
      );
      
      selection = {
        cardId: provinceCard.id,
        paymentCardIndices: paymentIndices,
        fromProvinceRow: true // 場から建設
      };
    }
    
    selections.push(selection);
  }
  
  return selections;
};

// テストの実行（コメントアウトすることで実行を防ぐ）
// testBuilderPhase(); 