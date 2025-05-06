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
  // 建築士（builder）処理: 建物建設
  // playerId: 建設するプレイヤー, buildingId: 建設する建物, payment: 支払いカードID配列
  buildBuilding(playerId: number, buildingId: string, payment: string[]): boolean {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return false;
    if (player.buildings.includes(buildingId)) return false; // 既に建設済み
    const card = BuildingCards.find(c => c.id === buildingId);
    if (!card) return false;
    // コスト計算（特権や効果は未考慮のシンプル版）
    if (payment.length < card.cost) return false;
    // 支払いカードが手札にあるか
    if (!payment.every(id => player.hand.includes(id))) return false;
    // 建設
    player.buildings.push(buildingId);
    player.hand = player.hand.filter(id => !payment.includes(id));
    this.state.discard.push(...payment);
    this.state.log.push(`${player.name}が${card.name}を建設`);
    return true;
  }

  /**
   * 監督（producer）処理: 生産
   * @param playerId 生産するプレイヤー
   */
  produce(playerId: number): boolean {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return false;
    let produced = false;
    for (const bId of player.buildings) {
      const card = BuildingCards.find(c => c.id === bId);
      if (!card || card.category !== 'production') continue;
      if (player.products[bId]) continue; // 既に商品あり
      // 山札から1枚引いて商品に
      if (this.state.deck.length === 0) break;
      const prodCard = this.state.deck.shift()!;
      player.products[bId] = prodCard;
      produced = true;
      this.state.log.push(`${player.name}の${card.name}で商品を生産`);
    }
    return produced;
  }

  /**
   * 商人（trader）処理: 商品売却
   * @param playerId 売却するプレイヤー
   * @param buildingId 生産施設ID
   * @returns 売却で得たカードID配列（対価）、売却失敗時はnull
   */
  trade(playerId: number, buildingId: string): string[] | null {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return null;
    // 商品がある生産施設のみ売却可
    const product = player.products[buildingId];
    if (!product) return null;
    // 商館タイルからランダムに1枚選ぶ
    if (this.state.marketTiles.length === 0) return null;
    const tileIdx = Math.floor(Math.random() * this.state.marketTiles.length);
    const tile = this.state.marketTiles[tileIdx];
    // 建物種別ごとにインデックス
    const card = BuildingCards.find(c => c.id === buildingId);
    if (!card || card.category !== 'production') return null;
    const prodIdx = ['indigo', 'sugar', 'tobacco', 'coffee', 'silver'].findIndex(type =>
      buildingId.startsWith(type)
    );
    if (prodIdx === -1) return null;
    const rewardNum = tile[prodIdx];
    // 山札から対価カードを得る
    const reward = this.state.deck.splice(0, rewardNum);
    player.hand.push(...reward);
    // 商品を捨て札に
    this.state.discard.push(product);
    player.products[buildingId] = null;
    this.state.log.push(`${player.name}が${card.name}の商品を売却し${rewardNum}枚獲得`);
    return reward;
  }

  // 現在のプレイヤー
  currentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }

  /**
   * 金鉱掘り（prospector）処理: 山札から1枚引く
   * @param playerId 対象プレイヤー
   * @returns 引いたカードID、山札が空ならnull
   */
  prospector(playerId: number): string | null {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return null;
    if (this.state.deck.length === 0) return null;
    const card = this.state.deck.shift()!;
    player.hand.push(card);
    this.state.log.push(`${player.name}が金鉱掘りで${card}を獲得`);
    return card;
  }

  /**
   * 参事会議員（councillor）処理: 山札からカードを引き1枚選択
   * @param playerId 対象プレイヤー
   * @param selectIdx 選択するカードのインデックス（0始まり）
   * @returns 選択したカードID、失敗時はnull
   */
  councillor(playerId: number, selectIdx: number): string | null {
    const player = this.state.players.find(p => p.id === playerId);
    if (!player) return null;
    // 山札から2枚引く
    if (this.state.deck.length < 2) return null;
    const drawn = this.state.deck.splice(0, 2);
    if (selectIdx < 0 || selectIdx >= drawn.length) return null;
    const chosen = drawn[selectIdx];
    player.hand.push(chosen);
    // 残りは捨て札
    const discard = drawn.filter((_, i) => i !== selectIdx);
    this.state.discard.push(...discard);
    this.state.log.push(`${player.name}が参事会議員で${chosen}を獲得`);
    return chosen;
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
