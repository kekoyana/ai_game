import './GameOverlay.css'

interface GameClearProps {
  onRestart: () => void
}

const GameClear = ({ onRestart }: GameClearProps) => {
  return (
    <div className="game-overlay">
      <div className="overlay-content game-clear-content overlay-appear">
        <h2 className="game-clear-title">
          Game Clear!
        </h2>
        
        <p className="game-clear-message">
          高俅を倒し、宋江と梁山泊の豪傑たちは歴史に名を刻んだ！
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