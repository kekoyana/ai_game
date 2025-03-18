import { useState, useEffect } from 'react'
import { Card } from '../data/cards'
import { getUpgradeableCards, upgradeCard } from '../utils/cardUtils'
import CardComponent from './Card'
import './CardReward.css' // 同じスタイルを使用

interface CardUpgradeProps {
  deck: Card[]
  onUpgradeCard: (card: Card) => void
  onSkip: () => void
}

const CardUpgrade = ({ deck, onUpgradeCard, onSkip }: CardUpgradeProps) => {
  const [upgradeableCards, setUpgradeableCards] = useState<Card[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  useEffect(() => {
    const cards = getUpgradeableCards(deck)
    // ランダムに3枚（または最大数）を選択
    const randomCards = [...cards].sort(() => Math.random() - 0.5).slice(0, 3)
    setUpgradeableCards(randomCards)
  }, [deck])

  const handleSelectCard = (card: Card) => {
    setSelectedCard(card)
  }

  const handleConfirmUpgrade = () => {
    if (selectedCard) {
      const upgradedCard = upgradeCard(selectedCard)
      onUpgradeCard(upgradedCard)
    }
  }

  return (
    <div className="reward-overlay">
      <div className="reward-container">
        <h2 className="reward-header">
          {selectedCard ? 
            'このカードをアップグレードしますか？' :
            'アップグレードするカードを選択してください'
          }
        </h2>

        <div className="reward-cards">
          {selectedCard ? (
            <div className="flex items-center justify-center gap-8">
              <div className="transform scale-110">
                <CardComponent {...selectedCard} />
              </div>
              <div className="text-yellow-500 text-4xl">→</div>
              <div className="transform scale-110">
                <CardComponent {...upgradeCard(selectedCard)} />
              </div>
            </div>
          ) : (
            upgradeableCards.map((card, index) => (
              <div 
                key={card.id}
                className={`reward-card-wrapper card-appear card-appear-${index + 1}`}
                onClick={() => handleSelectCard(card)}
              >
                <CardComponent {...card} />
              </div>
            ))
          )}
        </div>

        <div className="flex justify-center gap-4">
          {selectedCard ? (
            <>
              <button
                onClick={handleConfirmUpgrade}
                className="battle-button px-6 py-2"
              >
                確定
              </button>
              <button
                onClick={() => setSelectedCard(null)}
                className="battle-button px-6 py-2"
              >
                戻る
              </button>
            </>
          ) : (
            <button
              onClick={onSkip}
              className="skip-button"
            >
              スキップ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CardUpgrade