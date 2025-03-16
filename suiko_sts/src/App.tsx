import { useSelector, useDispatch } from 'react-redux'
import { RootState } from './store'
import { startBattle, endTurn, playCard } from './store/slices/gameSlice'
import CardComponent from './components/Card'
import { nanoid } from 'nanoid'
import { enemies } from './store/slices/gameSlice'
import { Card } from './data/cards'
import './App.css'

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
  const { player, enemy, energy, isInBattle, hand, turnNumber } = gameState

  const handleStartBattle = () => {
    // ランダムな敵を選択
    const randomEnemy = { ...enemies[Math.floor(Math.random() * enemies.length)], id: nanoid() }
    dispatch(startBattle(randomEnemy))
  }

  const handleEndTurn = () => {
    dispatch(endTurn())
  }

  const handlePlayCard = (card: Card) => {
    if (energy.current >= card.cost) {
      dispatch(playCard(card))
    }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
                    bg-fixed p-4 relative overflow-hidden">
      {/* 背景の装飾 */}
      <div className="absolute inset-0 opacity-5 bg-repeat"
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v20h2v2H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20z' fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
           }}></div>

      <div className="max-w-5xl mx-auto relative">
        {/* バトル画面 */}
        <div className="space-y-8">
          {/* ターン数表示 */}
          {isInBattle && (
            <div className="text-center">
              <span className="inline-block bg-yellow-900/50 px-4 py-2 rounded-full
                           text-yellow-100 font-bold border border-yellow-700/30">
                ターン {turnNumber}
              </span>
            </div>
          )}

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

            {!isInBattle ? (
              <button
                onClick={handleStartBattle}
                className="battle-button px-8 py-4 text-2xl bg-gradient-to-r 
                         from-red-700 to-red-900 hover:from-red-600 hover:to-red-800
                         transform transition-all duration-200 hover:scale-105
                         shadow-lg shadow-red-900/50"
              >
                戦闘開始
              </button>
            ) : (
              <button
                onClick={handleEndTurn}
                className="battle-button px-8 py-4 text-xl bg-gradient-to-r 
                         from-yellow-700 to-yellow-900 hover:from-yellow-600 hover:to-yellow-800
                         transform transition-all duration-200 hover:scale-105
                         shadow-lg shadow-yellow-900/50"
              >
                ターン終了
              </button>
            )}
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
      </div>
    </div>
  )
}

export default App
