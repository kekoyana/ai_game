import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './store'
import { startBattle, endTurn, playCard, endBattle, addCardToDeck, restAtCampfire, setGameCleared, resetGame } from './store/slices/gameSlice'
import { clearNode, resetMap } from './store/slices/mapSlice'
import CardComponent from './components/Card'
import CardReward from './components/CardReward'
import GameClear from './components/GameClear'
import Map from './components/Map'
import { nanoid } from 'nanoid'
import { Card } from './data/cards'
import './App.css'
import { useState } from 'react'

const CharacterStats = ({ 
  character, 
  isEnemy = false,
  nextMove
}: { 
  character: { 
    name: string; 
    currentHp: number; 
    maxHp: number; 
    block: number;
    description?: string;
  } | null, 
  isEnemy?: boolean,
  nextMove?: {
    type: 'attack' | 'defend' | 'buff'
    value: number
    description: string
  }
}) => {
  if (!character) return null;
  
  return (
    <div className={`character-stats ${isEnemy ? 'flex-row-reverse' : ''} 
                    bg-gray-900/50 p-4 rounded-xl border border-yellow-900/30
                    backdrop-blur-sm`}>
      <div className="space-y-2">
        <div className="text-2xl font-bold text-yellow-100">{character.name}</div>
        <div className="flex items-center gap-3">
          <span className="text-red-400">
            ❤️ {character.currentHp}/{character.maxHp}
          </span>
          {character.block > 0 && (
            <span className="text-blue-400">
              🛡️ {character.block}
            </span>
          )}
        </div>
        {character.description && (
          <div className="text-sm text-gray-400 italic">
            {character.description}
          </div>
        )}
        {nextMove && (
          <div className="text-sm mt-2">
            <span className="text-yellow-500">次の行動: </span>
            <span className="text-white">{nextMove.description}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const EnergyDisplay = ({ current, max }: { current: number; max: number }) => (
  <div className="energy-crystal relative group">
    <div className="absolute -inset-1 bg-blue-500 rounded-full blur-sm opacity-75"></div>
    <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 
                    rounded-full w-full h-full flex items-center justify-center 
                    text-white font-bold text-xl border border-blue-300">
      {current}/{max}
    </div>
  </div>
)

function App() {
  const dispatch = useDispatch()
  const gameState = useSelector((state: RootState) => state.game)
  const mapState = useSelector((state: RootState) => state.map)
  const { player, enemy, energy, isInBattle, hand, turnNumber, isGameCleared } = gameState
  const { currentMap, currentNodeId } = mapState

  const [showCardReward, setShowCardReward] = useState(false)
  const [showHealEffect, setShowHealEffect] = useState(false)

  const currentNode = currentMap.nodes.find(node => node.id === currentNodeId)

  const handleStartBattle = () => {
    if (currentNode?.type === 'enemy' || currentNode?.type === 'elite' || currentNode?.type === 'boss') {
      const enemy = {
        id: nanoid(),
        name: currentNode.enemyType || '敵',
        maxHp: currentNode.type === 'boss' ? 100 : currentNode.type === 'elite' ? 70 : 50,
        currentHp: currentNode.type === 'boss' ? 100 : currentNode.type === 'elite' ? 70 : 50,
        block: 0
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
    dispatch(endBattle())
    dispatch(clearNode(currentNodeId))

    // ボス撃破時のクリア判定
    if (currentNode?.type === 'boss') {
      dispatch(setGameCleared(true))
    } else {
      setShowCardReward(true)
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
    dispatch(restAtCampfire())
    setShowHealEffect(true)
    setTimeout(() => {
      setShowHealEffect(false)
      dispatch(clearNode(currentNodeId))
    }, 1500)
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
                      新しいカードを獲得できます
                    </p>
                    <button
                      onClick={() => setShowCardReward(true)}
                      className="battle-button px-6 py-3 text-lg"
                    >
                      カードを見る
                    </button>
                  </div>
                ) : currentNode.type === 'rest' ? (
                  <div className="p-4 bg-gray-800/50 rounded-lg border border-yellow-900/30 max-w-md mx-auto">
                    <h3 className="text-xl font-bold text-yellow-100 mb-2">
                      休憩所
                    </h3>
                    <p className="text-gray-300 mb-4">
                      体力を30%回復できます
                    </p>
                    <button
                      onClick={handleRest}
                      className="battle-button px-6 py-3 text-lg"
                    >
                      休憩する
                    </button>
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

        {/* クリア画面 */}
        {isGameCleared && (
          <GameClear onRestart={handleRestart} />
        )}
      </div>
    </div>
  )
}

export default App
