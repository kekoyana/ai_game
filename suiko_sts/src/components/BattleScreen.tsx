import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Character } from '../store/slices/gameGeneralSlice'
import { Card } from '../data/cards'
import CharacterStats from './CharacterStats'
import { upgradeCardTemp } from '../store/slices/battleSlice'
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
  const dispatch = useDispatch()
  const [showUpgradeSelect, setShowUpgradeSelect] = useState(false)
  const [selectedKanjiCard, setSelectedKanjiCard] = useState<Card | null>(null)

 console.log('=== BattleScreen Render ===')
 console.log('State:', {
   showUpgradeSelect,
   selectedKanjiCard: selectedKanjiCard?.name,
   handSize: hand.length
 })

 console.log('=== BattleScreen Component State ===', {
   showUpgradeSelect,
   selectedKanjiCard: selectedKanjiCard?.name,
   handCards: hand.map(c => c.name)
 })

 const handlePlayCard = (card: Card) => {
   console.log('=== BattleScreen handlePlayCard ===')
   console.log('Card played:', {
     id: card.id,
     name: card.name,
     type: card.type
   })

   if (card.name === '鍛冶' && card.type === 'skill') {
     console.log('=== Forge Card Flow ===')
     console.log('1. Setting selectedKanjiCard:', card)
     setSelectedKanjiCard(card)
     console.log('2. Setting showUpgradeSelect to true')
     setShowUpgradeSelect(true)
     console.log('3. State after setting:', {
       showUpgradeSelect: true,
       selectedKanjiCard: card.name
     })
     return
   }
   console.log('4. Calling onPlayCard for regular card')
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
      {(() => {
        console.log('=== Checking CardUpgradeSelect Render Condition ===', {
          showUpgradeSelect,
          hasSelectedKanjiCard: !!selectedKanjiCard,
          selectedCardName: selectedKanjiCard?.name
        })
        return showUpgradeSelect && selectedKanjiCard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <CardUpgradeSelect
              cards={hand.filter(card => card !== selectedKanjiCard && card.type !== 'power')}
              forgeCard={selectedKanjiCard}
              onClose={() => {
                console.log('=== CardUpgradeSelect onClose ===')
                console.log('2. Resetting upgrade selection state')
                setShowUpgradeSelect(false)
                setSelectedKanjiCard(null)
              }}
              onUpgrade={(card) => {
                console.log('=== BattleScreen onUpgrade ===')
                if (selectedKanjiCard) {
                  console.log('1. Playing forge card:', selectedKanjiCard.name)
                  onPlayCard(selectedKanjiCard)
                  console.log('2. Dispatching upgradeCardTemp:', card.name)
                  dispatch(upgradeCardTemp(card))
                }
              }}
            />
          </div>
        )
      })()}
    </div>
  )
}

export default BattleScreen