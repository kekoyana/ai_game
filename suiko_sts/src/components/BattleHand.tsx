import CardComponent from './Card'
import { Card } from '../data/cards'

interface BattleHandProps {
  hand: Card[]
  onPlayCard: (card: Card) => void
}

const BattleHand = ({ hand, onPlayCard }: BattleHandProps) => {
  return (
    <div className="flex gap-4 justify-center flex-wrap py-4">
      {hand.map((card) => (
        <CardComponent
          key={card.id}
          {...card}
          onClick={() => onPlayCard(card)}
        />
      ))}
    </div>
  )
}

export default BattleHand