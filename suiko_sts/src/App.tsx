import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './store'
import {
  addCardToDeck,
  restAtCampfire,
  setGameCleared,
  resetGame,
  upgradeCard,
  addRelic,
  resetBlock,
  takeDamage,
  addBlock,
  addStrength,
  addHeavyArmor
} from './store/slices/gameGeneralSlice'
import * as gameGeneralActions from './store/slices/gameGeneralSlice'
import {
  startBattle,
  endTurn,
  playCard,
  endBattle
} from './store/slices/battleSlice'
import { clearNode, resetMap, selectIsNodeConsumed, selectCurrentStage } from './store/slices/mapSlice'
import BattleScreen from './components/BattleScreen'
import { Shop } from './components/Shop'
import CardReward from './components/CardReward'
import RelicReward from './components/RelicReward'
import CardUpgrade from './components/CardUpgrade'
import DeckView from './components/DeckView'
import GameClear from './components/GameClear'
import GameOver from './components/GameOver'
import MapSection from './components/MapSection'
import GoldDisplay from './components/GoldDisplay'
import Map from './components/Map'
import RelicDisplay from './components/RelicDisplay'
import { nanoid } from 'nanoid'
import { Card } from './data/cards'
import { Relic } from './data/relics'
import './App.css'
import { useState, useEffect } from 'react'

function App() {
  const dispatch = useDispatch()
  const generalState = useSelector((state: RootState) => state.gameGeneral)
  const battleState = useSelector((state: RootState) => state.battle)
  const mapState = useSelector((state: RootState) => state.map)
  const currentStage = useSelector(selectCurrentStage)
  
  const {
    player,
    isGameCleared,
    isGameOver,
    gold,
    deck,
    relics
  } = generalState

  const {
    enemy,
    energy,
    isInBattle,
    hand,
    turnNumber
  } = battleState
  const { currentMap, currentNodeId } = mapState

  const [showCardReward, setShowCardReward] = useState(false)
  const [showRelicReward, setShowRelicReward] = useState(false)
  const [showHealEffect, setShowHealEffect] = useState(false)
  const [showGoldReward, setShowGoldReward] = useState(false)
  const [showVictoryMessage, setShowVictoryMessage] = useState(false)
  const [showStageCleared, setShowStageCleared] = useState(false)
  const [isShowingVictorySequence, setIsShowingVictorySequence] = useState(false)
  const [showCardUpgrade, setShowCardUpgrade] = useState(false)
  const [showDeckView, setShowDeckView] = useState(false)
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

        // 戦闘終了とノードクリア
        dispatch(endBattle())
        dispatch(clearNode(currentNodeId))
        
        // ボス戦の場合の特別処理
        if (currentNode?.type === 'boss') {
          if (currentStage === 3) {
            // 最終ステージのボスを倒した場合はゲームクリア
            dispatch(setGameCleared(true))
          } else {
            // それ以外のステージのボスを倒した場合はステージクリアメッセージを表示
            setShowStageCleared(true)
            await new Promise(resolve => setTimeout(resolve, 2000))
            setShowStageCleared(false)
            dispatch(clearNode(currentNodeId))
          }
        } else {
          // 通常の戦闘ノードの場合はカード報酬を表示
          setShowCardReward(true)
        }

        setIsShowingVictorySequence(false)
      }

      victorySequence()
    }
  }, [isShowingVictorySequence, currentNode, currentStage, dispatch, currentNodeId])

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
      dispatch(startBattle({ enemy, deck, player, relics }))
    }
  }

  const handleEndTurn = () => {
    dispatch(endTurn())
    if (battleState.incomingDamage > 0) {
      dispatch(takeDamage(battleState.incomingDamage))
    }
    dispatch(resetBlock())
  }

  const handlePlayCard = (card: Card) => {
    if (energy.current >= card.cost) {
      if (card.effects.block) {
        dispatch(addBlock(card.effects.block))
      }
      if (card.effects.strength) {
        dispatch(addStrength(card.effects.strength))
      }
      if (card.effects.heavyArmor) {
        dispatch(addHeavyArmor(card.effects.heavyArmor))
      }
      dispatch(playCard({ card }))
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

  const handleSelectRelic = (relic: Relic) => {
    dispatch(addRelic(relic))
    setShowRelicReward(false)
    dispatch(clearNode(currentNodeId))
  }

  const handleSkipRelic = () => {
    setShowRelicReward(false)
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

  const handleUpgradeCard = (card: Card) => {
    dispatch(upgradeCard(card))
    setShowCardUpgrade(false)
    dispatch(clearNode(currentNodeId))
  }

  const handleSkipUpgrade = () => {
    setShowCardUpgrade(false)
    dispatch(clearNode(currentNodeId))
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
          <MapSection
            currentNode={currentNode}
            isShowingVictorySequence={isShowingVictorySequence}
            isCurrentNodeConsumed={isCurrentNodeConsumed}
            handleStartBattle={handleStartBattle}
            handleRest={handleRest}
            setShowCardReward={setShowCardReward}
            setShowRelicReward={setShowRelicReward}
            setShowCardUpgrade={setShowCardUpgrade}
            currentNodeId={currentNodeId}
          />
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

        {showStageCleared && (
          <div className="overlay">
            <div className="stage-clear-message">
              <span>🏆</span>
              <span>ステージ {currentStage} クリア！</span>
              <span>次のステージへ進みます</span>
            </div>
          </div>
        )}

        {showCardReward && (
          <CardReward
            onSelectCard={handleSelectCard}
            onSkip={handleSkipCardReward}
          />
        )}

        {showRelicReward && (
          <RelicReward
            onSelectRelic={handleSelectRelic}
            onSkip={handleSkipRelic}
          />
        )}

        {showCardUpgrade && (
          <CardUpgrade
            deck={deck}
            onUpgradeCard={handleUpgradeCard}
            onSkip={handleSkipUpgrade}
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

          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowDeckView(true)}
              className="deck-view-button"
            >
              デッキ一覧
            </button>
            <GoldDisplay amount={gold} />
            <RelicDisplay relics={relics} />
          </div>

          {/* デッキ一覧オーバーレイ */}
          {showDeckView && (
            <div className="game-overlay" onClick={() => setShowDeckView(false)}>
              <DeckView onClose={() => setShowDeckView(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
