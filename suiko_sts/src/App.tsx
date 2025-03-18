import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './store'
import { Character, startBattle, endTurn, playCard, endBattle, addCardToDeck, restAtCampfire, setGameCleared, resetGame } from './store/slices/gameSlice'
import { clearNode, resetMap, selectIsNodeConsumed } from './store/slices/mapSlice'
import BattleScreen from './components/BattleScreen'
import CardReward from './components/CardReward'
import GameClear from './components/GameClear'
import GameOver from './components/GameOver'
import GoldDisplay from './components/GoldDisplay'
import Map from './components/Map'
import { nanoid } from 'nanoid'
import { Card } from './data/cards'
import './App.css'
import { useState, useEffect } from 'react'

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
  const [showVictoryMessage, setShowVictoryMessage] = useState(false)
  const [isShowingVictorySequence, setIsShowingVictorySequence] = useState(false)
  const [rewardAmount, setRewardAmount] = useState(0)
  const [defeatedEnemy, setDefeatedEnemy] = useState<string>('')

  // 現在のノードが使用済みかどうかチェック
  const isCurrentNodeConsumed = useSelector((state: RootState) => 
    selectIsNodeConsumed(state, currentNodeId)
  )

  const currentNode = currentMap.nodes.find(node => node.id === currentNodeId)

  // 勝利演出のシーケンス制御
  useEffect(() => {
    if (isShowingVictorySequence) {
      const victorySequence = async () => {
        // 勝利メッセージ表示
        setShowVictoryMessage(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setShowVictoryMessage(false)

        // ゴールド獲得表示
        setShowGoldReward(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        setShowGoldReward(false)

        // ボス以外の場合はカード報酬を表示
        if (currentNode?.type !== 'boss') {
          setShowCardReward(true)
        } else {
          dispatch(setGameCleared(true))
        }

        // 戦闘終了とノードクリア
        dispatch(endBattle())
        dispatch(clearNode(currentNodeId))
        setIsShowingVictorySequence(false)
      }

      victorySequence()
    }
  }, [isShowingVictorySequence, currentNode, dispatch, currentNodeId])

  // プレイヤーのHPを監視
  useEffect(() => {
    if (player.currentHp <= 0) {
      dispatch(endBattle())
    }
  }, [player.currentHp, dispatch])

  // 敵が倒れたかチェック
  useEffect(() => {
    if (enemy && enemy.currentHp <= 0 && !isShowingVictorySequence) {
      const goldReward = enemy.goldReward || 0
      setRewardAmount(goldReward)
      setDefeatedEnemy(enemy.name || '敵')
      setIsShowingVictorySequence(true)
    }
  }, [enemy, isShowingVictorySequence])

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

  const handleSelectCard = (card: Card) => {
    dispatch(addCardToDeck(card))
    setShowCardReward(false)
  }

  const handleSkipCardReward = () => {
    setShowCardReward(false)
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

  return (
    <div className="app-container">
      <div className="app-content">
        {!isInBattle || isShowingVictorySequence ? (
          <div className="map-container">
            <Map />
            {currentNode && !isShowingVictorySequence && (
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
        {showVictoryMessage && (
          <div className="overlay">
            <div className="victory-message">
              <span>⚔️</span>
              <span>{defeatedEnemy}を倒した！</span>
            </div>
          </div>
        )}

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
