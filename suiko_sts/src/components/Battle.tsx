import { useSelector } from 'react-redux'
import { RootState } from '../store'
import CharacterStats from './CharacterStats'
import BattleArea from './BattleArea'
import BattleHand from './BattleHand'
import { Card } from '../data/cards'

interface BattleProps {
  onEndTurn: () => void
  onPlayCard: (card: Card) => void
}

const Battle = ({ onEndTurn, onPlayCard }: BattleProps) => {
  const { enemy, energy, turnNumber, hand, player } = useSelector((state: RootState) => state.game)

  return (
    <div className="space-y-4">
      {/* ターン数表示 */}
      <div className="text-center">
        <span className="inline-block bg-yellow-900/50 px-4 py-2 rounded-full text-yellow-100 font-bold border border-yellow-700/30">
          ターン {turnNumber}
        </span>
      </div>

      {/* 敵ステータス */}
      <div className="flex justify-end">
        <CharacterStats 
          character={enemy} 
          isEnemy 
          enemyAction={enemy?.enemyAction}
        />
      </div>

      {/* メインバトルエリア */}
      <BattleArea
        energy={energy}
        onEndTurn={onEndTurn}
      />

      {/* プレイヤーステータス */}
      <div>
        <CharacterStats character={player} />
      </div>

      {/* 手札エリア */}
      <BattleHand
        hand={hand}
        onPlayCard={onPlayCard}
      />
    </div>
  )
}

export default Battle