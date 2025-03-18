import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './store'
import { Character, startBattle, endTurn, playCard, endBattle, addCardToDeck, restAtCampfire, setGameCleared, resetGame } from './store/slices/gameSlice'
import { clearNode, resetMap, selectIsNodeConsumed } from './store/slices/mapSlice'
import CardComponent from './components/Card'
import CardReward from './components/CardReward'
import GameClear from './components/GameClear'
import GameOver from './components/GameOver'
import GoldDisplay from './components/GoldDisplay'
import Map from './components/Map'
import CharacterStats from './components/CharacterStats'
import EnergyDisplay from './components/EnergyDisplay'
import { nanoid } from 'nanoid'
import { Card } from './data/cards'
import './App.css'
import { useState, useEffect } from 'react'

// バトル画面のレイアウトを調整
const BattleScreen = ({
  enemy,
  player,
  energy,
  hand,
  turnNumber,
  onEndTurn,
  onPlayCard
}: {
  enemy: Character | null
  player: Character
  energy: { current: number; max: number }
  hand: Card[]
  turnNumber: number
  onEndTurn: () => void
  onPlayCard: (card: Card) => void
}) => (
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

function App() {
  const dispatch = useDispatch()
  const gameState = useSelector((state: RootState) => state.game)
  const mapState = useSelector((state: RootState) => state.map)
  const { 
    player, 
    enemy, 
    energy, 
    isInBattle, 
    hand, 
    turnNumber, 
    isGameCleared,
    isGameOver,
    gold
  } = gameState
  const { currentMap, currentNodeId } = mapState

  const [showCardReward, setShowCardReward] = useState(false)
  const [showHealEffect, setShowHealEffect] = useState(false)
  const [showGoldReward, setShowGoldReward] = useState(false)
  const [rewardAmount, setRewardAmount] = useState(0)

  // 現在のノードが使用済みかどうかチェック
  const isCurrentNodeConsumed = useSelector((state: RootState) => 
    selectIsNodeConsumed(state, currentNodeId)
  )

  // プレイヤーのHPを監視
  useEffect(() => {
    if (player.currentHp <= 0) {
      dispatch(endBattle())
    }
  }, [player.currentHp, dispatch])

  const currentNode = currentMap.nodes.find(node => node.id === currentNodeId)

  const handleStartBattle = () => {
    if (currentNode?.type === 'enemy' || currentNode?.type === 'elite' || currentNode?.type === 'boss') {
      const enemy = {
        id: nanoid(),
        name: currentNode.enemyType || '敵',
        maxHp: currentNode.type === 'boss' ? 100 : currentNode.type === 'elite' ? 70 : 50,
        currentHp: currentNode.type === 'boss' ? 100 : currentNode.type === 'elite' ? 70 : 50,
        block: 0,
        strength: currentNode.type === 'boss' ? 5 : 
                 currentNode.type === 'elite' ? 3 : 
                 2
      }
      dispatch(startBattle(enemy))
    }
  }

  const handleEndTurn = () => {
    dispatch(endTurn())
  }

  const handlePlayCard = (card: Card) => {
    if (energy.current >= card.cost) {
      dispatch(playCard(card))
    }
  }

  const handleVictory = () => {
    const goldReward = enemy?.goldReward || 0
    setRewardAmount(goldReward)
    
    dispatch(endBattle())
    dispatch(clearNode(currentNodeId))

    if (currentNode?.type === 'boss') {
      dispatch(setGameCleared(true))
    } else {
      setShowGoldReward(true)
      setTimeout(() => {
        setShowGoldReward(false)
        setShowCardReward(true)
      }, 1500)
    }
  }

  const handleSelectCard = (card: Card) => {
    dispatch(addCardToDeck(card))
    setShowCardReward(false)
    dispatch(clearNode(currentNodeId))
  }

  const handleSkipCardReward = () => {
    setShowCardReward(false)
    dispatch(clearNode(currentNodeId))
  }

  const handleRest = () => {
    if (!isCurrentNodeConsumed) {
      dispatch(restAtCampfire())
      setShowHealEffect(true)
      setTimeout(() => {
        setShowHealEffect(false)
        dispatch(clearNode(currentNodeId))
      }, 1500)
    }
  }

  const handleRestart = () => {
    dispatch(resetGame())
    dispatch(resetMap())
    dispatch(setGameCleared(false))
  }

  // 敵が倒れたかチェック
  if (enemy && enemy.currentHp <= 0) {
    handleVictory()
  }

  return (
    <div className="app-container">
      <div className="app-content">
        {!isInBattle ? (
          // マップ画面
          <div className="map-container">
            <Map />
            {currentNode && (
              <div className="text-center">
                {currentNode.type === 'item' ? (
                  <div className="event-node">
                    <h3 className="event-title">
                      {currentNode.itemType}
                    </h3>
                    <p className="event-description">
                      {isCurrentNodeConsumed ? 
                        "このアイテムは既に使用済みです" :
                        "新しいカードを獲得できます"}
                    </p>
                    {!isCurrentNodeConsumed && (
                      <button
                        onClick={() => setShowCardReward(true)}
                        className="battle-button action-button"
                      >
                        カードを見る
                      </button>
                    )}
                  </div>
                ) : currentNode.type === 'rest' ? (
                  <div className="event-node">
                    <h3 className="event-title">
                      休憩所
                    </h3>
                    <p className="event-description">
                      {isCurrentNodeConsumed ? 
                        "この休憩所は既に使用済みです" :
                        "体力を30%回復できます"}
                    </p>
                    {!isCurrentNodeConsumed && (
                      <button
                        onClick={handleRest}
                        className="battle-button action-button"
                      >
                        休憩する
                      </button>
                    )}
                  </div>
                ) : (currentNode.type === 'enemy' || currentNode.type === 'elite' || currentNode.type === 'boss') && (
                  <button
                    onClick={handleStartBattle}
                    className="battle-button action-button-large"
                  >
                    戦闘開始
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          // バトル画面
          <BattleScreen
            enemy={enemy}
            player={player}
            energy={energy}
            hand={hand}
            turnNumber={turnNumber}
            onEndTurn={handleEndTurn}
            onPlayCard={handlePlayCard}
          />
        )}

        {/* オーバーレイ要素 */}
        {showCardReward && (
          <CardReward
            onSelectCard={handleSelectCard}
            onSkip={handleSkipCardReward}
          />
        )}

        {showHealEffect && (
          <div className="overlay">
            <div className="heal-effect">
              ❤️
            </div>
          </div>
        )}

        {showGoldReward && (
          <div className="overlay">
            <div className="gold-effect">
              <span>💰</span>
              <span>+{rewardAmount} Gold</span>
            </div>
          </div>
        )}

        {isGameCleared && (
          <GameClear onRestart={handleRestart} />
        )}

        {isGameOver && (
          <GameOver onRestart={handleRestart} />
        )}

        {/* ステータスバー */}
        <div className="status-bar">
          <div className="hp-bar">
            <div className="hp-text">
              HP: {player.currentHp}/{player.maxHp}
            </div>
            <div className="hp-gauge">
              <div
                className="hp-fill"
                style={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
              />
            </div>
          </div>

          <GoldDisplay amount={gold} />
        </div>
      </div>
    </div>
  )
}

export default App
