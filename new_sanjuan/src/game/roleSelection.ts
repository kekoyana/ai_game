import { GameState, PlayerState, RoleType } from "../types";

/**
 * 役割カードの状態情報
 * 役割の種類、利用可能かどうか、ボーナスコイン数などを管理
 */
export interface RoleCard {
  role: RoleType;         // 役割の種類
  isAvailable: boolean;   // 利用可能かどうか
  bonusCoins: number;     // ボーナスコインの数
}

/**
 * 役割選択の情報
 */
export interface RoleSelection {
  playerIndex: number;    // 選択したプレイヤーのインデックス
  role: RoleType | null;  // 選択した役割（nullの場合はパス）
}

/**
 * 全ての役割カードを初期状態で作成する
 * @returns 初期状態の役割カード配列
 */
export const initializeRoleCards = (): RoleCard[] => {
  const roles: RoleType[] = [
    RoleType.BUILDER,
    RoleType.COUNCILLOR,
    RoleType.PRODUCER,
    RoleType.PROSPECTOR,
    RoleType.TRADER
  ];
  
  return roles.map(role => ({
    role,
    isAvailable: true,
    bonusCoins: 0
  }));
};

/**
 * ラウンド開始時の役割カードリセット処理
 * @param roleCards 現在の役割カード配列
 * @returns リセットされた役割カード配列
 */
export const resetRoleCardsForNewRound = (roleCards: RoleCard[]): RoleCard[] => {
  return roleCards.map(card => ({
    ...card,
    isAvailable: true, // 全ての役割カードを利用可能に戻す
    // ボーナスコインはそのまま保持
  }));
};

/**
 * プレイヤーが役割を選択する処理
 * @param gameState 現在のゲーム状態
 * @param selection 役割選択情報
 * @returns 更新されたゲーム状態
 */
export const selectRole = (
  gameState: GameState,
  selection: RoleSelection
): GameState => {
  // ゲーム状態のコピーを作成
  const newGameState: GameState = { ...gameState };
  
  // プレイヤーがパスした場合
  if (selection.role === null) {
    console.log(`プレイヤー${selection.playerIndex + 1}はパスしました`);
    
    // プレイヤーのパス状態を設定
    const updatedPlayers = [...newGameState.players];
    updatedPlayers[selection.playerIndex] = {
      ...updatedPlayers[selection.playerIndex],
      hasPassed: true
    };
    
    return {
      ...newGameState,
      players: updatedPlayers,
      currentPhase: "役割選択中"
    };
  }
  
  // 役割カードの配列を取得
  const roleCards = [...newGameState.roleCards];
  
  // 選択された役割のカードを探す
  const selectedCardIndex = roleCards.findIndex(
    card => card.role === selection.role && card.isAvailable
  );
  
  // 選択された役割が見つからないか、利用不可の場合
  if (selectedCardIndex === -1) {
    console.error(`役割「${selection.role}」は利用できません`);
    return newGameState;
  }
  
  // 選択された役割カード
  const selectedCard = roleCards[selectedCardIndex];
  
  // プレイヤー情報を更新
  const players = [...newGameState.players];
  const updatedPlayer: PlayerState = {
    ...players[selection.playerIndex],
    coins: players[selection.playerIndex].coins + selectedCard.bonusCoins // ボーナスコインを加算
  };
  players[selection.playerIndex] = updatedPlayer;
  
  // 役割カードを更新（利用不可に設定）
  roleCards[selectedCardIndex] = {
    ...selectedCard,
    isAvailable: false,
    bonusCoins: 0 // ボーナスコインをリセット
  };
  
  // 選択された役割とプレイヤーをゲーム状態に記録
  return {
    ...newGameState,
    players,
    roleCards,
    selectedRole: selection.role,
    currentRolePlayerIndex: selection.playerIndex,
    currentPhase: `${selection.role}フェーズ準備中`
  };
};

