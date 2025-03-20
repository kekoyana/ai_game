import { Card, CardRarity, rewardPool } from '../data/cards'

// レアリティごとの出現確率
const RARITY_WEIGHTS = {
  'SSR': 5,
  'SR': 15,
  'R': 35,
  'C': 45,
}

// レアリティに基づいてカードをフィルタリング
const filterCardsByRarity = (cards: Card[], rarity: CardRarity): Card[] => {
  return cards.filter(card => card.rarity === rarity)
}

// レアリティに応じたランダムな選択
const selectRandomCardByRarity = (cards: Card[]): Card | null => {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    if (random < weight) {
      const cardsOfRarity = filterCardsByRarity(cards, rarity as CardRarity)
      if (cardsOfRarity.length > 0) {
        return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)]
      }
    }
    random -= weight
  }
  return null
}

// 報酬カードをランダムに生成
export const generateRewardCards = (count: number = 3): Card[] => {
  const result: Card[] = []
  const availableCards = [...rewardPool]

  for (let i = 0; i < count; i++) {
    const selectedCard = selectRandomCardByRarity(availableCards)
    if (selectedCard) {
      // 選択されたカードをプールから削除（重複防止）
      const index = availableCards.findIndex(card => card.name === selectedCard.name)
      if (index !== -1) {
        availableCards.splice(index, 1)
      }
      result.push({
        ...selectedCard,
        id: `${selectedCard.name}-${Date.now()}-${i}` // ユニークなIDを生成
      })
    }
  }

  return result
}

// カードをアップグレードする関数
export const upgradeCard = (card: Card): Card => {
  const upgradedCard = { ...card }

  // 効果のアップグレード
  const effects = { ...card.effects }
  if (effects.damage) effects.damage = Math.floor(effects.damage * 1.5)
  if (effects.block) effects.block = Math.floor(effects.block * 1.5)
  if (effects.strength) effects.strength += 1
  if (effects.draw) effects.draw += 1

  // カード名と説明の更新
  upgradedCard.name = `${card.name}+`
  upgradedCard.effects = effects

  // 説明文の更新
  upgradedCard.description = card.description.replace(/\d+/g, (match) => {
    if (effects.damage && match === String(card.effects.damage)) {
      return String(effects.damage)
    }
    if (effects.block && match === String(card.effects.block)) {
      return String(effects.block)
    }
    if (effects.strength && match === String(card.effects.strength)) {
      return String(effects.strength)
    }
    if (effects.draw && match === String(card.effects.draw)) {
      return String(effects.draw)
    }
    return match
  })

  return upgradedCard
}

// デッキからアップグレード可能なカードをフィルタリング
export const getUpgradeableCards = (deck: Card[]): Card[] => {
  return deck.filter(card => !card.name.endsWith('+'))
}