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
    multiply?: number
    strength?: number
    dexterity?: number
  }
  character: string
  flavorText?: string
}

// すべてのカードの定義
export const allCards: Card[] = [
  // コスト1アタックカード（ダメージ6）
  {
    id: 'attack_bokutou_ryoudan',
    name: '朴刀両断',
    cost: 1,
    type: 'attack',
    rarity: 'C',
    description: '6ダメージを与える',
    effects: { damage: 6 },
    character: '矮脚虎 王英',
    flavorText: '朴刀で繰り出す一撃'
  },
  {
    id: 'attack_kachiwari',
    name: 'かち割り',
    cost: 1,
    type: 'attack',
    rarity: 'C',
    description: '6ダメージを与える',
    effects: { damage: 6 },
    character: '雲裏金剛 宋万',
    flavorText: '巨漢の力で振るう一撃'
  },
  {
    id: 'attack_furiotosu',
    name: '振り下ろす',
    cost: 1,
    type: 'attack',
    rarity: 'C',
    description: '6ダメージを与える',
    effects: { damage: 6 },
    character: '摸着天 杜遷',
    flavorText: '長身から繰り出す一撃'
  },
  {
    id: 'attack_tenjou_tsuki',
    name: '天上突き',
    cost: 1,
    type: 'attack',
    rarity: 'C',
    description: '6ダメージを与える',
    effects: { damage: 6 },
    character: '毛頭星 孔明',
    flavorText: '天をも貫く一撃'
  },
  {
    id: 'attack_chika_tsuki',
    name: '地下突き',
    cost: 1,
    type: 'attack',
    rarity: 'C',
    description: '6ダメージを与える',
    effects: { damage: 6 },
    character: '独火星 孔亮',
    flavorText: '地をも貫く一撃'
  },
  
  // コスト2アタックカード（ダメージ8）
  {
    id: 'attack_daichi_giri',
    name: '大地斬',
    cost: 2,
    type: 'attack',
    rarity: 'C',
    description: '8ダメージを与える',
    effects: { damage: 8 },
    character: '錦毛虎 燕順',
    flavorText: '大地を切り裂く一撃'
  },

  // コスト1スキルカード（防御5）
  {
    id: 'skill_enkai_shiki',
    name: '宴会の指揮',
    cost: 1,
    type: 'skill',
    rarity: 'C',
    description: '5ブロックを得る',
    effects: { block: 5 },
    character: '鉄扇子 宋清',
    flavorText: '宴会で士気を高める'
  },
  {
    id: 'skill_gin_saiku',
    name: '銀細工',
    cost: 1,
    type: 'skill',
    rarity: 'C',
    description: '5ブロックを得る',
    effects: { block: 5 },
    character: '白面郎君 鄭天寿',
    flavorText: '銀の細工で編み出す防御'
  },
  {
    id: 'skill_izakaya_mamori',
    name: '居酒屋の守り',
    cost: 1,
    type: 'skill',
    rarity: 'C',
    description: '5ブロックを得る',
    effects: { block: 5 },
    character: '旱地忽律 朱貴',
    flavorText: '梁山泊の南の居酒屋守護'
  },
  {
    id: 'skill_sekiheki',
    name: '石壁',
    cost: 1,
    type: 'skill',
    rarity: 'C',
    description: '5ブロックを得る',
    effects: { block: 5 },
    character: '石将軍 石勇',
    flavorText: '岩のように揺るがぬ防御'
  },

  // SSRカード
  {
    id: 'power_tekkou_genpeijin',
    name: '鉄甲玄兵陣',
    cost: 3,
    type: 'power',
    rarity: 'SSR',
    description: 'ターン開始時に15ブロックを得る',
    effects: { block: 15 },
    character: '病尉遅 孫立',
    flavorText: '百戦錬磨の将が編み出した最強の陣'
  },
  {
    id: 'attack_shinki_ya',
    name: '神機箭',
    cost: 3,
    type: 'attack',
    rarity: 'SSR',
    description: '8ダメージを3回与え、手札を全て捨てる（腕力が各ヒットに適用）',
    effects: { damage: 8, multiply: 3 },
    character: '神機軍師 朱武',
    flavorText: '天才軍師の放つ三連矢は必ず命中する'
  },
  {
    id: 'power_haou_igen',
    name: '覇王の威厳',
    cost: 3,
    type: 'power',
    rarity: 'SSR',
    description: '腕力を3得る。さらに毎ターン終了時に腕力を1得る',
    effects: { strength: 3 },
    character: '天魔王 晁蓋',
    flavorText: '梁山泊の初代首領、その威厳は敵をも味方にする'
  },

  // SRカード
  {
    id: 'attack_hatenkou',
    name: '破天荒',
    cost: 2,
    type: 'attack',
    rarity: 'SR',
    description: '10ダメージを与え、敵の防御を半分にする',
    effects: { damage: 10 },
    character: '霹靂火 秦明',
    flavorText: '稲妻の如き一撃は敵の防御さえ砕く'
  },
  {
    id: 'power_suiko_ishi',
    name: '水滸の意志',
    cost: 2,
    type: 'power',
    rarity: 'SR',
    description: '毎ターン、カードを1枚追加で引く',
    effects: { draw: 1 },
    character: '呼保義 宋江',
    flavorText: '梁山泊の兄弟たちの心を一つに結ぶ'
  },

  // Rカード
  {
    id: 'power_bushin_kakusei',
    name: '武神の覚醒',
    cost: 2,
    type: 'power',
    rarity: 'R',
    description: '腕力を2得る（攻撃力が永続的に2上昇）',
    effects: { strength: 2 },
    character: '双刀 関勝',
    flavorText: '二刀流の達人、その刃は戦いの中で更に鋭さを増す'
  },
  {
    id: 'skill_teppeki_kamae',
    name: '鉄壁の構え',
    cost: 2,
    type: 'skill',
    rarity: 'R',
    description: '12ブロックを得る',
    effects: { block: 12 },
    character: '金鎖手 鮮于通',
    flavorText: '金の鎖で織りなす完璧な防御'
  },

  // Cカード
  {
    id: 'attack_hishou_ya',
    name: '飛翔箭',
    cost: 1,
    type: 'attack',
    rarity: 'C',
    description: '7ダメージを与える',
    effects: { damage: 7 },
    character: '没羽箭 張清',
    flavorText: '羽のように軽やかに放たれる矢は、必ず標的を射抜く'
  },
  {
    id: 'skill_daichuu_kamae',
    name: '大蟲の構え',
    cost: 1,
    type: 'skill',
    rarity: 'C',
    description: '7ブロックを得る',
    effects: { block: 7 },
    character: '病大蟲 節振同',
    flavorText: '巨漢の体で敵の攻撃を受け止める'
  }
]

// 初期デッキのカードID
export const initialDeckCardIds = [
  'attack_bokutou_ryoudan',
  'attack_kachiwari',
  'attack_furiotosu',
  'attack_tenjou_tsuki',
  'attack_chika_tsuki',
  'attack_daichi_giri',
  'skill_enkai_shiki',
  'skill_gin_saiku',
  'skill_izakaya_mamori',
  'skill_sekiheki'
]

// カードIDからカードを取得
export const getCardById = (id: string): Card | undefined => {
  return allCards.find(card => card.id === id)
}

// 初期デッキを生成
export const createInitialDeck = (): Card[] => {
  return initialDeckCardIds.map(id => {
    const card = getCardById(id)
    if (!card) throw new Error(`Card not found: ${id}`)
    return { ...card, id: nanoid() } // 新しいIDを生成
  })
}

// 報酬プールからカードを取得（レアリティでフィルタリング可能）
export const getRewardPool = (rarity?: CardRarity): Card[] => {
  const pool = allCards.filter(card => !initialDeckCardIds.includes(card.id))
  if (rarity) {
    return pool.filter(card => card.rarity === rarity)
  }
  return pool
}

// デッキをシャッフルする関数
export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck]
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
  }
  return newDeck
}