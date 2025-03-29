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

 const handlePlayCard = (card: Card) => {
   if (card.name === '鍛冶' && card.type === 'skill') {
     setSelectedKanjiCard(card)
     setShowUpgradeSelect(true)
     return
   }
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CardUpgradeSelect
            cards={hand.filter(card => card !== selectedKanjiCard && card.type !== 'power')}
            onClose={() => {
              setShowUpgradeSelect(false)
              setSelectedKanjiCard(null)
            }}
            onUpgrade={(card) => {
              if (selectedKanjiCard) {
                onPlayCard(selectedKanjiCard)
                dispatch(upgradeCardTemp(card))
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

export default BattleScreen