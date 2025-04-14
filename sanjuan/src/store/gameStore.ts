// src/store/gameStore.ts
import { BuildingCard, TradingHouseTile, createInitialDeck, shuffleTradingHouseTiles, indigoPlantDef } from '../data/cards';
import { v4 as uuidv4 } from 'uuid'; // UUID生成ライブラリが必要 npm install uuid @types/uuid

// プレイヤーの状態
export interface PlayerState {
  id: string; // 'player' or 'cpu1', 'cpu2', 'cpu3'
  isHuman: boolean;
  hand: BuildingCard[];
  buildings: BuildingCard[]; // 建設済みの建物 (インスタンス)
  goods: Record<string, BuildingCard | null>; // 建設済み建物のID -> 商品として置かれたカード (インスタンス) or null
  vpChips: number; // 礼拝堂などで獲得するVPチップ
}

// 役割の種類
export type Role = 'builder' | 'producer' | 'trader' | 'councilor' | 'prospector';

// CPUの行動タイプ
export type CpuActionType =
  | 'select_role'
  | 'build_success'
  | 'build_fail'
  | 'produce'
  | 'trade'
  | 'council'
  | 'prospect'
  | 'prospect_fail';

// CPU行動の記録
export interface CpuAction {
  playerId: string;
  role: Role;
  type: CpuActionType;
}

// ゲーム全体の状態
export interface GameState {
  players: PlayerState[];
  deck: BuildingCard[];
  discardPile: BuildingCard[];
  tradingHouseTiles: TradingHouseTile[];
  currentTradingHouseTile: TradingHouseTile | null;
  governorPlayerId: string; // 現在の総督のプレイヤーID
  currentPlayerId: string; // 現在手番のプレイヤーID
  currentRoundRoles: Role[]; // このラウンドで選択された役割
  selectedRole: Role | null; // 現在選択されている役割
  gamePhase: 'role_selection' | 'action' | 'end_round' | 'game_over';
  winnerPlayerId: string | null;
  lastCpuAction: CpuAction | null;
}

// 初期プレイヤー状態を生成する関数
function createInitialPlayerState(id: string, isHuman: boolean, initialHand: BuildingCard[]): PlayerState {
  // 各プレイヤーは初期建物としてインディゴ染料工場を持つ
  const initialBuilding: BuildingCard = { ...indigoPlantDef, id: uuidv4() }; // インスタンス固有IDを付与
  return {
    id,
    isHuman,
    hand: initialHand,
    buildings: [initialBuilding],
    goods: { [initialBuilding.id]: null }, // 初期建物の商品スロット
    vpChips: 0,
  };
}

// 初期ゲーム状態を生成する関数
export function createInitialGameState(): GameState {
  const initialDeck = createInitialDeck();
  const players: PlayerState[] = [];
  const playerIds = ['player', 'cpu1', 'cpu2', 'cpu3'];

  // 初期手札を配る
  const hands: BuildingCard[][] = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const card = initialDeck.pop();
      if (card) {
        hands[i].push(card);
      } else {
        // 山札が足りない場合はエラー（通常は起こらないはず）
        console.error("Error: Not enough cards in the deck for initial hands.");
      }
    }
  }

  // プレイヤー状態を作成
  players.push(createInitialPlayerState('player', true, hands[0]));
  players.push(createInitialPlayerState('cpu1', false, hands[1]));
  players.push(createInitialPlayerState('cpu2', false, hands[2]));
  players.push(createInitialPlayerState('cpu3', false, hands[3]));

  // 商館タイルをシャッフル
  const shuffledTiles = shuffleTradingHouseTiles();

  // 最初の総督をランダムに決定 (ここでは仮に'player'とする)
  const initialGovernorId = playerIds[0]; // TODO: ランダム化

  return {
    players,
    deck: initialDeck,
    discardPile: [],
    tradingHouseTiles: shuffledTiles,
    currentTradingHouseTile: null, // 最初は公開されていない
    governorPlayerId: initialGovernorId,
    currentPlayerId: initialGovernorId, // 最初の手番は総督
    currentRoundRoles: [],
    selectedRole: null,
    gamePhase: 'role_selection', // ゲーム開始時は役割選択フェーズ
    winnerPlayerId: null,
    lastCpuAction: null,
  };
}