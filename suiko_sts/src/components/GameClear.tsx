import './GameOverlay.css'

interface GameClearProps {
  onRestart: () => void
}

const GameClear = ({ onRestart }: GameClearProps) => {
  return (
    <div className="game-overlay">
      <div className="overlay-content game-clear-content overlay-appear">
        <h2 className="game-clear-title">
          Complete Victory!
        </h2>
        
        <div className="game-clear-stages">
          <p className="stage-clear">
            第1章: 王倫との決戦を制す ✓
          </p>
          <p className="stage-clear">
            第2章: 林冲との激突を乗り越える ✓
          </p>
          <p className="stage-clear">
            第3章: 高俅を討ち取り、梁山泊の誉れを勝ち取る ✓
          </p>
        </div>

        <p className="game-clear-message">
          三つの激戦を制し、宋江と梁山泊の豪傑たちは歴史に不滅の名を刻んだ！
        </p>

        <div className="game-clear-emoji">
          🏆
        </div>
        
        <button
          onClick={onRestart}
          className="restart-button restart-button-clear"
        >
          もう一度プレイする
        </button>
      </div>
    </div>
  )
}

export default GameClear