/**
 * ラウンド終了時の処理
 * 選ばれなかった役割カードにボーナスコインを追加し、次のラウンドの準備をする
 * @param gameState 現在のゲーム状態
 * @returns 更新されたゲーム状態
 */
export const endRound = (gameState: GameState): GameState => {
  // ゲーム状態のコピーを作成
  const newGameState: GameState = { ...gameState };
  
  // 役割カードの配列を取得
  const roleCards = [...newGameState.roleCards];
  
  // 選ばれなかった役割カードにボーナスコインを追加
  const updatedRoleCards = roleCards.map(card => ({
    ...card,
    // 利用可能（選ばれなかった）な役割カードにボーナスコインを追加
    bonusCoins: card.isAvailable ? card.bonusCoins + 1 : card.bonusCoins,
    isAvailable: true // 全ての役割カードを再び利用可能に
  }));
  
  // 総督プレイヤーを次のプレイヤーに移動
  const currentGovernorIndex = newGameState.players.findIndex(p => p.isGovernor);
  const nextGovernorIndex = (currentGovernorIndex + 1) % newGameState.players.length;
  
  // プレイヤー情報を更新
  const updatedPlayers = newGameState.players.map((player, index) => ({
    ...player,
    isGovernor: index === nextGovernorIndex
  }));
  
  // ラウンド番号を更新
  return {
    ...newGameState,
    players: updatedPlayers,
    roleCards: updatedRoleCards,
    round: newGameState.round + 1,
    selectedRole: null,
    currentRolePlayerIndex: -1,
    currentPhase: "ラウンド開始"
  };
};

/**
 * 次のプレイヤーの手番に進める
 * @param gameState 現在のゲーム状態
 * @returns 更新されたゲーム状態と次のプレイヤーのインデックス
 */
export const advanceToNextPlayer = (
  gameState: GameState
): { updatedGameState: GameState; nextPlayerIndex: number } => {
  // 現在の手番プレイヤーのインデックス
  const currentTurnPlayerIndex = gameState.currentTurnPlayerIndex;
  
  // 次のプレイヤーのインデックス
  const nextPlayerIndex = (currentTurnPlayerIndex + 1) % gameState.players.length;
  
  // ゲーム状態を更新
  const updatedGameState: GameState = {
    ...gameState,
    currentTurnPlayerIndex: nextPlayerIndex,
    currentPhase: "役割選択中"
  };
  
  console.log(`次のプレイヤー(${nextPlayerIndex + 1})の手番になりました`);
  
  return { updatedGameState, nextPlayerIndex };
};

/**
 * 利用可能な役割カードがあるかチェック
 * @param roleCards 役割カード配列
 * @returns 利用可能な役割カードがあればtrue
 */
export const hasAvailableRoles = (roleCards: RoleCard[]): boolean => {
  return roleCards.some(card => card.isAvailable);
};

/**
 * 全てのプレイヤーがパスしたかチェック
 * @param gameState ゲーム状態
 * @returns 全プレイヤーがパスした場合true
 */
export const allPlayersHavePassed = (gameState: GameState): boolean => {
  return gameState.players.every(player => player.hasPassed);
};

/**
 * プレイヤーのパス状態をリセット
 * @param gameState ゲーム状態
 * @returns 更新されたゲーム状態
 */
export const resetPlayerPassStatus = (gameState: GameState): GameState => {
  const updatedPlayers = gameState.players.map(player => ({
    ...player,
    hasPassed: false
  }));
  
  return {
    ...gameState,
    players: updatedPlayers
  };
};

/**
 * プレイヤーのパス状態を設定
 * @param gameState ゲーム状態
 * @param playerIndex パスするプレイヤーのインデックス
 * @returns 更新されたゲーム状態
 */
export const setPlayerPassed = (
  gameState: GameState,
  playerIndex: number
): GameState => {
  const updatedPlayers = [...gameState.players];
  updatedPlayers[playerIndex] = {
    ...updatedPlayers[playerIndex],
    hasPassed: true
  };
  
  return {
    ...gameState,
    players: updatedPlayers
  };
}; 