import { Player, Role, GameState } from './GameTypes';
import { BuildingCards } from './BuildingCards';

// ユーティリティ: 山札シャッフル
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// プレイヤー初期化
function createPlayers(): Player[] {
  return [
    { id: 0, name: 'あなた', type: 'human', hand: [], buildings: [], products: {}, isGovernor: true },
    { id: 1, name: 'CPU1', type: 'cpu', hand: [], buildings: [], products: {}, isGovernor: false },
    { id: 2, name: 'CPU2', type: 'cpu', hand: [], buildings: [], products: {}, isGovernor: false },
    { id: 3, name: 'CPU3', type: 'cpu', hand: [], buildings: [], products: {}, isGovernor: false },
  ];
}

// ゲームエンジン
export class GameEngine {
  state: GameState;

  constructor() {
    // 山札生成
    const deck = shuffle(BuildingCards.map(card => card.id));
    // プレイヤー初期化
    const players = createPlayers();
    // インディゴ染料工場を全員に配布
    players.forEach(p => {
      const indigo = deck.find(id => id.startsWith('indigo'));
      if (indigo) {
        p.buildings.push(indigo);
        p.products[indigo] = null;
        deck.splice(deck.indexOf(indigo), 1);
      }
    });
    // 手札配布
    players.forEach(p => {
      p.hand = deck.splice(0, 4);
    });

    this.state = {
      round: 1,
      players,
      deck,
      discard: [],
      availableRoles: ['builder', 'producer', 'trader', 'councillor', 'prospector'],
      currentRole: null,
      currentPlayerIndex: 0,
      log: [],
      marketTiles: [
        [1,1,1,2,2],
        [1,1,2,2,2],
        [1,1,2,2,3],
        [1,2,2,2,3],
        [1,2,2,3,3],
      ],
    };
  }

  // 役割選択
  chooseRole(role: Role) {
    if (!this.state.availableRoles.includes(role)) return false;
    this.state.currentRole = role;
    this.state.availableRoles = this.state.availableRoles.filter(r => r !== role);
    this.state.log.push(`${this.currentPlayer().name}が${role}を選択`);
    return true;
  }

  // 現在のプレイヤー
  currentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }

  // 次のプレイヤーへ
  nextPlayer() {
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
    this.state.currentRole = null;
  }

  // ラウンド終了処理
  endRound() {
    // 総督を左隣へ
    this.state.players.forEach(p => p.isGovernor = false);
    const nextGov = (this.state.players.findIndex(p => p.isGovernor) + 1) % this.state.players.length;
    this.state.players[nextGov].isGovernor = true;
    this.state.currentPlayerIndex = nextGov;
    this.state.availableRoles = ['builder', 'producer', 'trader', 'councillor', 'prospector'];
    this.state.round += 1;
    this.state.log.push(`ラウンド${this.state.round}開始`);
  }
}