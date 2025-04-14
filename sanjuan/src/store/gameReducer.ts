// src/store/gameReducer.ts
import { GameState, Role, PlayerState } from './gameStore';
import { GameAction } from './gameActions';
import { BuildingCard } from '../data/cards';

// ヘルパー関数
function drawCards(deck: BuildingCard[], count: number): [BuildingCard[], BuildingCard[]] {
  const drawnCards = deck.slice(0, count);
  const newDeck = deck.slice(count);
  return [drawnCards, newDeck];
}

function findPlayerById(players: PlayerState[], playerId: string): PlayerState | undefined {
  return players.map(p => ({ ...p })).find(p => p.id === playerId);
}

function updatePlayerInList(players: PlayerState[], updatedPlayer: PlayerState): PlayerState[] {
  return players.map(p => p.id === updatedPlayer.id ? updatedPlayer : { ...p });
}

// アクション処理関数
function handleSelectRole(state: GameState, role: Role): GameState {
  const player = state.players.find(p => p.id === state.currentPlayerId);
  // CPUがアクションを実行する場合は、MessageContextを使ってメッセージを表示する
  if (player && !player.isHuman) {
    // 注：この位置ではMessageContextにアクセスできないため、stateに情報を保存
    return {
      ...state,
      selectedRole: role,
      currentRoundRoles: [...state.currentRoundRoles, role],
      gamePhase: 'action',
      lastCpuAction: {
        playerId: player.id,
        role,
        type: 'select_role'
      }
    };
  }
  return {
    ...state,
    selectedRole: role,
    currentRoundRoles: [...state.currentRoundRoles, role],
    gamePhase: 'action'
  };
}

function handleBuild(
  state: GameState,
  playerId: string,
  buildingCard: BuildingCard,
  paymentCardIds: string[],
  targetBuildingId?: string
): GameState {
  const player = findPlayerById(state.players, playerId);
  if (!player) return state;

  // プレイヤーの手札から支払いカードと建設カードを除去
  const newHand = player.hand.filter(card => 
    !paymentCardIds.includes(card.id) && card.id !== buildingCard.id
  );

  // 建て替えの場合は既存の建物を削除
  let newBuildings = player.buildings;
  if (targetBuildingId) {
    const replacedBuilding = player.buildings.find(b => b.id === targetBuildingId);
    if (replacedBuilding) {
      newBuildings = player.buildings.filter(b => b.id !== targetBuildingId);
      // 建て替えた建物を捨て札に追加
      state.discardPile = [...state.discardPile, replacedBuilding];
    }
  }

  // 新しい建物を追加
  newBuildings = [...newBuildings, buildingCard];

  // プレイヤーの状態を更新
  const updatedPlayer: PlayerState = {
    ...player,
    hand: newHand,
    buildings: newBuildings,
    goods: {
      ...player.goods,
      [buildingCard.id]: null // 新しい建物の商品スロットを初期化
    }
  };

  // 支払いカードを捨て札に追加
  const newDiscardPile = [
    ...state.discardPile,
    ...player.hand.filter(card => paymentCardIds.includes(card.id))
  ];

  return {
    ...state,
    players: updatePlayerInList(state.players, updatedPlayer),
    discardPile: newDiscardPile
  };
}

function handleProduce(
  state: GameState,
  playerId: string,
  productionBuildingIds: string[]
): GameState {
  const player = findPlayerById(state.players, playerId);
  if (!player) return state;

  // 各生産施設に商品を配置
  let newDeck = [...state.deck];
  const newGoods = { ...player.goods };

  productionBuildingIds.forEach(buildingId => {
    if (newDeck.length > 0 && !newGoods[buildingId]) {
      const [drawnCards, remainingDeck] = drawCards(newDeck, 1);
      newDeck = remainingDeck;
      if (drawnCards.length > 0) {
        newGoods[buildingId] = drawnCards[0];
      }
    }
  });

  // プレイヤーの状態を更新
  const updatedPlayer: PlayerState = {
    ...player,
    goods: newGoods
  };

  return {
    ...state,
    players: updatePlayerInList(state.players, updatedPlayer),
    deck: newDeck
  };
}

