import { nanoid } from 'nanoid'

export type CardRarity = 'SSR' | 'SR' | 'R' | 'C'

export interface Card {
  id: string
  name: string
  cost: number
  description: string
  type: 'attack' | 'skill' | 'power'
  rarity: CardRarity
  effects: {
    damage?: number
    block?: number
    draw?: number
    energy?: number
    multiply?: number // 効果を2倍にするなど
    heal?: number
    strength?: number // 攻撃力上昇
    dexterity?: number // 防御力上昇
  }
  character: string
  flavorText?: string
}

export const initialDeck: Card[] = [
  // SSRカード
  {
    id: nanoid(),
    name: '九天玄雷',
    cost: 3,
    type: 'attack',
    rarity: 'SSR',
    description: '20ダメージを与える。敵の防御を無視する',
    effects: { damage: 20 },
    character: '天魔王 晁蓋',
    flavorText: '梁山泊の初代首領の必殺技'
  },
  {
    id: nanoid(),
    name: '諸葛連弩',
    cost: 2,
    type: 'attack',
    rarity: 'SSR',
    description: '4ダメージを4回与える',
    effects: { damage: 4, multiply: 4 },
    character: '浪子 燕青',
    flavorText: '連射する矢が敵を貫く'
  },

  // SRカード
  {
    id: nanoid(),
    name: '金蛇剣',
    cost: 2,
    type: 'attack',
    rarity: 'SR',
    description: '12ダメージを与え、2ドローする',
    effects: { damage: 12, draw: 2 },
    character: '金蛇郎君 石秀',
    flavorText: '蛇のごとく素早い剣さばき'
  },
  {
    id: nanoid(),
    name: '大力降龍',
    cost: 2,
    type: 'skill',
    rarity: 'SR',
    description: '15ブロックを得る。力を2得る',
    effects: { block: 15, strength: 2 },
    character: '黒旋風 李逵',
    flavorText: '怪力の豪傑'
  },
  {
    id: nanoid(),
    name: '智将の采配',
    cost: 1,
    type: 'power',
    rarity: 'SR',
    description: 'ターン開始時、カードを1枚多く引く',
    effects: { draw: 1 },
    character: '智多星 呉用',
    flavorText: '知略の首領'
  },

  // Rカード
  {
    id: nanoid(),
    name: '打神鞭',
    cost: 1,
    type: 'attack',
    rarity: 'R',
    description: '8ダメージを与える',
    effects: { damage: 8 },
    character: '金槍手 徐寧',
    flavorText: '槍の達人'
  },
  {
    id: nanoid(),
    name: '義士の誓い',
    cost: 1,
    type: 'skill',
    rarity: 'R',
    description: '8ブロックを得る。カードを1枚引く',
    effects: { block: 8, draw: 1 },
    character: '玉麒麟 盧俊義',
    flavorText: '忠義の化身'
  },
  {
    id: nanoid(),
    name: '梁山の結束',
    cost: 1,
    type: 'power',
    rarity: 'R',
    description: '手札のカードのコストを1減らす',
    effects: {},
    character: '呼保義 宋江',
    flavorText: '豪傑たちの絆'
  },

  // Cカード
  {
    id: nanoid(),
    name: '突撃',
    cost: 1,
    type: 'attack',
    rarity: 'C',
    description: '6ダメージを与える',
    effects: { damage: 6 },
    character: '花和尚 魯智深',
    flavorText: '単純だが確実な一撃'
  },
  {
    id: nanoid(),
    name: '防御態勢',
    cost: 1,
    type: 'skill',
    rarity: 'C',
    description: '6ブロックを得る',
    effects: { block: 6 },
    character: '青面獣 楊志',
    flavorText: '基本の構え'
  },
  {
    id: nanoid(),
    name: '気合い',
    cost: 0,
    type: 'skill',
    rarity: 'C',
    description: 'カードを1枚引く',
    effects: { draw: 1 },
    character: '赤髪鬼 劉唐',
    flavorText: '心を整える'
  }
]

// カード報酬プールの定義
export const rewardPool: Card[] = [
  // SSRカード
  {
    id: nanoid(),
    name: '鉄甲玄兵陣',
    cost: 3,
    type: 'power',
    rarity: 'SSR',
    description: 'ターン開始時に15ブロックを得る',
    effects: { block: 15 },
    character: '病尉遅 孫立',
    flavorText: '鉄壁の守り'
  },
  {
    id: nanoid(),
    name: '神機箭',
    cost: 3,
    type: 'attack',
    rarity: 'SSR',
    description: '8ダメージを3回与え、手札を全て捨てる',
    effects: { damage: 8, multiply: 3 },
    character: '神機軍師 朱武',
    flavorText: '百発百中の神業'
  },

  // SRカード
  {
    id: nanoid(),
    name: '破天荒',
    cost: 2,
    type: 'attack',
    rarity: 'SR',
    description: '10ダメージを与え、敵の防御を半分にする',
    effects: { damage: 10 },
    character: '霹靂火 秦明',
    flavorText: '天をも砕く一撃'
  },
  {
    id: nanoid(),
    name: '水滸の意志',
    cost: 2,
    type: 'power',
    rarity: 'SR',
    description: '毎ターン、カードを1枚追加で引く',
    effects: { draw: 1 },
    character: '呼保義 宋江',
    flavorText: '108人の絆'
  },

  // Rカード
  {
    id: nanoid(),
    name: '双刀術',
    cost: 1,
    type: 'attack',
    rarity: 'R',
    description: '4ダメージを2回与える',
    effects: { damage: 4, multiply: 2 },
    character: '双刀 関勝',
    flavorText: '二刀流の達人'
  },
  {
    id: nanoid(),
    name: '鉄壁の構え',
    cost: 2,
    type: 'skill',
    rarity: 'R',
    description: '12ブロックを得る',
    effects: { block: 12 },
    character: '金鎖手 鮮于通',
    flavorText: '堅固な防御'
  },

  // Cカード
  {
    id: nanoid(),
    name: '一撃',
    cost: 1,
    type: 'attack',
    rarity: 'C',
    description: '7ダメージを与える',
    effects: { damage: 7 },
    character: '没羽箭 張清',
    flavorText: '基本の攻撃'
  },
  {
    id: nanoid(),
    name: '体勢を整える',
    cost: 1,
    type: 'skill',
    rarity: 'C',
    description: '7ブロックを得る',
    effects: { block: 7 },
    character: '病大蟲 節振同',
    flavorText: '基本の防御'
  }
]

// デッキをシャッフルする関数
export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck]
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
  }
  return newDeck
}