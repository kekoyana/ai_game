import { Card as CardType, rewardPool, CardRarity } from '../data/cards'
import Card from './Card'
import { nanoid } from 'nanoid'

const REWARD_CARDS_COUNT = 3

// レア度による出現確率の重み付け
const RARITY_WEIGHTS = {
  SSR: 5,
  SR: 15,
  R: 30,
  C: 50
}

// レア度に基づいてカードを選択する関数
const selectCardByRarity = (cards: CardType[]): CardType => {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)
  let randomNum = Math.random() * totalWeight
  
  // レア度を決定
  let selectedRarity: CardRarity = 'C'
  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    if (randomNum < weight) {
      selectedRarity = rarity as CardRarity
      break
    }
    randomNum -= weight
  }

  // 選択したレア度のカードをフィルタリング
  const cardsOfRarity = cards.filter(card => card.rarity === selectedRarity)
  return cardsOfRarity[Math.floor(Math.random() * cardsOfRarity.length)]
}

// カード報酬を生成する関数
const generateRewardCards = (): CardType[] => {
  const rewardCards: CardType[] = []
  
  // ユニークなカードを選択
  while (rewardCards.length < REWARD_CARDS_COUNT) {
    const card = {...selectCardByRarity(rewardPool), id: nanoid()}
    if (!rewardCards.some(c => c.name === card.name)) {
      rewardCards.push(card)
    }
  }

  return rewardCards
}

interface CardRewardProps {
  onSelectCard: (card: CardType) => void
  onSkip: () => void
}

const CardReward = ({ onSelectCard, onSkip }: CardRewardProps) => {
  const rewardCards = generateRewardCards()

  const getRarityColor = (rarity: CardRarity) => {
    switch (rarity) {
      case 'SSR':
        return 'text-rose-500'
      case 'SR':
        return 'text-purple-500'
      case 'R':
        return 'text-blue-500'
      case 'C':
        return 'text-gray-300'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-xl border border-yellow-900/30 max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-yellow-100 text-center mb-6">
          カードを1枚選択
        </h2>
        
        <div className="flex justify-center gap-6 mb-8">
          {rewardCards.map(card => (
            <div
              key={card.id}
              className="relative group"
              onClick={() => onSelectCard(card)}
            >
              <div className="absolute -inset-1 rounded-lg opacity-75 transition-all
                            group-hover:opacity-100 group-hover:blur-md z-0
                            bg-gradient-to-r from-yellow-600 to-red-600">
              </div>
              <div className="relative z-10">
                {/* レア度表示 */}
                <div className={`absolute -top-6 left-1/2 transform -translate-x-1/2
                              font-bold text-lg ${getRarityColor(card.rarity)}`}>
                  {card.rarity}
                </div>
                <div className="transform transition-transform hover:scale-105 cursor-pointer">
                  <Card {...card} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button
            onClick={onSkip}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300
                     transition-colors"
          >
            スキップ
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardReward