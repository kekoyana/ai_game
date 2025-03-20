import EnergyDisplay from './EnergyDisplay'

interface BattleAreaProps {
  energy: {
    current: number
    max: number
  }
  onEndTurn: () => void
}

const BattleArea = ({ energy, onEndTurn }: BattleAreaProps) => {
  return (
    <div className="h-32 relative flex items-center justify-center">
      {/* エネルギー表示 */}
      <div className="absolute left-4 top-4 w-16 h-16">
        <EnergyDisplay current={energy.current} max={energy.max} />
      </div>

      <button
        onClick={onEndTurn}
        className="battle-button px-8 py-4 text-xl bg-gradient-to-r 
                  from-yellow-700 to-yellow-900 hover:from-yellow-600 hover:to-yellow-800
                  transform transition-all duration-200 hover:scale-105
                  shadow-lg shadow-yellow-900/50"
      >
        ターン終了
      </button>
    </div>
  )
}

export default BattleArea