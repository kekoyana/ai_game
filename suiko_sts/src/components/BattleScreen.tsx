import { Character } from '../store/slices/gameSlice'
import { Card } from '../data/cards'
import CharacterStats from './CharacterStats'
import EnergyDisplay from './EnergyDisplay'
import CardComponent from './Card'

interface BattleScreenProps {
  enemy: Character | null
  player: Character
  energy: { current: number; max: number }
  hand: Card[]
  turnNumber: number
  onEndTurn: () => void
  onPlayCard: (card: Card) => void
}

const BattleScreen = ({
  enemy,
  player,
  energy,
  hand,
  turnNumber,
  onEndTurn,
  onPlayCard
}: BattleScreenProps) => (
  <div className="battle-container">
    {/* ターン数表示 */}
    <div className="turn-display">
      <span className="turn-counter">
        ターン {turnNumber}
      </span>
    </div>

    {/* 敵エリア */}
    <div className="character-area">
      <CharacterStats 
        character={enemy} 
        isEnemy 
        nextMove={enemy?.nextMove}
      />
    </div>

    {/* メインバトルエリア */}
    <div className="battle-area">
      <div className="energy-display">
        <EnergyDisplay current={energy.current} max={energy.max} />
      </div>

      <button
        onClick={onEndTurn}
        className="battle-button"
      >
        ターン終了
      </button>
    </div>

    {/* プレイヤーエリア */}
    <div className="character-area">
      <CharacterStats character={player} />
    </div>

    {/* 手札エリア */}
    <div className="hand-container">
      <div className="hand-cards">
        {hand.map((card) => (
          <div key={card.id} className="card-wrapper">
            <CardComponent
              {...card}
              onClick={() => onPlayCard(card)}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default BattleScreen