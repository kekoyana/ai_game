import type { Card as CardType } from '../data/cards'
import './Card.css'
import { useState } from 'react'

interface CardProps extends Omit<CardType, 'id' | 'effects'> {
  onClick?: () => void
}

const getTypeIcon = (type: CardProps['type']) => {
  switch (type) {
    case 'attack':
      return '⚔️'
    case 'skill':
      return '🛡️'
    case 'power':
      return '⚡'
  }
}

const getTypeBgClass = (type: CardProps['type']) => {
  switch (type) {
    case 'attack':
      return 'card-bg-attack'
    case 'skill':
      return 'card-bg-skill'
    case 'power':
      return 'card-bg-power'
  }
}

const getRarityClass = (rarity: CardProps['rarity']) => {
  switch (rarity) {
    case 'SSR':
      return 'card-ssr'
    case 'SR':
      return 'card-sr'
    case 'R':
      return 'card-r'
    case 'C':
      return 'card-c'
  }
}

const Card = ({ 
  name, 
  cost, 
  description, 
  type, 
  character,
  rarity,
  flavorText, 
  onClick 
}: CardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`game-card ${getTypeBgClass(type)} ${getRarityClass(rarity)} 
                ${isHovered ? 'card-hover' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        transform: isHovered ? 'translateY(-8px) scale(1.1)' : 'none',
        zIndex: isHovered ? 10 : 1,
        transition: 'all 0.3s ease'
      }}
    >
      {/* コスト */}
      <div className="card-cost">
        {cost}
      </div>

      {/* タイプアイコン */}
      <div className="card-type-icon">
        {getTypeIcon(type)}
      </div>

      {/* カード名 */}
      <div className="card-name">
        {name}
      </div>

      {/* キャラクター名 */}
      <div className="card-character">
        {character}
      </div>

      {/* 説明文 */}
      <div className="card-description">
        {description}
      </div>

      {/* フレーバーテキスト */}
      {flavorText && (
        <div className="card-flavor">
          {flavorText}
        </div>
      )}
    </div>
  )
}

export default Card