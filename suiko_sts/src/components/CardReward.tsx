import { useState, useEffect } from 'react'
import { Card } from '../data/cards'
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
    // ここで実際のカード生成ロジックを呼び出す
    // 現在はダミーデータを使用
    const dummyCards: Card[] = [
      {
        id: '1',
        name: '突撃',
        type: 'attack',
        cost: 1,
        description: '8ダメージを与える',
        character: '林沖',
        rarity: 'C',
        effects: { damage: 8 }
      },
      {
        id: '2',
        name: '防御態勢',
        type: 'skill',
        cost: 1,
        description: '8ブロックを得る',
        character: '魯智深',
        rarity: 'C',
        effects: { block: 8 }
      },
      {
        id: '3',
        name: '気合い',
        type: 'power',
        cost: 1,
        description: 'カードを1枚引く',
        character: '武松',
        rarity: 'C',
        effects: { draw: 1 }
      }
    ]
    setCards(dummyCards)
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