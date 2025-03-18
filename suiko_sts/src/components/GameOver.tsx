import './GameOverlay.css'

interface GameOverProps {
  onRestart: () => void
}

const GameOver = ({ onRestart }: GameOverProps) => {
  return (
    <div className="game-overlay">
      <div className="overlay-content game-over-content overlay-appear">
        <h2 className="game-over-title">
          Game Over
        </h2>
        
        <p className="game-over-message">
          宋江は倒れ、梁山泊の野望は潰えた...
        </p>

        <div className="game-over-emoji">
          💀
        </div>
        
        <button
          onClick={onRestart}
          className="restart-button restart-button-gameover"
        >
          再挑戦する
        </button>
      </div>
    </div>
  )
}

export default GameOver