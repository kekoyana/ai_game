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