function handleTrade(
  state: GameState,
  playerId: string,
  goodsBuildingIds: string[]
): GameState {
  const player = findPlayerById(state.players, playerId);
  if (!player || !state.currentTradingHouseTile) return state;

  // 各商品の売却処理
  let totalCards = 0;
  const newGoods = { ...player.goods };
  const soldGoods: BuildingCard[] = [];

  goodsBuildingIds.forEach(buildingId => {
    const good = newGoods[buildingId];
    if (good && state.currentTradingHouseTile) {
      const building = player.buildings.find(b => b.id === buildingId);
      if (building?.type === 'production') {
        const price = state.currentTradingHouseTile.prices[building.produces];
        totalCards += price;
        soldGoods.push(good);
        newGoods[buildingId] = null;
      }
    }
  });

  // カードを引く
  let newDeck = [...state.deck];
  let newHand = [...player.hand];
  if (totalCards > 0) {
    const [drawnCards, remainingDeck] = drawCards(newDeck, totalCards);
    newDeck = remainingDeck;
    newHand = [...newHand, ...drawnCards];
  }

  // プレイヤーの状態を更新
  const updatedPlayer: PlayerState = {
    ...player,
    hand: newHand,
    goods: newGoods
  };

  return {
    ...state,
    players: updatePlayerInList(state.players, updatedPlayer),
    deck: newDeck,
    discardPile: [...state.discardPile, ...soldGoods]
  };
}

function handleCouncilDraw(state: GameState, playerId: string): GameState {
  const player = findPlayerById(state.players, playerId);
  if (!player) return state;

  // カードを引く枚数を決定（特権がある場合は+3）
  const drawCount = state.currentPlayerId === playerId ? 5 : 2;
  const [drawnCards, newDeck] = drawCards(state.deck, drawCount);

  // プレイヤーの状態を一時的に更新（選択フェーズで使用）
  const updatedPlayer: PlayerState = {
    ...player,
    hand: [...player.hand, ...drawnCards]
  };

  return {
    ...state,
    players: updatePlayerInList(state.players, updatedPlayer),
    deck: newDeck
  };
}

function handleCouncilKeep(
  state: GameState,
  playerId: string,
  keepCardIds: string[],
  discardCardIds: string[]
): GameState {
  const player = findPlayerById(state.players, playerId);
  if (!player) return state;

  // 保持するカードと捨てるカードを分離
  const newHand = player.hand.filter(card => keepCardIds.includes(card.id));
  const discardedCards = player.hand.filter(card => discardCardIds.includes(card.id));

  // プレイヤーの状態を更新
  const updatedPlayer: PlayerState = {
    ...player,
    hand: newHand
  };

  return {
    ...state,
    players: updatePlayerInList(state.players, updatedPlayer),
    discardPile: [...state.discardPile, ...discardedCards]
  };
}

function handleProspectorDraw(state: GameState, playerId: string): GameState {
  const player = findPlayerById(state.players, playerId);
  if (!player) return state;

  // 金鉱掘りの役職を選択したプレイヤーのみが特権を持つ
  const hasPrivilege = playerId === state.currentPlayerId && state.selectedRole === 'prospector';
  
  if (hasPrivilege) {
    const [drawnCards, newDeck] = drawCards(state.deck, 1);
    const updatedPlayer: PlayerState = {
      ...player,
      hand: [...player.hand, ...drawnCards]
    };

    return {
      ...state,
      players: updatePlayerInList(state.players, updatedPlayer),
      deck: newDeck
    };
  } else {
    return {
      ...state,
      lastCpuAction: {
        playerId: player.id,
        role: 'prospector',
        type: 'prospect_fail'  // 特権がないため失敗
      }
    };
  }
}

