import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './store'
import { startBattle, endTurn, playCard, endBattle, addCardToDeck, restAtCampfire, setGameCleared, resetGame } from './store/slices/gameSlice'
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
    // 報酬金額を保存
    const goldReward = enemy?.goldReward || 0
    setRewardAmount(goldReward)

    dispatch(endBattle())
    dispatch(clearNode(currentNodeId))

    // ボス撃破時のクリア判定
    if (currentNode?.type === 'boss') {
      dispatch(setGameCleared(true))
    } else {
      // 報酬表示
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
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
                    bg-fixed p-4 relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative">
        {/* ゴールド表示 */}
        <GoldDisplay amount={gold} />

        {!isInBattle ? (
          // マップ画面
          <div className="space-y-8">
            <Map />
            {currentNode && (
              <div className="text-center">
                {currentNode.type === 'item' ? (
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-yellow-900/30 max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-yellow-100 mb-2">
                      {currentNode.itemType}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {isCurrentNodeConsumed ? 
                        "このアイテムは既に使用済みです" :
                        "新しいカードを獲得できます"}
                    </p>
                    {!isCurrentNodeConsumed && (
                      <button
                        onClick={() => setShowCardReward(true)}
                        className="battle-button px-6 py-3 text-lg"
                      >
                        カードを見る
                      </button>
                    )}
                  </div>
                ) : currentNode.type === 'rest' ? (
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-yellow-900/30 max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-yellow-100 mb-2">
                      休憩所
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {isCurrentNodeConsumed ? 
                        "この休憩所は既に使用済みです" :
                        "体力を30%回復できます"}
                    </p>
                    {!isCurrentNodeConsumed && (
                      <button
                        onClick={handleRest}
                        className="battle-button px-6 py-3 text-lg"
                      >
                        休憩する
                      </button>
                    )}
                  </div>
                ) : (currentNode.type === 'enemy' || currentNode.type === 'elite' || currentNode.type === 'boss') && (
                  <button
                    onClick={handleStartBattle}
                    className="battle-button px-8 py-4 text-2xl"
                  >
                    戦闘開始
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          // バトル画面
          <div className="space-y-8">
            {/* ターン数表示 */}
            <div className="text-center">
              <span className="inline-block bg-yellow-900/50 px-4 py-2 rounded-full
                           text-yellow-100 font-bold border border-yellow-700/30">
                ターン {turnNumber}
              </span>
            </div>

            {/* 敵ステータス */}
            <div className="flex justify-end">
              <CharacterStats 
                character={enemy} 
                isEnemy 
                nextMove={enemy?.nextMove}
              />
            </div>

            {/* メインバトルエリア */}
            <div className="min-h-[400px] relative flex items-center justify-center">
              {/* エネルギー表示 */}
              <div className="absolute left-4 top-4 w-16 h-16">
                <EnergyDisplay current={energy.current} max={energy.max} />
              </div>

              <button
                onClick={handleEndTurn}
                className="battle-button px-8 py-4 text-xl bg-gradient-to-r 
                         from-yellow-700 to-yellow-900 hover:from-yellow-600 hover:to-yellow-800
                         transform transition-all duration-200 hover:scale-105
                         shadow-lg shadow-yellow-900/50"
              >
                ターン終了
              </button>
            </div>

            {/* プレイヤーステータス */}
            <div>
              <CharacterStats character={player} />
            </div>

            {/* 手札エリア */}
            <div className="flex gap-4 justify-center flex-wrap py-4 min-h-[300px]">
              {hand.map((card) => (
                <CardComponent
                  key={card.id}
                  {...card}
                  onClick={() => handlePlayCard(card)}
                />
              ))}
            </div>
          </div>
        )}

        {/* カード報酬選択画面 */}
        {showCardReward && (
          <CardReward
            onSelectCard={handleSelectCard}
            onSkip={handleSkipCardReward}
          />
        )}

        {/* 回復エフェクト */}
        {showHealEffect && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-6xl animate-bounce text-green-500">
              ❤️
            </div>
          </div>
        )}

        {/* ゴールド報酬表示 */}
        {showGoldReward && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="text-4xl font-bold text-yellow-400 animate-bounce flex items-center gap-2">
              <span>💰</span>
              <span>+{rewardAmount} Gold</span>
            </div>
          </div>
        )}

        {/* クリア画面 */}
        {isGameCleared && (
          <GameClear onRestart={handleRestart} />
        )}

        {/* ゲームオーバー画面 */}
        {isGameOver && (
          <GameOver onRestart={handleRestart} />
        )}

        {/* HPバー */}
        <div className="fixed top-4 left-4 bg-gray-900/80 p-2 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-300 mb-1">
            HP: {player.currentHp}/{player.maxHp}
          </div>
          <div className="w-32 h-4 bg-gray-700 rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400
                       transition-all duration-300"
              style={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
