import { useState } from 'react'
import { Character } from '../store/slices/gameGeneralSlice'
import { Card } from '../data/cards'
import CharacterStats from './CharacterStats'
import EnergyDisplay from './EnergyDisplay'
import CardComponent from './Card'
import CardUpgradeSelect from './CardUpgradeSelect'

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
}: BattleScreenProps) => {
  const [showUpgradeSelect, setShowUpgradeSelect] = useState(false)
  const [selectedKanjiCard, setSelectedKanjiCard] = useState<Card | null>(null)

 console.log('=== BattleScreen Render ===')
 console.log('State:', {
   showUpgradeSelect,
   selectedKanjiCard: selectedKanjiCard?.name,
   handSize: hand.length
 })

 const handlePlayCard = (card: Card) => {
   console.log('=== BattleScreen handlePlayCard ===')
   console.log('Card played:', {
     id: card.id,
     name: card.name,
     type: card.type
   })

   if (card.id === 'skill_kanji') {
     console.log('=== Forge Card Flow ===')
     console.log('1. Setting selectedKanjiCard:', card)
     setSelectedKanjiCard(card)
     console.log('2. Setting showUpgradeSelect to true')
     setShowUpgradeSelect(true)
     return
   }
   console.log('3. Calling onPlayCard for regular card')
   onPlayCard(card)
  }

  return (
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
          enemyAction={enemy?.enemyAction}
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
                onClick={() => handlePlayCard(card)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* カードアップグレード選択UI */}
      {showUpgradeSelect && selectedKanjiCard && (
        <CardUpgradeSelect
          cards={hand.filter(card => card !== selectedKanjiCard)}
          onClose={() => {
            console.log('=== CardUpgradeSelect onClose ===')
            if (selectedKanjiCard) {
              console.log('1. Playing forge card:', selectedKanjiCard.name)
              onPlayCard(selectedKanjiCard)
            }
            console.log('2. Resetting upgrade selection state')
            setShowUpgradeSelect(false)
            setSelectedKanjiCard(null)
          }}
        />
      )}
    </div>
  )
}

export default BattleScreen