// CPUプレイヤーの行動を処理する関数群
function handleCpuProspectorAction(state: GameState): GameState {
  const currentPlayerId = state.currentPlayerId;
  const afterDraw = handleProspectorDraw(state, currentPlayerId);
  afterDraw.lastCpuAction = {
    playerId: currentPlayerId,
    role: 'prospector',
    type: 'prospect'
  };
  return handleEndAction(afterDraw);
}
function handleCpuBuilderAction(state: GameState): GameState {
  const player = state.players.find(p => p.id === state.currentPlayerId);
  if (!player) return handleEndAction(state);


  // 手札から建設可能な建物を探す（建設家の場合はコスト-1）
  const buildableCards = player.hand.map(card => {
    const baseCost = card.cost;
    const privilegeDiscount = state.selectedRole === 'builder' ? 1 : 0;
    const actualCost = Math.max(0, baseCost - privilegeDiscount);
    const availablePayment = player.hand.filter(c => c.id !== card.id).length;
    return {
      card,
      actualCost,
      canBuild: actualCost <= availablePayment
    };
  }).filter(item => item.canBuild);

  if (buildableCards.length === 0) {
    return handleEndAction(state);
  }

  // コストが最も高い建物を選択
  const { card: buildingCard, actualCost } = buildableCards
    .reduce((a, b) => a.card.cost > b.card.cost ? a : b);

  // 支払いカードを選択（コストの低い順）
  const paymentCards = player.hand
    .filter(card => card.id !== buildingCard.id)
    .sort((a, b) => a.cost - b.cost) // コストの低い順にソート
    .slice(0, actualCost)
    .map(card => card.id);

  // 建設を実行
  const newState = handleBuild(state, player.id, buildingCard, paymentCards);
  
  // 建設結果を確認
  const afterPlayer = newState.players.find(p => p.id === player.id)!;
  const didBuild = afterPlayer.buildings.length > player.buildings.length;
  if (didBuild) {
    newState.lastCpuAction = {
      playerId: player.id,
      role: 'builder',
      type: 'build_success'
    };
  } else {
    newState.lastCpuAction = {
      playerId: player.id,
      role: 'builder',
      type: 'build_fail'
    };
  }

  return handleEndAction(newState);
}

function handleCpuProducerAction(state: GameState): GameState {
  const player = state.players.find(p => p.id === state.currentPlayerId);
  if (!player) return handleEndAction(state);

  // 空の生産施設を選択
  const emptyProductionBuildings = player.buildings
    .filter(building => building.type === 'production' && !player.goods[building.id]);

  if (emptyProductionBuildings.length === 0) {
    return handleEndAction(state);
  }

  // 生産を実行し、その後次のプレイヤーへ
  const producedState = handleProduce(state, player.id, emptyProductionBuildings.map(b => b.id));
  producedState.lastCpuAction = {
    playerId: player.id,
    role: 'producer',
    type: 'produce'
  };
  return handleEndAction(producedState);
}

function handleCpuTraderAction(state: GameState): GameState {
  const player = state.players.find(p => p.id === state.currentPlayerId);
  if (!player || !state.currentTradingHouseTile) return handleEndAction(state);

  // 商品がある生産施設を選択
  const buildingsWithGoods = player.buildings
    .filter(building => {
      if (!state.currentTradingHouseTile) return false;
      return (
        building.type === 'production' &&
        player.goods[building.id] &&
        state.currentTradingHouseTile.prices[building.produces] > 0
      );
    });

  if (buildingsWithGoods.length === 0) {
    return handleEndAction(state);
  }

  // 売却を実行し、その後次のプレイヤーへ
  const tradedState = handleTrade(state, player.id, buildingsWithGoods.map(b => b.id));
  tradedState.lastCpuAction = {
    playerId: player.id,
    role: 'trader',
    type: 'trade'
  };
  return handleEndAction(tradedState);
}

