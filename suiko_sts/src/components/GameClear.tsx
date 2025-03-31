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
            第1章: 梁山泊飛躍 ✓
          </p>
          <p className="stage-clear">
            第2章: 梁山泊進撃 ✓
          </p>
          <p className="stage-clear">
            第3章: 替天行道 ✓
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
