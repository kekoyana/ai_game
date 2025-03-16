import { nanoid } from 'nanoid'

export interface Card {
  id: string
  name: string
  cost: number
  description: string
  type: 'attack' | 'skill' | 'power'
  effects: {
    damage?: number
    block?: number
    draw?: number
    energy?: number
  }
  character: string // カードに関連する梁山泊の豪傑の名前
  flavorText?: string // 豪傑の説明や名言
}

export const initialDeck: Card[] = [
  {
    id: nanoid(),
    name: '九天で雷を呼ぶ',
    cost: 2,
    type: 'attack',
    description: '12ダメージを与える',
    effects: { damage: 12 },
    character: '天王 晁蓋',
    flavorText: '梁山泊の初代首領'
  },
  {
    id: nanoid(),
    name: '矛術の極意',
    cost: 1,
    type: 'attack',
    description: '6ダメージを与える。カードを1枚引く',
    effects: { damage: 6, draw: 1 },
    character: '小温侯 呉用',
    flavorText: '知略の首領'
  },
  {
    id: nanoid(),
    name: '神行太保の足技',
    cost: 1,
    type: 'skill',
    description: '8ブロックを得る。カードを1枚引く',
    effects: { block: 8, draw: 1 },
    character: '神行太保 戴宗',
    flavorText: '飛脚の名手'
  },
  {
    id: nanoid(),
    name: '双刀の舞',
    cost: 2,
    type: 'attack',
    description: '5ダメージを3回与える',
    effects: { damage: 5 },
    character: '双刀 関勝',
    flavorText: '関羽の末裔'
  },
  {
    id: nanoid(),
    name: '浪子の知恵',
    cost: 0,
    type: 'skill',
    description: 'カードを2枚引く',
    effects: { draw: 2 },
    character: '浪子 燕青',
    flavorText: '才知勇兼備の豪傑'
  },
  {
    id: nanoid(),
    name: '金槍の一閃',
    cost: 1,
    type: 'attack',
    description: '8ダメージを与える',
    effects: { damage: 8 },
    character: '金槍手 徐寧',
    flavorText: '槍の達人'
  },
  {
    id: nanoid(),
    name: '忠義の誓い',
    cost: 2,
    type: 'power',
    description: 'ターン開始時にカードを1枚多く引く',
    effects: { draw: 1 },
    character: '玉麒麟 盧俊義',
    flavorText: '梁山泊の副首領'
  },
  {
    id: nanoid(),
    name: '花和尚の拳',
    cost: 3,
    type: 'attack',
    description: '20ダメージを与える',
    effects: { damage: 20 },
    character: '花和尚 魯智深',
    flavorText: '怪力の僧侶'
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