function handleCpuCouncilorAction(state: GameState): GameState {
  const player = state.players.find(p => p.id === state.currentPlayerId);
  if (!player) return handleEndAction(state);

  // まずカードを引く
  const afterDraw = handleCouncilDraw(state, player.id);
  const updatedPlayer = afterDraw.players.find(p => p.id === player.id);
  if (!updatedPlayer) return handleEndAction(afterDraw);

  // 手札から最もコストの高いカードを保持
  const sortedHand = [...updatedPlayer.hand].sort((a, b) => b.cost - a.cost);
  const keepCount = state.currentPlayerId === player.id ? 2 : 1; // 議員の特権で+1
  const keepCards = sortedHand.slice(0, keepCount);
  const discardCards = sortedHand.slice(keepCount);

  const finalState = handleCouncilKeep(
    afterDraw,
    player.id,
    keepCards.map(c => c.id),
    discardCards.map(c => c.id)
  );

  finalState.lastCpuAction = {
    playerId: player.id,
    role: 'councilor',
    type: 'council'
  };
  return handleEndAction(finalState);
}


function handleEndAction(state: GameState): GameState {
  // 次のプレイヤーを決定
  const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
  const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
  const nextPlayerId = state.players[nextPlayerIndex].id;
  const nextPlayer = state.players.find(p => p.id === nextPlayerId)!;
  
  // 全プレイヤーが行動を終えたらラウンド終了
  const isRoundEnd = nextPlayerId === state.governorPlayerId;
  
  // ラウンド終了時はそのままラウンド終了処理へ
  if (isRoundEnd) {
    return {
      ...state,
      currentPlayerId: nextPlayerId,
      gamePhase: 'end_round'
    };
  }

  // 次のプレイヤーのターンへ
  let newState: GameState = {
    ...state,
    currentPlayerId: nextPlayerId,
    gamePhase: 'action'
  };
  
  // 自動処理：次のプレイヤーがCPUの場合、役割に応じて自動で処理を実行
  if (!nextPlayer.isHuman && state.selectedRole) {
    switch (state.selectedRole) {
      case 'builder':
        newState = handleCpuBuilderAction(newState);
        break;
      case 'producer':
        newState = handleCpuProducerAction(newState);
        break;
      case 'trader':
        newState = handleCpuTraderAction(newState);
        break;
      case 'councilor':
        newState = handleCpuCouncilorAction(newState);
        break;
      case 'prospector':
        newState = handleCpuProspectorAction(newState);
        break;
    }
  }
  
  return newState;
}

