import { Card, CardRarity } from './cards'
import { Relic } from './relics'

export interface ShopItem {
  id: string
  type: 'card' | 'relic' | 'potion'
  name: string
  description: string
  cost: number
  rarity: CardRarity | 'common' | 'uncommon' | 'rare' | 'boss'
  item: Card | Relic
}

// 値段の設定
const CARD_PRICE_MULTIPLIER: Record<CardRarity, number> = {
  'SSR': 3,
  'SR': 2,
  'R': 1.5,
  'C': 1
}

const RELIC_PRICE_MULTIPLIER = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  boss: 3
}

const BASE_PRICES = {
  card: 50,
  relic: 150,
  potion: 75
}

// ショップアイテムの生成
export const generateShopItems = (
  availableCards: Card[],
  availableRelics: Relic[],
  floor: number
): ShopItem[] => {
  const items: ShopItem[] = []
  const floorMultiplier = 1 + floor * 0.1 // 階層が上がるごとに価格が10%ずつ上昇

  // カードの選択（3枚）
  for (let i = 0; i < 3; i++) {
    const card = availableCards[Math.floor(Math.random() * availableCards.length)]
    items.push({
      id: `shop-card-${i}`,
      type: 'card',
      name: card.name,
      description: card.description,
      cost: Math.floor(
        BASE_PRICES.card *
        CARD_PRICE_MULTIPLIER[card.rarity] *
        floorMultiplier
      ),
      rarity: card.rarity,
      item: card
    })
  }

  // レリックの選択（2個）
  for (let i = 0; i < 2; i++) {
    const relic = availableRelics[Math.floor(Math.random() * availableRelics.length)]
    items.push({
      id: `shop-relic-${i}`,
      type: 'relic',
      name: relic.name,
      description: relic.description,
      cost: Math.floor(
        BASE_PRICES.relic *
        RELIC_PRICE_MULTIPLIER[relic.rarity] *
        floorMultiplier
      ),
      rarity: relic.rarity,
      item: relic
    })
  }

  return items
}