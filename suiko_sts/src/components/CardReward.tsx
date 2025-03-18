import { useState, useEffect } from 'react'
import { Card } from '../data/cards'
import { generateRewardCards } from '../utils/cardUtils'
import CardComponent from './Card'
import './CardReward.css'

interface CardRewardProps {
  onSelectCard: (card: Card) => void
  onSkip: () => void
}

const CardReward = ({ onSelectCard, onSkip }: CardRewardProps) => {
  const [cards, setCards] = useState<Card[]>([])

  // カードの生成と抽選
  useEffect(() => {
    const rewardCards = generateRewardCards(3)
    setCards(rewardCards)
  }, [])

  return (
    <div className="reward-overlay">
      <div className="reward-container">
        <h2 className="reward-header">
          報酬カードを1枚選択してください
        </h2>

        <div className="reward-cards">
          {cards.map((card, index) => (
            <div 
              key={card.id}
              className={`reward-card-wrapper card-appear card-appear-${index + 1}`}
              onClick={() => onSelectCard(card)}
            >
              <CardComponent {...card} />
            </div>
          ))}
        </div>

        <button
          onClick={onSkip}
          className="skip-button"
        >
          スキップ
        </button>
      </div>
    </div>
  )
}

export default CardReward