function handleEndRound(state: GameState): GameState {
  // 次の総督を決定
  const currentGovernorIndex = state.players.findIndex(p => p.id === state.governorPlayerId);
  const nextGovernorIndex = (currentGovernorIndex + 1) % state.players.length;
  const nextGovernorId = state.players[nextGovernorIndex].id;
  const nextGovernor = state.players[nextGovernorIndex];

  // 新しい商館タイルを公開
  const [newCurrentTile, ...remainingTiles] = state.tradingHouseTiles;

  let newState: GameState = {
    ...state,
    governorPlayerId: nextGovernorId,
    currentPlayerId: nextGovernorId,
    selectedRole: null,
    currentRoundRoles: [],
    gamePhase: 'role_selection',
    currentTradingHouseTile: newCurrentTile,
    tradingHouseTiles: remainingTiles
  };

  // CPUプレイヤーの場合、自動で役割を選択して行動を実行
  if (!nextGovernor.isHuman) {
    const availableRoles: Role[] = ['builder', 'producer', 'trader', 'councilor', 'prospector'];
    
    // CPU戦略：状況に応じて最適な役割を選択
    let selectedRole: Role = 'prospector'; // デフォルト値を設定

    // 建設可能な建物があるかチェック
    const hasBuildableCards = nextGovernor.hand.some(card => {
      const cost = Math.max(0, card.cost - 1); // 建設家の特権を考慮
      const availablePayment = nextGovernor.hand.filter(c => c.id !== card.id).length;
      return cost <= availablePayment;
    });

    if (hasBuildableCards && !newState.currentRoundRoles.includes('builder')) {
      // 建設可能な建物がある場合は建設家を優先
      selectedRole = 'builder';
    } else if (nextGovernor.hand.length < 3 && !newState.currentRoundRoles.includes('councilor')) {
      selectedRole = 'councilor';
    } else if (nextGovernor.buildings.filter(b => b.type === 'production').length > 0) {
      if (!newState.currentRoundRoles.includes('producer')) {
        selectedRole = 'producer';
      } else if (!newState.currentRoundRoles.includes('trader')) {
        selectedRole = 'trader';
      }
    } else {
      // 他の役割がすべて使用済みの場合は金鉱掘りを選択
      const role = availableRoles.find(r => !newState.currentRoundRoles.includes(r));
      if (role) {
        selectedRole = role;
      }
    }

    // 役割を選択して行動を実行
    newState = handleSelectRole(newState, selectedRole);
    
    // 選んだ役割でアクションを実行
    newState = handleSelectRole(newState, selectedRole);

    switch (selectedRole) {
      case 'builder':
        newState = handleCpuBuilderAction(newState);
        break;
      case 'producer':
        newState = handleCpuProducerAction(newState);
        break;
      case 'trader':
        newState = handleCpuTraderAction(newState);
        break;
      case 'councilor':
        newState = handleCpuCouncilorAction(newState);
        break;
      case 'prospector':
        newState = handleCpuProspectorAction(newState);
        break;
    }
  }

  return newState;
}

function handleEndGame(state: GameState): GameState {
  // 勝者を決定（得点計算）
  // TODO: 得点計算ロジックの実装
  return {
    ...state,
    gamePhase: 'game_over',
    winnerPlayerId: null // TODO: 実際の勝者ID
  };
}

// メインのリデューサー関数
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_ROLE': {
      const { role } = action.params;
      return handleSelectRole(state, role);
    }
case 'BUILD': {
  const { playerId, buildingCard, paymentCardIds, targetBuildingId } = action.params;
  const buildUpdatedState = handleBuild(
    state,
    playerId,
    buildingCard,
    paymentCardIds,
    targetBuildingId
  );
  return handleEndAction(buildUpdatedState);
}
case 'PRODUCE': {
  const { playerId, productionBuildingIds } = action.params;
  const produceUpdatedState = handleProduce(state, playerId, productionBuildingIds);
  return handleEndAction(produceUpdatedState);
}

    case 'TRADE': {
      const { playerId, goodsBuildingIds } = action.params;
      const tradeUpdatedState = handleTrade(
        state,
        playerId,
        goodsBuildingIds
      );
      return handleEndAction(tradeUpdatedState);
    }

    case 'COUNCIL_DRAW': {
      const { playerId } = action.params;
      const drawUpdatedState = handleCouncilDraw(state, playerId);
      if (state.players.find(p => p.id === playerId)?.isHuman) {
        return drawUpdatedState;
      }
      return handleEndAction(drawUpdatedState);
    }

    case 'COUNCIL_KEEP': {
      const { playerId, keepCardIds, discardCardIds } = action.params;
      const keepUpdatedState = handleCouncilKeep(
        state,
        playerId,
        keepCardIds,
        discardCardIds
      );
      return handleEndAction(keepUpdatedState);
    }

    case 'PROSPECTOR_DRAW': {
      const { playerId } = action.params;
      const prospectorState = handleProspectorDraw(state, playerId);
      return handleEndAction(prospectorState);
    }

    case 'PASS':
      return handleEndAction(state);

    case 'END_ACTION':
      return handleEndAction(state);

    case 'END_ROUND':
      return handleEndRound(state);

    case 'END_GAME':
      return handleEndGame(state);

    default:
      return state;
  }
}