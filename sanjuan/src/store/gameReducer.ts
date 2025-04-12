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

  // 特権を持っている場合のみカードを引く
  if (state.currentPlayerId === playerId) {
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
  }

  return state;
}

function handleEndAction(state: GameState): GameState {
  // 次のプレイヤーを決定
  const currentPlayerIndex = state.players.findIndex(p => p.id === state.currentPlayerId);
  const nextPlayerIndex = (currentPlayerIndex + 1) % state.players.length;
  const nextPlayerId = state.players[nextPlayerIndex].id;

  // 全プレイヤーが行動を終えたらラウンド終了
  const isRoundEnd = nextPlayerId === state.governorPlayerId;

  return {
    ...state,
    currentPlayerId: nextPlayerId,
    gamePhase: isRoundEnd ? 'end_round' : 'action'
  };
}

function handleEndRound(state: GameState): GameState {
  // 次の総督を決定
  const currentGovernorIndex = state.players.findIndex(p => p.id === state.governorPlayerId);
  const nextGovernorIndex = (currentGovernorIndex + 1) % state.players.length;
  const nextGovernorId = state.players[nextGovernorIndex].id;

  // 新しい商館タイルを公開
  const [newCurrentTile, ...remainingTiles] = state.tradingHouseTiles;

  return {
    ...state,
    governorPlayerId: nextGovernorId,
    currentPlayerId: nextGovernorId,
    selectedRole: null,
    currentRoundRoles: [],
    gamePhase: 'role_selection',
    currentTradingHouseTile: newCurrentTile,
    tradingHouseTiles: remainingTiles
  };
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
      return handleBuild(
        state,
        playerId,
        buildingCard,
        paymentCardIds,
        targetBuildingId
      );
    }

    case 'PRODUCE': {
      const { playerId, productionBuildingIds } = action.params;
      return handleProduce(
        state,
        playerId,
        productionBuildingIds
      );
    }

    case 'TRADE': {
      const { playerId, goodsBuildingIds } = action.params;
      return handleTrade(
        state,
        playerId,
        goodsBuildingIds
      );
    }

    case 'COUNCIL_DRAW':
      return handleCouncilDraw(state, action.params.playerId);

    case 'COUNCIL_KEEP': {
      const { playerId, keepCardIds, discardCardIds } = action.params;
      return handleCouncilKeep(
        state,
        playerId,
        keepCardIds,
        discardCardIds
      );
    }

    case 'PROSPECTOR_DRAW':
      return handleProspectorDraw(state, action.params.playerId);

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