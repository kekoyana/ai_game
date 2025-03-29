import React from 'react'
import { Card } from '../data/cards'
import CardComponent from './Card'

interface CardUpgradeSelectProps {
  cards: Card[]
  onClose: () => void
  onUpgrade: (card: Card) => void
}

export const CardUpgradeSelect: React.FC<CardUpgradeSelectProps> = ({
  cards,
  onClose,
  onUpgrade
}) => {
  
  const handleUpgrade = (card: Card) => {
    console.log('=== CardUpgradeSelect handleUpgrade ===')
    console.log('Selected card for upgrade:', {
      id: card.id,
      name: card.name,
      effects: card.effects
    })
    
    onUpgrade(card)
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="deck-view modal-content" onClick={e => e.stopPropagation()}>
        <div className="deck-header">
          <h2>一時的にアップグレードするカードを選択</h2>
        </div>
        <div className="deck-grid">
          {cards.map((card: Card) => (
            <div
              key={card.id}
              className="deck-card"
              onClick={() => handleUpgrade(card)}
            >
              <CardComponent {...card} />
            </div>
          ))}
        </div>
        <div className="deck-footer">
          <button
            onClick={onClose}
            className="skip-button"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}

export default CardUpgradeSelect