import { Building, BuildingCard, Card, CardType, GameState, PlayerState, RoleType, VioletCard } from "../../types";
import { discardFromHand, drawCards } from "../cardActions";

/**
 * 建物の建設選択情報
 */
export interface BuildingSelection {
  // 建設する建物のカードID
  cardId: string;
  // 支払いに使用するカードのインデックス配列（手札内）
  paymentCardIndices: number[];
  // 場から建設する場合はtrue、手札から建設する場合はfalse
  fromProvinceRow: boolean;
}

/**
 * 実質的な建設コストを計算する関数（採石場割引考慮）
 * @param card 建設する建物カード
 * @param quarryCount プレイヤーが持つ採石場の数
 * @param isBuilderRole 建築家役を選んだプレイヤーかどうか
 * @returns 実質的な建設コスト（0未満にはならない）
 */
export const calculateEffectiveCost = (
  card: Card,
  quarryCount: number,
  isBuilderRole: boolean
): number => {
  let effectiveCost = card.cost;
  
  // 役割による割引（総督以外のプレイヤーは1コイン割引）
  if (!isBuilderRole) {
    effectiveCost -= 1;
  }
  
  // 採石場による割引（紫色の建物のみ適用）
  if (card.type === CardType.VIOLET && quarryCount > 0) {
    effectiveCost -= quarryCount;
  }
  
  // コストは0未満にはならない
  return Math.max(0, effectiveCost);
};

/**
 * プレイヤーが建物を建設できるかチェックする関数
 * @param player プレイヤー状態
 * @param buildingSelection 建設選択情報
 * @param availableBuildings 場に出ている建物カード
 * @param isBuilderRole 建築家役を選んだプレイヤーかどうか
 * @returns チェック結果と理由
 */
export const canBuildBuilding = (
  player: PlayerState,
  buildingSelection: BuildingSelection | null,
  availableBuildings: Card[],
  isBuilderRole: boolean
): { canBuild: boolean; reason: string } => {
  // 建設選択がない場合は建設しない
  if (!buildingSelection) {
    return { canBuild: false, reason: "建設選択がありません" };
  }
  
  // 手札から支払うカードの枚数が十分かチェック
  if (player.hand.length < buildingSelection.paymentCardIndices.length) {
    return { canBuild: false, reason: "手札が足りません" };
  }
  
  // 建設する建物を特定
  let buildingCard: Card | undefined;
  
  if (buildingSelection.fromProvinceRow) {
    // 場から建設する場合（建築家役のみ可能）
    if (!isBuilderRole) {
      return { canBuild: false, reason: "建築家役でないプレイヤーは場から建設できません" };
    }
    buildingCard = availableBuildings.find(card => card.id === buildingSelection.cardId);
  } else {
    // 手札から建設する場合
    buildingCard = player.hand.find(card => card.id === buildingSelection.cardId);
  }
  
  if (!buildingCard) {
    return { canBuild: false, reason: "指定された建物カードが見つかりません" };
  }
  
  // 既に同じ名前の建物を建設済みかチェック
  const alreadyBuilt = player.buildings.some(
    building => building.card.name === buildingCard?.name
  );
  if (alreadyBuilt) {
    return { canBuild: false, reason: "既に同じ名前の建物を建設済みです" };
  }
  
  // 実質コストを計算
  const effectiveCost = calculateEffectiveCost(
    buildingCard,
    player.quarryCount,
    isBuilderRole
  );
  
  // 支払いに指定したカードの枚数が足りるかチェック
  if (buildingSelection.paymentCardIndices.length < effectiveCost) {
    return { 
      canBuild: false, 
      reason: `支払いが足りません（必要: ${effectiveCost}枚, 指定: ${buildingSelection.paymentCardIndices.length}枚）` 
    };
  }
  
  return { canBuild: true, reason: "建設可能です" };
};

/**
 * プレイヤーの建物を建設する関数
 * @param gameState 現在のゲーム状態
 * @param playerIndex プレイヤーのインデックス
 * @param buildingSelection 建設選択情報
 * @param isBuilderRole 建築家役を選んだプレイヤーかどうか
 * @returns 更新されたゲーム状態と建設結果
 */
