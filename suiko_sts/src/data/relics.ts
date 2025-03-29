import { nanoid } from 'nanoid'

export interface Relic {
  id: string
  name: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'boss'
  effect: {
    type: 'maxHp' | 'strength' | 'energy' | 'draw' | 'healing' | 'gold'
    value: number
  }
  image: string // 絵文字を使用
}

export const relicPool: Relic[] = [
  // レアリティ: rare
  {
    id: nanoid(),
    name: '太古の神器',
    description: '最大HPが25増加する',
    rarity: 'rare',
    effect: {
      type: 'maxHp',
      value: 25
    },
    image: '🏺'
  },
  {
    id: nanoid(),
    name: '龍の爪',
    description: '戦闘開始時に腕力が2増加する',
    rarity: 'rare',
    effect: {
      type: 'strength',
      value: 2
    },
    image: '🐲'
  },
  {
    id: nanoid(),
    name: '賢者の石',
    description: 'エネルギーが1増加する',
    rarity: 'rare',
    effect: {
      type: 'energy',
      value: 1
    },
    image: '💎'
  },

  // レアリティ: uncommon
  {
    id: nanoid(),
    name: '戦士の腕輪',
    description: '戦闘開始時に腕力が1増加する',
    rarity: 'uncommon',
    effect: {
      type: 'strength',
      value: 1
    },
    image: '⭕'
  },
  {
    id: nanoid(),
    name: '占い師の水晶',
    description: '戦闘開始時に1枚多くカードを引く',
    rarity: 'uncommon',
    effect: {
      type: 'draw',
      value: 1
    },
    image: '🔮'
  },

  // レアリティ: common
  {
    id: nanoid(),
    name: '布の腕章',
    description: '最大HPが10増加する',
    rarity: 'common',
    effect: {
      type: 'maxHp',
      value: 10
    },
    image: '🎗️'
  },
  {
    id: nanoid(),
    name: '癒しの石',
    description: '戦闘後の回復量が25%増加する',
    rarity: 'common',
    effect: {
      type: 'healing',
      value: 0.25
    },
    image: '💚'
  },
  {
    id: nanoid(),
    name: '幸運の硬貨',
    description: '敵からのゴールド獲得量が25%増加する',
    rarity: 'common',
    effect: {
      type: 'gold',
      value: 0.25
    },
    image: '🪙'
  }
]

// レアリティに応じた出現確率
export const RELIC_RARITY_WEIGHTS = {
  'rare': 10,
  'uncommon': 35,
  'common': 55,
}

// ランダムなお宝を生成
export const generateRandomRelic = (): Relic => {
  const totalWeight = Object.values(RELIC_RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight

  for (const [rarity, weight] of Object.entries(RELIC_RARITY_WEIGHTS)) {
    if (random < weight) {
      const relicsOfRarity = relicPool.filter(relic => relic.rarity === rarity)
      return {
        ...relicsOfRarity[Math.floor(Math.random() * relicsOfRarity.length)],
        id: nanoid() // 新しいIDを生成
      }
    }
    random -= weight
  }

  // フォールバック（通常は到達しない）
  return {
    ...relicPool[0],
    id: nanoid()
  }
}