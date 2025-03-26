import React from 'react'
import { useDispatch } from 'react-redux'
import { Card } from '../data/cards'
import { upgradeCardTemp } from '../store/slices/battleSlice'
import CardComponent from './Card'

interface CardUpgradeSelectProps {
  cards: Card[]
  onClose: () => void
}

export const CardUpgradeSelect: React.FC<CardUpgradeSelectProps> = ({ cards, onClose }) => {
  const dispatch = useDispatch()

  const handleUpgrade = (card: Card) => {
    console.log('=== CardUpgradeSelect ===')
    console.log('Selected card for upgrade:', card)
    console.log('Card details:', {
      id: card.id,
      name: card.name,
      effects: card.effects
    })
    dispatch(upgradeCardTemp(card))
    console.log('Dispatched upgradeCardTemp action')
    console.log('Calling onClose...')
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