export const buildBuilding = (
  gameState: GameState,
  playerIndex: number,
  buildingSelection: BuildingSelection | null,
  isBuilderRole: boolean
): { newGameState: GameState; success: boolean; message: string } => {
  // ゲーム状態のコピーを作成
  let newGameState: GameState = { ...gameState };
  let { players, availableBuildings, drawPile, discardPile } = newGameState;
  const player = players[playerIndex];
  
  // 建設可能かチェック
  if (!buildingSelection) {
    return { 
      newGameState, 
      success: false, 
      message: `${player.name}は建設しませんでした` 
    };
  }
  
  const buildCheck = canBuildBuilding(
    player,
    buildingSelection,
    availableBuildings,
    isBuilderRole
  );
  
  if (!buildCheck.canBuild) {
    return { 
      newGameState, 
      success: false, 
      message: `${player.name}の建設が失敗しました: ${buildCheck.reason}` 
    };
  }
  
  // 建設する建物を特定
  let buildingCard: Card | undefined;
  let buildingCardIndex: number = -1;
  
  if (buildingSelection.fromProvinceRow) {
    // 場から建設する場合
    buildingCardIndex = availableBuildings.findIndex(
      card => card.id === buildingSelection.cardId
    );
    if (buildingCardIndex !== -1) {
      buildingCard = availableBuildings[buildingCardIndex];
    }
  } else {
    // 手札から建設する場合
    buildingCardIndex = player.hand.findIndex(
      card => card.id === buildingSelection.cardId
    );
    if (buildingCardIndex !== -1) {
      buildingCard = player.hand[buildingCardIndex];
    }
  }
  
  if (!buildingCard) {
    return { 
      newGameState, 
      success: false, 
      message: `${player.name}の建設が失敗しました: 指定された建物カードが見つかりません` 
    };
  }
  
  // 実質コストを計算
  const effectiveCost = calculateEffectiveCost(
    buildingCard,
    player.quarryCount,
    isBuilderRole
  );
  
  // 支払い用のカードを取得（選択した枚数分だけ）
  const paymentIndices = buildingSelection.paymentCardIndices.slice(0, effectiveCost);
  
  // 支払いとして手札からカードを捨てる
  const { newHand: handAfterPayment, newDiscardPile: discardAfterPayment } = 
    discardFromHand(player.hand, paymentIndices, discardPile);
  
  // 手札から建設する場合、その建物カードも手札から除外する
  let finalHand = handAfterPayment;
  if (!buildingSelection.fromProvinceRow) {
    // 既に支払いで捨てられている場合は何もしない
    if (!paymentIndices.includes(buildingCardIndex)) {
      // 支払い後の手札でのインデックスを再計算
      const newIndex = finalHand.findIndex(card => card.id === buildingCard?.id);
      if (newIndex !== -1) {
        finalHand = [
          ...finalHand.slice(0, newIndex),
          ...finalHand.slice(newIndex + 1)
        ];
      }
    }
  }
  
  // 新しい建物オブジェクトを作成
  const newBuilding: Building = {
    card: buildingCard as BuildingCard | VioletCard,
    isOccupied: false,
    goods: []
  };
  
  // プレイヤーの建物リストに追加
  const updatedPlayer: PlayerState = {
    ...player,
    hand: finalHand,
    buildings: [...player.buildings, newBuilding]
  };
  
  // 場から建物を取った場合、山札からカードを補充
  let updatedAvailableBuildings = [...availableBuildings];
  let updatedDrawPile = [...drawPile];
  let updatedDiscardPile = discardAfterPayment;
  
  if (buildingSelection.fromProvinceRow) {
    // 場から建物を取り除く
    updatedAvailableBuildings.splice(buildingCardIndex, 1);
    
    // 山札から新しいカードを引いて場に追加
    if (updatedDrawPile.length > 0 || updatedDiscardPile.length > 0) {
      const drawResult = drawCards(updatedDrawPile, 1, updatedDiscardPile);
      updatedDrawPile = drawResult.newDeck;
      updatedDiscardPile = drawResult.newDiscardPile;
      
      if (drawResult.drawnCards.length > 0) {
        updatedAvailableBuildings.push(drawResult.drawnCards[0]);
      }
    }
  }
  
  // プレイヤー配列を更新
  const updatedPlayers = players.map((p, idx) => 
    idx === playerIndex ? updatedPlayer : p
  );
  
  // 更新されたゲーム状態を返す
  return {
    newGameState: {
      ...newGameState,
      players: updatedPlayers,
      availableBuildings: updatedAvailableBuildings,
      drawPile: updatedDrawPile,
      discardPile: updatedDiscardPile
    },
    success: true,
    message: `${player.name}が${buildingCard.name}を建設しました（コスト: ${effectiveCost}）`
  };
};

/**
 * 建築家フェーズの処理を行う関数
 * @param gameState 現在のゲーム状態
 * @param builderPlayerIndex 建築家を選んだプレイヤーのインデックス
 * @param buildingSelections 各プレイヤーの建設選択情報
 * @returns 更新されたゲーム状態と建設結果のメッセージ
 */
export const handleBuilderPhase = (
  gameState: GameState,
  builderPlayerIndex: number,
  buildingSelections: (BuildingSelection | null)[]
): { newGameState: GameState; buildingResults: string[] } => {
  console.log("建築家フェーズを開始します");
  
  // ゲーム状態のコピーを作成
  let currentGameState: GameState = { ...gameState };
  const buildingResults: string[] = [];
  
  // 建築家役のプレイヤーから処理を開始
  const playerOrder = getPlayerOrderStartingFrom(gameState.players.length, builderPlayerIndex);
  
  // 各プレイヤーの建設処理を順番に実行
  for (const idx of playerOrder) {
    // 各プレイヤーの建設選択
    const selection = buildingSelections[idx];
    const isBuilder = idx === builderPlayerIndex;
    
    // 建物を建設
    const result = buildBuilding(
      currentGameState,
      idx,
      selection,
      isBuilder
    );
    
    // 結果を記録
    buildingResults.push(result.message);
    currentGameState = result.newGameState;
  }
  
  // 最終的に更新されたゲーム状態を返す
  return {
    newGameState: {
      ...currentGameState,
      selectedRole: RoleType.BUILDER,  // 選択された役割を建築家に設定
      currentPhase: "建築家フェーズ完了" // フェーズを更新
    },
    buildingResults
  };
};

/**
 * 指定されたプレイヤーから始まるプレイヤーの順序を取得する
 * @param playerCount プレイヤー数
 * @param startPlayerIndex 開始プレイヤーのインデックス
 * @returns プレイヤーのインデックス配列
 */
export const getPlayerOrderStartingFrom = (
  playerCount: number,
  startPlayerIndex: number
): number[] => {
  const order: number[] = [];
  for (let i = 0; i < playerCount; i++) {
    order.push((startPlayerIndex + i) % playerCount);
  }
  return order;
}; 